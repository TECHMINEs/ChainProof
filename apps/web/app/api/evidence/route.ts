import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { uploadImageBuffer } from '@/lib/storage/cloudinaryClient';
import { uploadJSONToIPFS } from '@/lib/ipfs/pinataClient';
import { hashEvidenceMetadata, extractExifFromBuffer } from '@chainproof/crypto/src/hash';
import { addReportJob } from '@/lib/queue/reportQueue';
import { logAudit } from '@/lib/audit/logger';
import { evidenceAccessFilter } from '@/lib/evidence/access';
import { EVIDENCE_TYPES, EVIDENCE_STATUSES } from '@chainproof/types';
import QRCode from 'qrcode';
import { z } from 'zod';

const evidenceQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().max(100).optional(),
  status: z.nativeEnum(EVIDENCE_STATUSES).optional(),
  type: z.nativeEnum(EVIDENCE_TYPES).optional(),
});

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const query = evidenceQuerySchema.parse(Object.fromEntries(searchParams));
    const skip = (query.page - 1) * query.pageSize;

    // C1: Role-based access control scoping
    const where: Prisma.EvidenceWhereInput = {};

    if (query.search) {
      where.OR = [
        { evidenceNumber: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.status) where.status = query.status;
    if (query.type) where.type = query.type;

    // AND keeps any search OR-clause intact while scoping to what this role may see
    where.AND = [await evidenceAccessFilter(session)];

    const [evidence, total] = await Promise.all([
      prisma.evidence.findMany({
        where,
        skip,
        take: query.pageSize,
        orderBy: { createdAt: 'desc' },
        include: { registrar: { select: { name: true } }, case: { select: { caseNumber: true, title: true } } }
      }),
      prisma.evidence.count({ where }),
    ]);

    return NextResponse.json({ evidence, total, page: query.page, pageSize: query.pageSize });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation Error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await request.formData();
    const caseId = formData.get('caseId') as string;
    const typeResult = z.nativeEnum(EVIDENCE_TYPES).safeParse(formData.get('type') ?? EVIDENCE_TYPES.OTHER);
    if (!typeResult.success) {
      return NextResponse.json({ error: 'Invalid evidence type' }, { status: 400 });
    }
    const type = typeResult.data;
    const description = formData.get('description') as string;
    const quantity = parseInt(formData.get('quantity') as string || '1');
    const unit = formData.get('unit') as string;
    const collectionDate = formData.get('collectionDate') as string;
    const collectionLocation = formData.get('collectionLocation') as string;
    const collectionLatitude = parseFloat(formData.get('collectionLatitude') as string) || undefined;
    const collectionLongitude = parseFloat(formData.get('collectionLongitude') as string) || undefined;

    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const exifData = await extractExifFromBuffer(buffer, collectionLatitude, collectionLongitude);
    const imageUrl = await uploadImageBuffer(buffer);

    // B1: Unique evidence number using DB counter in a transaction
    const evidence = await prisma.$transaction(async (tx) => {
      // Upsert counter, increment atomically
      const counter = await tx.evidenceCounter.upsert({
        where: { id: 1 },
        update: { sequence: { increment: 1 } },
        create: { id: 1, sequence: 1 },
      });
      const year = new Date().getFullYear();
      const seq = String(counter.sequence).padStart(6, '0');
      const evidenceNumber = `EV-${year}-${seq}`;

      const metadata = {
        evidenceNumber,
        caseId,
        description,
        quantity,
        unit,
        collectionDate,
        collectionLocation,
        registrarId: session.user.id,
        imageUrl
      };

      const sha256Hash = hashEvidenceMetadata(metadata);
      const ipfsCid = await uploadJSONToIPFS(metadata);
      const qrDataUrl = await QRCode.toDataURL(`chainproof://evidence/${evidenceNumber}`);

      const ev = await tx.evidence.create({
        data: {
          evidenceNumber,
          caseId,
          registrarId: session.user.id,
          type,
          status: EVIDENCE_STATUSES.REGISTERED,
          description,
          quantity,
          unit,
          collectionDate: new Date(collectionDate),
          collectionLocation,
          collectionLatitude,
          collectionLongitude,
          exifData: exifData as unknown as Prisma.InputJsonValue,
          imageUrls: [imageUrl],
          ipfsCid,
          sha256Hash,
          qrCodeUrl: qrDataUrl,
        }
      });

      // B2: Maintain evidenceCount on Case
      await tx.case.update({
        where: { id: caseId },
        data: { evidenceCount: { increment: 1 } }
      });

      return ev;
    });

    await addReportJob(evidence.id, caseId, 'CERTIFICATE', session.user.id);

    const ip = request.headers.get('x-forwarded-for') ?? undefined;
    const ua = request.headers.get('user-agent') ?? undefined;
    // D15: Audit log for evidence creation
    await logAudit({
      userId: session.user.id,
      action: 'EVIDENCE_CREATED',
      entityType: 'Evidence',
      entityId: evidence.id,
      details: { evidenceNumber: evidence.evidenceNumber, caseId },
      ipAddress: ip,
      userAgent: ua,
      severity: 'MEDIUM',
    });

    return NextResponse.json({ data: evidence }, { status: 201 });
  } catch (error) {
    console.error('Evidence POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

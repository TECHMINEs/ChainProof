import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { contractClient } from '@/lib/blockchain/contractClient';
import { serverError } from '@/lib/http/errors';

// Public verification portal endpoint (NO AUTH required)
export async function GET(request: Request, { params }: { params: { evidenceId: string } }) {
  try {
    // Attempt to find by ID or evidenceNumber
    const evidence = await prisma.evidence.findFirst({
      where: {
        OR: [
          { id: params.evidenceId },
          { evidenceNumber: params.evidenceId }
        ]
      },
      include: { case: true }
    });

    if (!evidence) {
      return NextResponse.json({ error: 'Evidence not found' }, { status: 404 });
    }

    let blockchainVerified = false;
    try {
      const record = await contractClient.evidenceRecords(evidence.evidenceNumber);
      if (record.exists && record.metadataHash === evidence.sha256Hash) {
        blockchainVerified = true;
      }
    } catch {
      // Contract call failed, treat as unverified
    }

    const result = {
      evidenceNumber: evidence.evidenceNumber,
      caseNumber: evidence.case?.caseNumber || 'N/A',
      currentStatus: evidence.status,
      integrityScore: evidence.integrityScore,
      blockchainVerified,
      lastVerifiedAt: evidence.lastVerifiedAt,
      transferCount: evidence.transferCount,
      verificationToken: evidence.sha256Hash, // Simplified token representation
    };

    return NextResponse.json({ data: result });
  } catch (error) {
    return serverError('/api/verify/[evidenceId]', error, 'Internal Server Error');
  }
}

/**
 * B6: Report Queue Worker
 * Run this as a separate process: npx ts-node apps/web/src/workers/reportWorker.ts
 */
import { reportQueue } from '../lib/queue/reportQueue';
import prisma from '../lib/prisma';
import QRCode from 'qrcode';
import { sendEmail } from '../lib/notifications/emailService';
import { uploadFileBuffer } from '../lib/storage/cloudinaryClient';

const APP_ORIGIN = process.env.EXPECTED_ORIGIN || 'http://localhost:3000';

console.log('[ReportWorker] Starting report queue worker...');

reportQueue.process(async (job) => {
  const { evidenceId, caseId, reportType, generatedById } = job.data;

  console.log(`[ReportWorker] Processing ${reportType} for evidence ${evidenceId}`);

  try {
    // Fetch all needed data
    const [evidence, user] = await Promise.all([
      prisma.evidence.findUnique({
        where: { id: evidenceId },
        include: {
          case: true,
          registrar: true,
          transfers: { include: { fromUser: true, toUser: true } },
        },
      }),
      prisma.user.findUnique({ where: { id: generatedById } }),
    ]);

    if (!evidence || !user) {
      throw new Error(`Evidence or user not found for report job`);
    }

    // Dynamic import to avoid loading heavy PDF libraries in the main process
    const { generateCertificateOfAuthenticity } = await import('@chainproof/crypto/src/pdfGenerator');

    // QR code links to the public verification portal for this exhibit
    const qrCodeDataUrl = await QRCode.toDataURL(`${APP_ORIGIN}/verify/${evidence.id}`, { margin: 1, width: 256 });

    const pdfBuffer = await generateCertificateOfAuthenticity({
      evidence: {
        evidenceNumber: evidence.evidenceNumber,
        description: evidence.description,
        sha256Hash: evidence.sha256Hash || '',
        ipfsCid: evidence.ipfsCid || '',
        blockchainTxHash: evidence.blockchainTxHash || '',
        integrityScore: evidence.integrityScore,
        case: { caseNumber: evidence.case?.caseNumber || '' },
        collectionDate: evidence.collectionDate,
        collectionLocation: evidence.collectionLocation,
        registrar: { name: evidence.registrar?.name || '' },
        type: evidence.type,
        status: evidence.status,
      },
      transfers: evidence.transfers.map(t => ({
        fromUser: { name: t.fromUser?.name || '' },
        toUser: { name: t.toUser?.name || '' },
        transferredAt: t.transferredAt,
        purpose: t.purpose,
        status: t.status,
      })),
      qrCodeDataUrl,
      documentHash: evidence.sha256Hash || 'N/A',
    });

    // Persist the PDF so /api/reports/download/[reportId] can serve it
    const pdfUrl = await uploadFileBuffer(pdfBuffer);

    // Save report record
    const report = await prisma.report.create({
      data: {
        evidenceId,
        caseId: caseId || undefined,
        generatedById,
        reportType,
        title: `${reportType === 'CERTIFICATE' ? 'Certificate of Authenticity' : 'Full Chain Report'} — ${evidence.evidenceNumber}`,
        pdfUrl,
      }
    });

    // Notify user
    await prisma.notification.create({
      data: {
        userId: generatedById,
        type: 'REPORT_READY',
        title: 'Report Ready',
        message: `Your ${reportType} report for ${evidence.evidenceNumber} is ready.`,
        metadata: { reportId: report.id },
      }
    });

    // Email notification
    if (user.email) {
      await sendEmail(
        user.email,
        `Report Ready: ${evidence.evidenceNumber}`,
        `<p>Your <strong>${reportType}</strong> report for evidence <strong>${evidence.evidenceNumber}</strong> has been generated and is available in your ChainProof dashboard.</p>`
      ).catch(err => console.warn('[ReportWorker] Email failed:', err));
    }

    console.log(`[ReportWorker] Completed report for ${evidenceId}`);
    return { success: true, reportId: report.id };
  } catch (error) {
    console.error(`[ReportWorker] Failed to generate report:`, error);
    throw error; // Bull will retry based on job config
  }
});

reportQueue.on('completed', (job) => {
  console.log(`[ReportWorker] Job ${job.id} completed`);
});

reportQueue.on('failed', (job, err) => {
  console.error(`[ReportWorker] Job ${job.id} failed:`, err.message);
});

// Keep process alive
process.on('SIGTERM', async () => {
  await reportQueue.close();
  process.exit(0);
});

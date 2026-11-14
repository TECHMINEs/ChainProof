import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { contractClient } from '@/lib/blockchain/contractClient';
import { computeIntegrityScore, hashEvidenceMetadata } from '@chainproof/crypto/src/hash';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const evidence = await prisma.evidence.findUnique({
      where: { id: params.id },
    });

    if (!evidence) {
      return NextResponse.json({ error: 'Evidence not found' }, { status: 404 });
    }

    // 1. Re-hash DB values
    const metadataForHash = {
      evidenceNumber: evidence.evidenceNumber,
      caseId: evidence.caseId,
      description: evidence.description,
      quantity: evidence.quantity,
      unit: evidence.unit || 'null',
      collectionDate: new Date(evidence.collectionDate).toISOString(),
      collectionLocation: evidence.collectionLocation,
      registrarId: evidence.registrarId,
      imageUrl: evidence.imageUrls[0] || 'null'
    };
    const currentDbHash = hashEvidenceMetadata(metadataForHash);
    const dbMatches = currentDbHash === evidence.sha256Hash;

    // 2. Fetch IPFS Hash
    let ipfsMatches = false;
    let ipfsHash = '';
    if (evidence.ipfsCid) {
      try {
        const ipfsRes = await fetch(`https://gateway.pinata.cloud/ipfs/${evidence.ipfsCid}`);
        if (ipfsRes.ok) {
          const ipfsData = await ipfsRes.json();
          ipfsHash = hashEvidenceMetadata(ipfsData);
          ipfsMatches = ipfsHash === evidence.sha256Hash;
        }
      } catch {
        console.warn('IPFS Fetch failed');
      }
    }

    // 3. Fetch Contract Hash
    let chainMatches = false;
    let contractHash = '';
    try {
      const record = await contractClient.evidenceRecords(evidence.evidenceNumber);
      if (record.exists) {
        contractHash = record.metadataHash;
        chainMatches = contractHash === evidence.sha256Hash;
      }
    } catch {
      console.warn('Contract Fetch failed');
    }

    const ipfsChecked = !!evidence.ipfsCid;
    const chainChecked = !!contractHash;
    const integrityScore = computeIntegrityScore(dbMatches, ipfsChecked, ipfsMatches, chainChecked, chainMatches);

    const discrepancies = [];
    if (!dbMatches) discrepancies.push({ layer: 'db', expected: evidence.sha256Hash, received: currentDbHash, description: 'DB data altered' });
    if (ipfsChecked && !ipfsMatches) discrepancies.push({ layer: 'ipfs', expected: evidence.sha256Hash, received: ipfsHash, description: 'IPFS data mismatch' });
    if (chainChecked && !chainMatches) discrepancies.push({ layer: 'chain', expected: evidence.sha256Hash, received: contractHash, description: 'Contract data mismatch' });

    // Update DB with latest score if changed
    if (integrityScore !== evidence.integrityScore) {
      await prisma.evidence.update({
        where: { id: params.id },
        data: { integrityScore, lastVerifiedAt: new Date() }
      });

      // D9: Send tamper alert email to admins if integrity compromised
      if (integrityScore < 100) {
        try {
          const admins = await prisma.user.findMany({ where: { role: 'ADMIN', isActive: true } });
          const { sendEmail } = await import('@/lib/notifications/emailService');
          for (const admin of admins) {
            await sendEmail(
              admin.email,
              `TAMPER ALERT: Evidence ${evidence.evidenceNumber}`,
              `<p><strong>Integrity score dropped to ${integrityScore}/100</strong> for evidence <strong>${evidence.evidenceNumber}</strong>.</p><p>Discrepancies detected: ${JSON.stringify(discrepancies)}</p>`
            );
          }
        } catch (e) {
          console.warn('Tamper alert email failed:', e);
        }
      }
    }

    const result = {
      evidenceId: params.id,
      dbStatus: { checked: true, hash: currentDbHash, matches: dbMatches },
      ipfsStatus: { checked: ipfsChecked, hash: ipfsHash, matches: ipfsMatches },
      chainStatus: { checked: chainChecked, hash: contractHash, matches: chainMatches },
      integrityScore,
      discrepancies,
      verifiedAt: new Date().toISOString()
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Integrity check error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

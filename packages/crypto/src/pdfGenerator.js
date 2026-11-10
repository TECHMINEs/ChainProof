"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCertificateOfAuthenticity = generateCertificateOfAuthenticity;
exports.generateFullChainReport = generateFullChainReport;
const jspdf_1 = require("jspdf");
const jspdf_autotable_1 = __importDefault(require("jspdf-autotable"));
async function generateCertificateOfAuthenticity(options) {
    const { evidence, transfers, qrCodeDataUrl, documentHash } = options;
    try {
        const doc = new jspdf_1.jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4',
        });
        // Header
        doc.setFontSize(24);
        doc.text('Certificate of Authenticity', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
        // Seal Stamp Placeholder (simplified for this context)
        doc.setFillColor(200, 0, 0);
        // Kept above the first table (which starts at y=40) so it never overlaps content
        doc.circle(270, 22, 12, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.text('SEAL', 270, 23, { align: 'center' });
        doc.setTextColor(0, 0, 0);
        // Data Table
        (0, jspdf_autotable_1.default)(doc, {
            startY: 40,
            head: [['Field', 'Value']],
            body: [
                ['Evidence Number', evidence.evidenceNumber],
                ['Case Number', evidence.case?.caseNumber || 'N/A'],
                ['Type', evidence.type],
                ['Status', evidence.status],
                ['Description', evidence.description],
                ['Collection Date', new Date(evidence.collectionDate).toLocaleString()],
                ['Integrity Score', `${evidence.integrityScore}/100`],
                ['Registrar', evidence.registrar?.name || 'N/A'],
                ['Collection Location', evidence.collectionLocation || 'N/A'],
                ['SHA-256 Hash', evidence.sha256Hash || 'N/A'],
                ['IPFS CID', evidence.ipfsCid || 'Not pinned'],
                ['Blockchain TX', evidence.blockchainTxHash || 'Pending sync'],
            ],
            theme: 'grid',
            headStyles: { fillColor: [220, 38, 38] },
        });
        // Transfer History Table
        const finalY = doc.lastAutoTable?.finalY || 100;
        doc.setFontSize(16);
        doc.text('Transfer History', 14, finalY + 15);
        const transferBody = transfers.map(t => [
            new Date(t.transferredAt).toLocaleString(),
            t.fromUser?.name || 'N/A',
            t.toUser?.name || 'N/A',
            t.purpose,
            t.status
        ]);
        (0, jspdf_autotable_1.default)(doc, {
            startY: finalY + 20,
            head: [['Date', 'From', 'To', 'Purpose', 'Status']],
            body: transferBody,
            theme: 'striped',
            headStyles: { fillColor: [17, 17, 17] },
        });
        // Verification block flows after the transfer table (new page if it would not fit)
        const pageHeight = doc.internal.pageSize.getHeight();
        let blockY = (doc.lastAutoTable?.finalY ?? finalY + 20) + 8;
        if (blockY + 34 > pageHeight - 10) {
            doc.addPage();
            blockY = 20;
        }
        doc.addImage(qrCodeDataUrl, 'PNG', 14, blockY, 30, 30);
        doc.setFontSize(10);
        doc.text('Scan to verify this exhibit on the public ChainProof portal.', 50, blockY + 10);
        doc.text(`Document Hash: ${documentHash}`, 50, blockY + 17);
        doc.text(`Generated At: ${new Date().toISOString()}`, 50, blockY + 24);
        const arrayBuffer = doc.output('arraybuffer');
        return Buffer.from(arrayBuffer);
    }
    catch (error) {
        throw new Error('Failed to generate Certificate of Authenticity PDF');
    }
}
async function generateFullChainReport(evidenceList, transfers, merkleCheckpoints) {
    try {
        const doc = new jspdf_1.jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
        });
        // Cover Page
        doc.setFontSize(28);
        doc.text('Full Chain of Custody Report', doc.internal.pageSize.getWidth() / 2, 80, { align: 'center' });
        doc.setFontSize(14);
        doc.text(`Generated: ${new Date().toLocaleString()}`, doc.internal.pageSize.getWidth() / 2, 100, { align: 'center' });
        doc.text(`Total Evidence Items: ${evidenceList.length}`, doc.internal.pageSize.getWidth() / 2, 110, { align: 'center' });
        doc.text(`Total Transfers: ${transfers.length}`, doc.internal.pageSize.getWidth() / 2, 120, { align: 'center' });
        // Evidence Sections
        for (const item of evidenceList) {
            doc.addPage();
            doc.setFontSize(20);
            doc.text(`Evidence Item: ${item.evidenceNumber}`, 14, 20);
            (0, jspdf_autotable_1.default)(doc, {
                startY: 30,
                head: [['Field', 'Value']],
                body: [
                    ['Description', item.description],
                    ['Type', item.type],
                    ['Status', item.status],
                    ['Integrity', `${item.integrityScore}/100`],
                    ['SHA-256 Hash', item.sha256Hash || 'N/A'],
                    ['Blockchain TX', item.blockchainTxHash || 'N/A']
                ],
                theme: 'grid',
            });
            const itemTransfers = transfers.filter(t => t.evidenceId === item.id);
            if (itemTransfers.length > 0) {
                const finalY = doc.lastAutoTable?.finalY || 80;
                doc.setFontSize(16);
                doc.text('Transfers', 14, finalY + 15);
                (0, jspdf_autotable_1.default)(doc, {
                    startY: finalY + 20,
                    head: [['Date', 'From', 'To', 'Purpose']],
                    body: itemTransfers.map(t => [
                        new Date(t.transferredAt).toLocaleString(),
                        t.fromUser?.name || 'N/A',
                        t.toUser?.name || 'N/A',
                        t.purpose
                    ]),
                    theme: 'striped',
                });
            }
        }
        // Merkle Summary Last Page
        doc.addPage();
        doc.setFontSize(20);
        doc.text('Merkle Checkpoints Summary', 14, 20);
        const merkleBody = merkleCheckpoints.map(m => [
            new Date(m.createdAt).toLocaleString(),
            m.batchId,
            m.merkleRoot,
            m.txHash || 'Pending'
        ]);
        (0, jspdf_autotable_1.default)(doc, {
            startY: 30,
            head: [['Date', 'Batch ID', 'Merkle Root', 'TX Hash']],
            body: merkleBody,
            theme: 'grid',
        });
        const arrayBuffer = doc.output('arraybuffer');
        return Buffer.from(arrayBuffer);
    }
    catch (error) {
        throw new Error('Failed to generate Full Chain Report PDF');
    }
}

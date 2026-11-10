import type { Evidence, Transfer, MerkleCheckpoint } from '@chainproof/types';
type DateLike = Date | string;
/** Fields the certificate prints for an exhibit (a subset of the Prisma Evidence row). */
export interface CertificateEvidence {
    evidenceNumber: string;
    description: string;
    type: string;
    status: string;
    integrityScore: number;
    collectionDate: DateLike;
    collectionLocation?: string;
    sha256Hash?: string;
    ipfsCid?: string;
    blockchainTxHash?: string;
    case?: {
        caseNumber: string;
    } | null;
    registrar?: {
        name: string;
    } | null;
}
/** Fields the certificate prints for each custody hand-off. */
export interface CertificateTransfer {
    transferredAt: DateLike;
    purpose: string;
    status: string;
    fromUser?: {
        name: string;
    } | null;
    toUser?: {
        name: string;
    } | null;
}
export declare function generateCertificateOfAuthenticity(options: {
    evidence: CertificateEvidence;
    transfers: CertificateTransfer[];
    qrCodeDataUrl: string;
    documentHash: string;
}): Promise<Buffer>;
export declare function generateFullChainReport(evidenceList: Evidence[], transfers: Transfer[], merkleCheckpoints: MerkleCheckpoint[]): Promise<Buffer>;
export {};

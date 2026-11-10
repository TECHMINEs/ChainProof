import type { ExifData } from '@chainproof/types';
export declare function hashEvidenceMetadata(metadata: Record<string, any>): string;
export declare function hashTransferData(evidenceId: string, fromUserId: string, toUserId: string, purpose: string, timestamp: string): string;
export declare function computeIntegrityScore(dbMatches: boolean, ipfsChecked: boolean, ipfsMatches: boolean, chainChecked: boolean, chainMatches: boolean): number;
export declare function extractExifFromBuffer(buffer: Buffer, expectedLatitude?: number, expectedLongitude?: number): Promise<ExifData>;
export declare function verifyFileHash(buffer: Buffer, expectedHash: string): boolean;

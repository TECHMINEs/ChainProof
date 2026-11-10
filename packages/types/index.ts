// ── Enums ──
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  OFFICER: 'OFFICER',
  REGISTRAR: 'REGISTRAR',
  AUDITOR: 'AUDITOR',
} as const;
export type UserRole = keyof typeof USER_ROLES;

export const EVIDENCE_STATUSES = {
  REGISTERED: 'REGISTERED',
  IN_TRANSIT: 'IN_TRANSIT',
  STORED: 'STORED',
  VERIFIED: 'VERIFIED',
  FLAGGED: 'FLAGGED',
  ARCHIVED: 'ARCHIVED',
} as const;
export type EvidenceStatus = keyof typeof EVIDENCE_STATUSES;

export const EVIDENCE_TYPES = {
  DOCUMENT: 'DOCUMENT',
  PHYSICAL: 'PHYSICAL',
  DIGITAL: 'DIGITAL',
  BIOMETRIC: 'BIOMETRIC',
  WEAPON: 'WEAPON',
  DRUG: 'DRUG',
  OTHER: 'OTHER',
} as const;
export type EvidenceType = keyof typeof EVIDENCE_TYPES;

export const TRANSFER_STATUSES = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  REJECTED: 'REJECTED',
  FAILED: 'FAILED',
} as const;
export type TransferStatus = keyof typeof TRANSFER_STATUSES;

export const ALERT_SEVERITIES = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const;
export type AlertSeverity = keyof typeof ALERT_SEVERITIES;

// ── Auth ──
export interface AuthUser {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  badgeNumber?: string | null;
  walletAddress?: string | null;
  isActive: boolean;
}

export interface LoginRequest {
  employeeId: string;
  password?: string;
}

export interface LoginResponse {
  user: AuthUser;
  token: string;
  expiresAt: string;
}

export interface PasskeyAuthOptions {
  challenge: string;
  rpId: string;
  allowCredentials: Array<{ id: string; type: string }>;
}

export interface PasskeyRegisterOptions {
  challenge: string;
  rp: { name: string; id: string };
  user: { id: string; name: string; displayName: string };
  pubKeyCredParams: Array<{ type: 'public-key'; alg: number }>;
  timeout: number;
  attestation: string;
}

// ── Summary types ──
export interface UserSummary {
  id: string;
  name: string;
  employeeId: string;
  badgeNumber?: string;
  role: UserRole;
  department: string;
}

export interface CaseSummary {
  id: string;
  caseNumber: string;
  title: string;
  status: string;
}

export interface EvidenceSummary {
  id: string;
  evidenceNumber: string;
  description: string;
  type: EvidenceType;
  status: EvidenceStatus;
}

// ── Case ──
export interface Case {
  id: string;
  caseNumber: string;
  title: string;
  description: string;
  incidentDate: string;
  incidentLocation: string;
  status: string;
  priority: string;
  officerId: string;
  officer?: UserSummary;
  courtName?: string;
  prosecutorName?: string;
  ipfsReportCid?: string;
  evidenceCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCaseRequest {
  caseNumber: string;
  title: string;
  description: string;
  incidentDate: string;
  incidentLocation: string;
  priority?: string;
  courtName?: string;
  prosecutorName?: string;
}

export interface CaseListResponse {
  cases: Case[];
  total: number;
  page: number;
  pageSize: number;
}

// ── Evidence ──
export interface ExifData {
  latitude?: number;
  longitude?: number;
  altitude?: number;
  timestamp?: string;
  cameraModel?: string;
  software?: string;
  gpsDiscrepancyMeters?: number;
}

export interface Evidence {
  id: string;
  evidenceNumber: string;
  caseId: string;
  case?: CaseSummary;
  registrarId: string;
  registrar?: UserSummary;
  type: EvidenceType;
  status: EvidenceStatus;
  description: string;
  quantity: number;
  unit?: string;
  collectionDate: string;
  collectionLocation: string;
  collectionLatitude?: number;
  collectionLongitude?: number;
  collectionAddress?: string;
  storageLocation?: string;
  exifData?: ExifData;
  imageUrls: string[];
  ipfsCid?: string;
  sha256Hash?: string;
  merkleLeafHash?: string;
  blockchainTxHash?: string;
  blockchainBlockNumber?: number;
  integrityScore: number;
  tamperEvidence?: Record<string, unknown>;
  qrCodeUrl?: string;
  qrCodeSvg?: string;
  notes?: string;
  tags: string[];
  chainSyncStatus: string;
  lastVerifiedAt?: string;
  transferCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEvidenceRequest {
  caseId: string;
  type: EvidenceType;
  description: string;
  quantity: number;
  unit?: string;
  collectionDate: string;
  collectionLocation: string;
  collectionLatitude?: number;
  collectionLongitude?: number;
  notes?: string;
  tags?: string[];
}

export interface EvidenceListResponse {
  evidence: Evidence[];
  total: number;
  page: number;
  pageSize: number;
}

// ── Transfer ──
export interface ZKProof {
  proof: { pi_a: string[]; pi_b: string[][]; pi_c: string[]; protocol: string; curve?: string };
  publicSignals: string[];
}

export interface Transfer {
  id: string;
  evidenceId: string;
  evidence?: EvidenceSummary;
  fromUserId: string;
  fromUser?: UserSummary;
  toUserId: string;
  toUser?: UserSummary;
  status: TransferStatus;
  purpose: string;
  fromSignature?: string;
  toSignature?: string;
  fromSignedAt?: string;
  toSignedAt?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  combinedDataHash?: string;
  blockchainTxHash?: string;
  blockchainBlockNumber?: number;
  zkProof?: ZKProof;
  notes?: string;
  rejectionReason?: string;
  transferredAt: string;
  syncedToChainAt?: string;
}

export interface CreateTransferRequest {
  evidenceId: string;
  toUserId: string;
  purpose: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  notes?: string;
}

export interface SignTransferRequest {
  signature: string;
  signatureType: 'passkey' | 'wallet';
  latitude?: number;
  longitude?: number;
}

// ── ZK Proof ──
export interface ZKProofInput {
  fromOfficerIdHash: string;
  toOfficerIdHash: string;
  evidenceHashSecret: string;
  timestamp: string;
}

// ── Merkle ──
export interface MerkleProof {
  root: string;
  proof: string[];
  leaf: string;
  leafIndex: number;
}

export interface MerkleCheckpoint {
  id: string;
  batchId: string;
  merkleRoot: string;
  leafHashes: string[];
  txHash?: string;
  blockNumber?: number;
  createdAt: string;
}

// ── Integrity Verification ──
export interface LayerStatus {
  checked: boolean;
  hash?: string;
  matches: boolean;
  error?: string;
}

export interface Discrepancy {
  layer: 'db' | 'ipfs' | 'chain';
  expected: string;
  received: string;
  description: string;
}

export interface IntegrityVerificationResult {
  evidenceId: string;
  dbStatus: LayerStatus;
  ipfsStatus: LayerStatus;
  chainStatus: LayerStatus;
  integrityScore: number;
  discrepancies: Discrepancy[];
  verifiedAt: string;
}

// ── Blockchain ──
export interface ContractEvidenceRecord {
  evidenceId: string;
  metadataHash: string;
  registrar: string;
  registeredAt: number;
  exists: boolean;
  isFlagged: boolean;
  transferCount: number;
}

export interface ContractTransferRecord {
  transferId: string;
  evidenceId: string;
  combinedHash: string;
  location: string;
  fromOfficer: string;
  toOfficer: string;
  timestamp: number;
  isVerified: boolean;
}

export interface BlockchainSyncResult {
  success: boolean;
  txHash?: string;
  blockNumber?: number;
  gasUsed?: string;
  error?: string;
}

// ── Reports ──
export interface Report {
  id: string;
  caseId?: string;
  evidenceId?: string;
  generatedById: string;
  generatedBy?: UserSummary;
  reportType: string;
  title: string;
  ipfsCid?: string;
  pdfUrl?: string;
  txHash?: string;
  createdAt: string;
}

export interface GenerateReportRequest {
  evidenceId?: string;
  caseId?: string;
  reportType: 'CERTIFICATE' | 'CHAIN_REPORT' | 'CASE_BUNDLE';
}

export interface ReportJobStatus {
  jobId: string;
  status: 'waiting' | 'active' | 'completed' | 'failed';
  progress: number;
  result?: { reportId: string; pdfUrl: string; ipfsCid: string };
}

// ── Analytics ──
export interface AnalyticsOverview {
  totalCases: number;
  totalEvidence: number;
  totalTransfers: number;
  tamperAlerts: number;
  avgIntegrityScore: number;
  activeOfficers: number;
}

export interface TransfersByDayEntry {
  date: string;
  count: number;
}

export interface EvidenceByTypeEntry {
  type: EvidenceType;
  count: number;
  percentage: number;
}

export interface OfficerActivity {
  userId: string;
  name: string;
  badgeNumber?: string;
  role: UserRole;
  department: string;
  transfersInitiated: number;
  transfersReceived: number;
  avgResponseHours: number;
  evidenceRegistered: number;
}

export interface AnomalyEntry {
  id: string;
  evidenceNumber: string;
  integrityScore: number;
  status: EvidenceStatus;
  transferCount: number;
  hasFailedSync: boolean;
  lastTransfer?: string;
}

// ── Notifications ──
export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

// ── Audit Log ──
export interface AuditLog {
  id: string;
  userId?: string;
  user?: UserSummary;
  action: string;
  entityType: string;
  entityId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  severity: AlertSeverity;
  flagged: boolean;
  createdAt: string;
}

export interface AuditLogListResponse {
  logs: AuditLog[];
  total: number;
  page: number;
  pageSize: number;
}

// ── API helpers ──
export interface ApiError {
  error: string;
  code?: string;
  details?: Record<string, unknown>;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

// ── Offline sync ──
export interface OfflineScanRecord {
  evidenceId: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  deviceId: string;
  officerId: string;
  localHash: string;
}

export interface OfflineSyncPayload {
  deviceId: string;
  actions: Array<{
    type: 'SCAN' | 'SIGN';
    payload: OfflineScanRecord | (SignTransferRequest & { transferId: string });
  }>;
}

// ── QR & Verification ──
export interface QRLookupResult {
  evidenceNumber: string;
  caseNumber: string;
  currentStatus: EvidenceStatus;
  integrityScore: number;
  lastTransfer?: string;
  isVerified: boolean;
}

export interface PublicVerificationResult {
  evidenceNumber: string;
  caseNumber: string;
  currentStatus: EvidenceStatus;
  integrityScore: number;
  blockchainVerified: boolean;
  lastVerifiedAt?: string;
  transferCount: number;
  verificationToken: string;
}

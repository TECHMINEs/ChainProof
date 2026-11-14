import type { Evidence, Transfer, IntegrityVerificationResult } from '@chainproof/types';

const caseSummaries = {
  'CASE-2026-089': { id: 'CASE-2026-089', caseNumber: 'CASE-2026-089', title: 'Operation Cipherlock — Financial Cyberforensics', status: 'ACTIVE' },
  'CASE-2026-104': { id: 'CASE-2026-104', caseNumber: 'CASE-2026-104', title: 'State vs. Ledger Systems — Asset Verification', status: 'PENDING_TRIAL' },
};

const evidenceFixtures = [
  {
    id: 'EV-2026-001',
    evidenceNumber: 'EV-2026-001',
    caseNumber: 'CASE-2026-089',
    caseId: 'CASE-2026-089',
    type: 'DIGITAL',
    description: 'Encrypted NVMe SSD (1TB) seized from primary suspect workstation. SHA-256 hashed on seizure.',
    status: 'STORED',
    currentHolder: 'System Administrator (DFU-001)',
    currentHolderId: 'ADMIN-001',
    integrityScore: 100,
    barcode: 'CP-EV2026001',
    collectedAt: '2026-11-10T14:30:00Z',
    collectedBy: 'Det. M. Vance',
    location: 'Forensics Vault Shelf A-12',
    sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    txHash: '0x9a8c2f1e4b5d6c7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a',
  },
  {
    id: 'EV-2026-002',
    evidenceNumber: 'EV-2026-002',
    caseNumber: 'CASE-2026-089',
    caseId: 'CASE-2026-089',
    type: 'DIGITAL',
    description: 'Mobile Smartphone (Hardware Token Extracted). SIM sealed in Faraday container.',
    status: 'IN_TRANSIT',
    currentHolder: 'Officer R. Miller',
    currentHolderId: 'OFFICER-004',
    integrityScore: 100,
    barcode: 'CP-EV2026002',
    collectedAt: '2026-11-11T09:15:00Z',
    collectedBy: 'Officer R. Miller',
    location: 'In Transit to Central Crime Lab',
    sha256Hash: '4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945',
    txHash: '0x7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c',
  },
  {
    id: 'EV-2026-003',
    evidenceNumber: 'EV-2026-003',
    caseNumber: 'CASE-2026-104',
    caseId: 'CASE-2026-104',
    type: 'DOCUMENT',
    description: 'Ledger documents with verified cryptographic signature stamps.',
    status: 'VERIFIED',
    currentHolder: 'Forensics Lab Examiner K. Sharma',
    currentHolderId: 'EXAMINER-002',
    integrityScore: 100,
    barcode: 'CP-EV2026003',
    collectedAt: '2026-11-08T16:45:00Z',
    collectedBy: 'Agent S. Ross',
    location: 'Evidence Room B - Locker 4',
    sha256Hash: 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    txHash: '0x1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d',
  },
];

export const sampleEvidence: Evidence[] = evidenceFixtures.map((item) => ({
  id: item.id,
  evidenceNumber: item.evidenceNumber,
  caseId: item.caseId,
  case: caseSummaries[item.caseId as keyof typeof caseSummaries],
  registrarId: 'ADMIN-001',
  type: item.type as Evidence['type'],
  status: item.status as Evidence['status'],
  description: item.description,
  quantity: 1,
  collectionDate: item.collectedAt,
  collectionLocation: item.location,
  storageLocation: item.location,
  imageUrls: [],
  sha256Hash: item.sha256Hash,
  integrityScore: item.integrityScore,
  tags: [],
  chainSyncStatus: 'PENDING',
  createdAt: item.collectedAt,
  updatedAt: item.collectedAt,
}));

export const sampleCases = [
  {
    id: 'CASE-2026-089',
    caseNumber: 'CASE-2026-089',
    title: 'Operation Cipherlock — Financial Cyberforensics',
    description: 'Investigation into unauthorized cryptographic exfiltration from regional financial node.',
    status: 'ACTIVE',
    leadInvestigator: 'Det. M. Vance',
    evidenceCount: 2,
    evidence: sampleEvidence.slice(0, 2),
    createdAt: '2026-11-05T08:00:00Z',
  },
  {
    id: 'CASE-2026-104',
    caseNumber: 'CASE-2026-104',
    title: 'State vs. Ledger Systems — Asset Verification',
    description: 'Custody verification and document forensic analysis for corporate audit.',
    status: 'PENDING_TRIAL',
    leadInvestigator: 'Agent S. Ross',
    evidenceCount: 1,
    evidence: sampleEvidence.slice(2, 3),
    createdAt: '2026-11-07T11:20:00Z',
  },
];

const transferFixtures = [
  {
    id: 'TR-2026-441',
    evidenceId: 'EV-2026-001',
    evidenceNumber: 'EV-2026-001',
    fromUser: 'Det. M. Vance',
    toUser: 'System Administrator',
    fromUserId: 'OFFICER-003',
    toUserId: 'ADMIN-001',
    purpose: 'Digital Forensics Imaging & Bitstream Analysis',
    status: 'COMPLETED',
    timestamp: '2026-11-10T16:00:00Z',
    txHash: '0x8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d',
  },
  {
    id: 'TR-2026-442',
    evidenceId: 'EV-2026-002',
    evidenceNumber: 'EV-2026-002',
    fromUser: 'Officer R. Miller',
    toUser: 'Central Lab Custodian',
    fromUserId: 'OFFICER-004',
    toUserId: 'CUSTODIAN-001',
    purpose: 'Secure transit to ballistic and hardware forensics division',
    status: 'PENDING',
    timestamp: '2026-11-12T11:15:00Z',
    txHash: '0x3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b',
  },
];

const userNames: Record<string, string> = {
  'OFFICER-003': 'Det. M. Vance',
  'OFFICER-004': 'Officer R. Miller',
  'ADMIN-001': 'System Administrator',
  'CUSTODIAN-001': 'Central Lab Custodian',
};

export const sampleTransfers: Transfer[] = transferFixtures.map((item) => ({
  id: item.id,
  evidenceId: item.evidenceId,
  evidence: sampleEvidence.find((e) => e.id === item.evidenceId),
  fromUserId: item.fromUserId,
  fromUser: { id: item.fromUserId, name: userNames[item.fromUserId], employeeId: item.fromUserId, role: 'OFFICER', department: 'Forensics' },
  toUserId: item.toUserId,
  toUser: { id: item.toUserId, name: userNames[item.toUserId], employeeId: item.toUserId, role: item.toUserId === 'ADMIN-001' ? 'ADMIN' : 'OFFICER', department: 'Forensics' },
  purpose: item.purpose,
  status: item.status as Transfer['status'],
  transferredAt: item.timestamp,
}));

export function sampleIntegrityResult(evidence: Evidence): IntegrityVerificationResult {
  return {
    evidenceId: evidence.id,
    dbStatus: { checked: true, hash: evidence.sha256Hash, matches: true },
    ipfsStatus: { checked: false, matches: false },
    chainStatus: { checked: false, matches: false },
    integrityScore: evidence.integrityScore,
    discrepancies: [],
    verifiedAt: evidence.updatedAt,
  };
}

export const sampleAnalytics = {
  overview: {
    totalCases: 2,
    totalEvidence: 3,
    totalTransfers: 2,
    tamperAlerts: 0,
    avgIntegrityScore: 100,
    activeOfficers: 4,
  },
  transfersByDay: [
    { date: 'Nov 09', count: 1 },
    { date: 'Nov 10', count: 2 },
    { date: 'Nov 11', count: 1 },
    { date: 'Nov 12', count: 1 },
    { date: 'Nov 13', count: 0 },
    { date: 'Nov 14', count: 0 },
    { date: 'Nov 15', count: 0 },
  ],
  evidenceByType: [
    { type: 'DIGITAL', count: 2, percentage: 67 },
    { type: 'DOCUMENT', count: 1, percentage: 33 },
  ],
};

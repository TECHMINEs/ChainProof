"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALERT_SEVERITIES = exports.TRANSFER_STATUSES = exports.EVIDENCE_TYPES = exports.EVIDENCE_STATUSES = exports.USER_ROLES = void 0;
// ── Enums ──
exports.USER_ROLES = {
    ADMIN: 'ADMIN',
    OFFICER: 'OFFICER',
    REGISTRAR: 'REGISTRAR',
    AUDITOR: 'AUDITOR',
};
exports.EVIDENCE_STATUSES = {
    REGISTERED: 'REGISTERED',
    IN_TRANSIT: 'IN_TRANSIT',
    STORED: 'STORED',
    VERIFIED: 'VERIFIED',
    FLAGGED: 'FLAGGED',
    ARCHIVED: 'ARCHIVED',
};
exports.EVIDENCE_TYPES = {
    DOCUMENT: 'DOCUMENT',
    PHYSICAL: 'PHYSICAL',
    DIGITAL: 'DIGITAL',
    BIOMETRIC: 'BIOMETRIC',
    WEAPON: 'WEAPON',
    DRUG: 'DRUG',
    OTHER: 'OTHER',
};
exports.TRANSFER_STATUSES = {
    PENDING: 'PENDING',
    COMPLETED: 'COMPLETED',
    REJECTED: 'REJECTED',
    FAILED: 'FAILED',
};
exports.ALERT_SEVERITIES = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    CRITICAL: 'CRITICAL',
};

import type { EvidenceStatus } from '@chainproof/types';

type Transition = { from: EvidenceStatus; to: EvidenceStatus[] };

const TRANSITIONS: Transition[] = [
  { from: 'REGISTERED', to: ['IN_TRANSIT', 'STORED', 'FLAGGED'] },
  { from: 'IN_TRANSIT', to: ['STORED', 'FLAGGED'] },
  { from: 'STORED', to: ['IN_TRANSIT', 'VERIFIED', 'FLAGGED', 'ARCHIVED'] },
  { from: 'VERIFIED', to: ['ARCHIVED', 'FLAGGED'] },
  { from: 'FLAGGED', to: [] }, // Only ADMIN can unflag via dedicated route
  { from: 'ARCHIVED', to: [] }, // Terminal
];

export function validateStatusTransition(from: EvidenceStatus, to: EvidenceStatus): boolean {
  const rule = TRANSITIONS.find(t => t.from === from);
  if (!rule) return false;
  return rule.to.includes(to);
}

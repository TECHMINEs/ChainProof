import EvidenceDetailClient from './EvidenceDetailClient';

export function generateStaticParams() {
  return [
    { id: 'EV-2026-001' },
    { id: 'EV-2026-002' },
    { id: 'EV-2026-003' },
    { id: 'demo' },
  ];
}

export default function Page() {
  return <EvidenceDetailClient />;
}

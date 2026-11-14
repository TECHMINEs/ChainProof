import EvidenceDetailClient from './EvidenceDetailClient';

export function generateStaticParams() {
  return [
    { id: 'EV-2026-001' },
    { id: 'EV-2026-002' },
    { id: 'demo' },
  ];
}

export default function Page({ params }: { params: { id: string } }) {
  return <EvidenceDetailClient />;
}

import CaseDetailClient from './CaseDetailClient';

export function generateStaticParams() {
  return [
    { id: 'CASE-2026-089' },
    { id: 'CASE-2026-104' },
    { id: 'demo' },
  ];
}

export default function Page({ params }: { params: { id: string } }) {
  return <CaseDetailClient />;
}

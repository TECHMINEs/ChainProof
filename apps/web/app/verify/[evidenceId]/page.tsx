import VerifyClient from './VerifyClient';

export function generateStaticParams() {
  return [
    { evidenceId: 'EV-2026-001' },
    { evidenceId: 'EV-2026-002' },
    { evidenceId: 'EV-2026-003' },
    { evidenceId: 'demo' },
  ];
}

export default function Page() {
  return <VerifyClient />;
}

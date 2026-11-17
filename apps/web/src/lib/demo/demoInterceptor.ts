import { sampleEvidence, sampleCases, sampleTransfers, sampleAnalytics, sampleIntegrityResult } from './demoData';

export function setupDemoInterceptor() {
  if (typeof window === 'undefined') return;

  const originalFetch = window.fetch;
  window.fetch = async function (input: RequestInfo | URL, init?: RequestInit) {
    const urlStr = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

    const isDemoHost =
      window.location.hostname.includes('github.io') ||
      window.location.pathname.startsWith('/ChainProof') ||
      process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

    // API calls on a static host are served from demo data.
    if (urlStr.includes('/api/')) {
      try {
        if (!isDemoHost) {
          const res = await originalFetch(input, init);
          if (res.ok || res.status !== 404) return res;
        }
      } catch {
      }

      const url = new URL(urlStr, window.location.origin);
      const path = url.pathname.replace(/^\/ChainProof/, '');

      const mockJson = (data: unknown, status = 200) =>
        new Response(JSON.stringify(data), {
          status,
          headers: { 'Content-Type': 'application/json' },
        });

      if (path.startsWith('/api/auth/login')) {
        return mockJson({
          success: true,
          token: 'demo-jwt-token',
          user: { employeeId: 'ADMIN-001', role: 'ADMIN', name: 'System Administrator' },
        });
      }

      if (path.startsWith('/api/auth/me')) {
        return mockJson({
          user: {
            employeeId: 'ADMIN-001',
            role: 'ADMIN',
            name: 'System Administrator',
            department: 'Digital Forensics Unit',
            badgeNumber: 'DFU-001',
          },
        });
      }

      if (path === '/api/evidence' || path === '/api/evidence/') {
        const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
        const pageSize = Math.max(1, Number(url.searchParams.get('pageSize')) || 10);
        const search = url.searchParams.get('search')?.trim().toLowerCase();
        const status = url.searchParams.get('status');
        const type = url.searchParams.get('type');
        const filtered = sampleEvidence.filter((e) =>
          (!search || e.evidenceNumber.toLowerCase().includes(search) || e.description.toLowerCase().includes(search)) &&
          (!status || e.status === status) &&
          (!type || e.type === type)
        );
        return mockJson({ evidence: filtered.slice((page - 1) * pageSize, page * pageSize), total: filtered.length, page, pageSize });
      }

      if (path.includes('/verify-integrity')) {
        const id = path.split('/')[3];
        const evidence = sampleEvidence.find((e) => e.id === id);
        return evidence ? mockJson(sampleIntegrityResult(evidence)) : mockJson({ error: 'Evidence not found' }, 404);
      }

      if (path.includes('/timeline')) {
        const id = path.split('/')[3];
        return mockJson({ data: sampleTransfers.filter((t) => t.evidenceId === id) });
      }

      if (path.startsWith('/api/evidence/')) {
        const id = path.split('/')[3];
        const ev = sampleEvidence.find((e) => e.id === id);
        return ev ? mockJson({ data: ev }) : mockJson({ error: 'Evidence not found' }, 404);
      }

      if (path.startsWith('/api/cases/')) {
        const id = path.split('/')[3];
        const cs = sampleCases.find((c) => c.id === id) || sampleCases[0];
        return mockJson({ data: cs });
      }

      if (path.startsWith('/api/cases')) {
        return mockJson({ cases: sampleCases });
      }

      if (path.startsWith('/api/transfers')) {
        return mockJson({ data: sampleTransfers });
      }

      if (path.startsWith('/api/analytics/overview')) {
        return mockJson({ data: sampleAnalytics.overview });
      }

      if (path.startsWith('/api/analytics/transfers-by-day')) {
        return mockJson({ data: sampleAnalytics.transfersByDay });
      }

      if (path.startsWith('/api/analytics/evidence-by-type')) {
        return mockJson({ data: sampleAnalytics.evidenceByType });
      }

      if (path.startsWith('/api/verify/')) {
        const id = path.split('/')[3];
        return mockJson({
          data: {
            evidenceId: id,
            status: 'VERIFIED',
            custodyValid: true,
            merkleProofValid: true,
            sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            timestamp: new Date().toISOString(),
            blockchainVerification: {
              network: 'Polygon PoS (Amoy Testnet)',
              contract: '0x32a26c94609597b1ab6317f1f60b2994e444449e',
              blockNumber: 14209581,
            },
          },
        });
      }

      if (path.startsWith('/api/admin/audit-logs')) {
        return mockJson({
          logs: [
            { id: 1, action: 'EVIDENCE_ACCESSED', user: 'ADMIN-001', timestamp: '2026-11-14T10:00:00Z' },
            { id: 2, action: 'TRANSFER_AUTHORIZED', user: 'OFFICER-003', timestamp: '2026-11-13T14:22:00Z' },
          ],
        });
      }

      if (path.startsWith('/api/admin/users')) {
        return mockJson({
          users: [
            { id: 1, employeeId: 'ADMIN-001', name: 'System Administrator', role: 'ADMIN' },
            { id: 2, employeeId: 'OFFICER-003', name: 'Det. M. Vance', role: 'OFFICER' },
          ],
        });
      }

      return mockJson({ data: null, error: 'Demo resource mock fallback' });
    }

    return originalFetch(input, init);
  };
}

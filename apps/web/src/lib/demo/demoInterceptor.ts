import { sampleEvidence, sampleCases, sampleTransfers, sampleAnalytics } from './demoData';

export function setupDemoInterceptor() {
  if (typeof window === 'undefined') return;

  const originalFetch = window.fetch;
  window.fetch = async function (input: RequestInfo | URL, init?: RequestInit) {
    const urlStr = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

    const isDemoHost =
      window.location.hostname.includes('github.io') ||
      window.location.pathname.startsWith('/ChainProof') ||
      process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

    // If it's an API route and we are on GitHub Pages or static host
    if (urlStr.includes('/api/')) {
      try {
        if (!isDemoHost) {
          const res = await originalFetch(input, init);
          if (res.ok || res.status !== 404) return res;
        }
      } catch {
        // network failure -> fallback to demo mock
      }

      // Handle Mock endpoints
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
        return mockJson({ evidence: sampleEvidence });
      }

      if (path.includes('/verify-integrity')) {
        return mockJson({
          status: 'VALID',
          score: 100,
          merkleRoot: '0x8f4b9e2c1a0d3f5b7e9a8c6d4e2f0b1a3c5d7e9f',
          onChainTx: '0x9a8c2f1e4b5d6c7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a',
        });
      }

      if (path.includes('/timeline')) {
        return mockJson({ data: sampleTransfers });
      }

      if (path.startsWith('/api/evidence/')) {
        const id = path.split('/')[3];
        const ev = sampleEvidence.find((e) => e.id === id) || sampleEvidence[0];
        return mockJson({ data: ev });
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

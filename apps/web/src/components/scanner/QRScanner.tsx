"use client"
import React, { useEffect, useRef, useState } from 'react'
import type { Html5QrcodeScanner } from 'html5-qrcode'

interface QRScannerProps {
  onScan: (data: string) => void;
}

export function QRScanner({ onScan }: QRScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
  const containerId = 'chainproof-qr-reader'
  const [cameraError, setCameraError] = useState('')
  const [manualInput, setManualInput] = useState('')

  useEffect(() => {
    async function initScanner() {
      try {
        const { Html5QrcodeScanner } = await import('html5-qrcode');
        const scanner = new Html5QrcodeScanner(
          containerId,
          { fps: 10, qrbox: { width: 250, height: 250 } },
          false
        );
        scannerRef.current = scanner;

        scanner.render(
          (decodedText: string) => {
            // Parse chainproof://evidence/<number> URI
            const match = decodedText.match(/chainproof:\/\/evidence\/([A-Z0-9\-]+)/);
            onScan(match ? match[1] : decodedText);
          },
          () => {
            // Per-frame decode misses are expected (no QR in view) — intentionally ignored
          }
        );
      } catch {
        setCameraError('Camera unavailable. Please use manual input below.');
      }
    }

    initScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => undefined);
      }
    };
  }, [onScan]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      onScan(manualInput.trim());
    }
  };

  return (
    <div className="space-y-4">
      {cameraError ? (
        <div className="p-4 bg-red-900/20 border border-red-800/50 rounded text-red-400 text-sm text-center">
          {cameraError}
        </div>
      ) : (
        <div
          id={containerId}
          className="w-full rounded-lg overflow-hidden border border-red-900/40"
        />
      )}

      <div className="pt-4 border-t border-red-900/40">
        <p className="text-xs text-neutral-500 mb-3 text-center">Or enter evidence number manually</p>
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <input
            type="text"
            value={manualInput}
            onChange={e => setManualInput(e.target.value)}
            placeholder="e.g. EV-2026-000042"
            className="flex-1 px-3 py-2 bg-[#050505] border border-red-900/40 rounded text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-red-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded text-sm font-semibold transition-colors"
          >
            Lookup
          </button>
        </form>
      </div>
    </div>
  );
}

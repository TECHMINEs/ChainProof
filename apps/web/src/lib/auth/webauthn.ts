import { isoBase64URL } from '@simplewebauthn/server/helpers';

/**
 * Passkey credential IDs are persisted as base64url strings, but SimpleWebAuthn v9
 * expects raw bytes. These helpers are the single place that conversion happens.
 */
export type AuthenticatorTransport = 'ble' | 'cable' | 'hybrid' | 'internal' | 'nfc' | 'smart-card' | 'usb';

const KNOWN_TRANSPORTS = new Set<string>(['ble', 'cable', 'hybrid', 'internal', 'nfc', 'smart-card', 'usb']);

interface StoredPasskey {
  credentialId: string;
  publicKey: Uint8Array;
  counter: bigint | number;
  transports: string[];
}

function toTransports(transports: string[]): AuthenticatorTransport[] {
  return transports.filter((t): t is AuthenticatorTransport => KNOWN_TRANSPORTS.has(t));
}

/** Shape for `allowCredentials` / `excludeCredentials` in option generation. */
export function toCredentialDescriptor(credential: Pick<StoredPasskey, 'credentialId' | 'transports'>) {
  return {
    id: isoBase64URL.toBuffer(credential.credentialId),
    type: 'public-key' as const,
    transports: toTransports(credential.transports),
  };
}

/** Shape for the `authenticator` argument of `verifyAuthenticationResponse`. */
export function toAuthenticatorDevice(credential: StoredPasskey) {
  return {
    credentialID: isoBase64URL.toBuffer(credential.credentialId),
    credentialPublicKey: new Uint8Array(credential.publicKey),
    counter: Number(credential.counter),
    transports: toTransports(credential.transports),
  };
}

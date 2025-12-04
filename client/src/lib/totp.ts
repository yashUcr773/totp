// Browser-compatible TOTP utilities

const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/**
 * Generate random bytes for secret generation
 */
export function randomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

/**
 * Base32 encode bytes to string
 */
export function base32Encode(buffer: Uint8Array): string {
  let bits = 0;
  let value = 0;
  let out = '';

  for (const b of buffer) {
    value = (value << 8) | b;
    bits += 8;

    while (bits >= 5) {
      out += BASE32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    out += BASE32[(value << (5 - bits)) & 31];
  }

  return out;
}

/**
 * Base32 decode string to bytes
 */
export function base32Decode(str: string): Uint8Array {
  str = str.toUpperCase().replace(/=+$/, '');

  const out: number[] = [];
  let bits = 0;
  let value = 0;

  for (const char of str) {
    const idx = BASE32.indexOf(char);
    if (idx === -1) continue;

    value = (value << 5) | idx;
    bits += 5;

    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }

  return new Uint8Array(out);
}

/**
 * HMAC-SHA1 implementation using Web Crypto API
 */
async function hmacSha1(key: Uint8Array, message: Uint8Array): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key.buffer as ArrayBuffer,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, message.buffer as ArrayBuffer);
  return new Uint8Array(signature);
}

/**
 * Generate TOTP code
 */
export async function totp(
  secretBase32: string,
  timeSeconds: number = Math.floor(Date.now() / 1000)
): Promise<string> {
  const STEP = 30;
  const DIGITS = 6;

  // Decode secret
  const secret = base32Decode(secretBase32);

  // Calculate counter
  const counter = Math.floor(timeSeconds / STEP);

  // Convert counter to 8-byte buffer (big-endian)
  const buf = new Uint8Array(8);
  let ctr = counter;
  for (let i = 7; i >= 0; i--) {
    buf[i] = ctr & 0xff;
    ctr = Math.floor(ctr / 256);
  }

  // Generate HMAC-SHA1
  const h = await hmacSha1(secret, buf);

  // Dynamic truncation
  const offset = h[h.length - 1]! & 0x0f;

  const binary =
    ((h[offset]! & 0x7f) << 24) |
    ((h[offset + 1]! & 0xff) << 16) |
    ((h[offset + 2]! & 0xff) << 8) |
    (h[offset + 3]! & 0xff);

  // Convert to desired number of digits
  const token = (binary % 10 ** DIGITS).toString().padStart(DIGITS, '0');

  return token;
}

/**
 * Verify TOTP code
 */
export async function verifyTotp(
  secretBase32: string,
  token: string,
  window: number = 1
): Promise<{ ok: boolean; drift?: number }> {
  const STEP = 30;
  token = String(token).padStart(6, '0');

  const now = Math.floor(Date.now() / 1000);

  for (let w = -window; w <= window; w++) {
    const t = await totp(secretBase32, now + w * STEP);

    if (t === token) {
      return { ok: true, drift: w };
    }
  }

  return { ok: false };
}

/**
 * Generate a secret key
 */
export function generateSecret(bytes: number = 20): string {
  return base32Encode(randomBytes(bytes));
}

/**
 * Build OTP Auth URI for QR code
 */
export function buildUri(secret: string, account: string, issuer: string = 'MyApp'): string {
  return (
    `otpauth://totp/${issuer}:${account}` +
    `?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`
  );
}

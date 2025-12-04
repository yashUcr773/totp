import { createHmac } from 'crypto';
import { base32Decode } from './3.base32decoder.js';
import { DIGITS, secret, STEP } from './0.constants.js';

/**
 * Generate a TOTP (Time-based One-Time Password)
 *
 * @param secretBase32  - The shared secret (Base32 encoded string)
 * @param timeSeconds   - Unix timestamp in seconds (default = now)
 *
 * How TOTP works:
 *   1. Decode secret from Base32 → raw bytes
 *   2. Convert timestamp into a counter (30-second steps)
 *   3. HMAC-SHA1(counter) → 20-byte hash
 *   4. Dynamic truncation → 4 bytes → 31-bit number
 *   5. Modulo 10^DIGITS → numeric code (e.g. 6 digits)
 */
export function totp(secretBase32: string, timeSeconds: number = Math.floor(Date.now() / 1000)) {
  // 1️⃣ Convert the Base32-encoded secret into bytes
  const secret = base32Decode(secretBase32);

  // 2️⃣ Convert current time into a counter
  //    Counter increments every STEP seconds (usually STEP = 30)
  const counter = Math.floor(timeSeconds / STEP);

  // 3️⃣ Pack counter into an 8-byte buffer (Big-Endian)
  //    This is required by the TOTP standard
  const buf = Buffer.alloc(8);
  let ctr = counter;
  for (let i = 7; i >= 0; i--) {
    buf[i] = ctr & 0xff; // put lowest 8 bits into current position
    ctr = Math.floor(ctr / 256); // shift right by 8 bits
  }

  // 4️⃣ Generate HMAC-SHA1 hash using secret as key & counter as message
  const h = createHmac('sha1', secret).update(buf).digest();

  // 5️⃣ Perform dynamic truncation (RFC 4226)
  //     - Last nibble gives offset (0-15)
  //     - Extract 4 bytes starting at offset
  const offset = h[h.length - 1]! & 0x0f;

  const binary =
    ((h[offset]! & 0x7f) << 24) | // drop sign bit
    ((h[offset + 1]! & 0xff) << 16) |
    ((h[offset + 2]! & 0xff) << 8) |
    (h[offset + 3]! & 0xff);

  // 6️⃣ Convert to desired number of digits (e.g. 6)
  const token = (binary % 10 ** DIGITS).toString().padStart(DIGITS, '0');

  return token;
}

/**
 *
 * Uses:
 * - Base32-decoded secret
 * - Counter as an 8-byte big-endian buffer (built via division & modulo)
 * - HMAC-SHA1
 * - Dynamic truncation using arithmetic instead of bit shifts/masks
 */
function totpNoBitManipulation(
  secretBase32: string,
  timeSeconds: number = Math.floor(Date.now() / 1000)
): string {
  // 1️⃣ Decode Base32 secret into raw bytes (Buffer)
  const secret = base32Decode(secretBase32);

  // 2️⃣ Compute time-step counter (moving factor)
  const counter = Math.floor(timeSeconds / STEP);

  // 3️⃣ Convert counter to an 8-byte big-endian buffer
  // Big-endian 8-byte integer means:
  //   buf[0] = most significant byte
  //   buf[7] = least significant byte
  const buf = Buffer.alloc(8);
  let ctr = counter;

  for (let i = 7; i >= 0; i--) {
    // Lowest 8 bits of ctr → ctr mod 256
    buf[i] = ctr % 256;
    // “Shift right by 8 bits” → integer divide by 256
    ctr = Math.floor(ctr / 256);
  }

  // 4️⃣ HMAC-SHA1(secret, counterBytes)
  const hmac = createHmac('sha1', secret).update(buf).digest();

  // 5️⃣ Dynamic truncation
  // offset = last byte's low 4 bits
  // normally: offset = hmac[19] & 0x0f
  // here: use modulo 16 instead
  const lastByte = hmac[hmac.length - 1];
  const offset = lastByte! % 16; // 0–15

  // Take 4 bytes starting at offset
  let p0 = hmac[offset]; // will clear the sign bit below
  const p1 = hmac[offset + 1];
  const p2 = hmac[offset + 2];
  const p3 = hmac[offset + 3];

  // Clear the highest bit of p0 (same as p0 & 0x7f)
  // If p0 >= 128, subtract 128 to drop the sign bit.
  if (p0! >= 128) {
    p0 = p0! - 128;
  }

  // Combine 4 bytes into one 31-bit integer:
  // Normally you'd see shifts:
  //   ((p0 & 0x7f) << 24) | (p1 << 16) | (p2 << 8) | p3
  //
  // We do the same with multiplication instead:
  const binary = p0! * 256 ** 3 + p1! * 256 ** 2 + p2! * 256 + p3!;

  // 6️⃣ Reduce to desired number of digits (e.g., 6) and zero-pad
  const otpNumber = binary % 10 ** DIGITS;
  const token = otpNumber.toString().padStart(DIGITS, '0');

  return token;
}

console.log('🚀 ~ totp(secret):', totp(secret));
console.log('🚀 ~ totp(secret):', totpNoBitManipulation(secret));
console.log('🚀 ~ totp(secret):', totpNoBitManipulation(secret));

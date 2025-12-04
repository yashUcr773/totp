import { createHmac, randomBytes } from 'crypto';

const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const STEP = 30;
const DIGITS = 6;

function base32Encode(buf) {
  let bits = 0,
    value = 0,
    out = '';
  for (const b of buf) {
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

function base32Decode(str) {
  const clean = str
    .toUpperCase()
    .replace(/=+$/, '')
    .replace(/[^A-Z2-7]/g, '');
  let bits = 0,
    value = 0;
  const bytes = [];

  for (const ch of clean) {
    value = (value << 5) | BASE32.indexOf(ch);
    bits += 5;

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

function totp(secretBase32, timeSeconds = Math.floor(Date.now() / 1000)) {
  const secret = base32Decode(secretBase32);
  const counter = Math.floor(timeSeconds / STEP);

  // 8-byte big-endian counter
  const buf = Buffer.alloc(8);
  let ctr = counter;
  for (let i = 7; i >= 0; i--) {
    buf[i] = ctr & 0xff;
    ctr = Math.floor(ctr / 256);
  }

  // HMAC-SHA1
  const h = createHmac('sha1', secret).update(buf).digest();

  // Dynamic truncation (RFC 4226)
  const offset = h[h.length - 1] & 0x0f;
  const binary =
    ((h[offset] & 0x7f) << 24) |
    ((h[offset + 1] & 0xff) << 16) |
    ((h[offset + 2] & 0xff) << 8) |
    (h[offset + 3] & 0xff);

  const token = (binary % 10 ** DIGITS).toString().padStart(DIGITS, '0');
  return token;
}

function verifyTotp(secretBase32, token, window = 1) {
  token = String(token).padStart(6, '0');
  const now = Math.floor(Date.now() / 1000);

  for (let w = -window; w <= window; w++) {
    const t = totp(secretBase32, now + w * STEP);
    if (t === token) return { ok: true, drift: w };
  }
  return { ok: false };
}

function generateSecret(bytes = 20) {
  return base32Encode(randomBytes(bytes));
}

const secret = generateSecret();
console.log('Your secret:', secret);

setInterval(() => {
  console.log('Current TOTP:', totp(secret));
}, 1000);

function buildUri(secret, account, issuer = 'MyApp') {
  return (
    `otpauth://totp/${issuer}:${account}` +
    `?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`
  );
}

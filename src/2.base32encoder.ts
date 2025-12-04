import { randomBytes } from 'crypto';
import { BASE32, test_buffer } from './0.constants.js';

/**
 * Function that takes in random bytes and converts them to a base 32 encoded string.
 * This is uses bit-manipulation technique. It is fast and efficient but harder to understand.
 * This also has a pitfall where OS auto converts values to 32 bit unsigned integers and may cause data loss.
 * @param buf array buffer of random bytes to be converted to base 32 encoded string
 * @returns base 32 encoded string
 */
export function base32Encode(buf: Buffer<ArrayBuffer>) {
  let bits = 0;
  let value = 0;
  let out = '';

  // In the current value, shift it left to make space for new byte and add the new bytes to value.
  // If the length of bits is more than 5, this may cause data loss as only 32 bit manipulation is supported by OS so use the remaining bits for builduing output value.
  for (const b of buf) {
    // console.log(
    //   'b',
    //   'number:',
    //   b,
    //   'hex:',
    //   b.toString(16).padStart(2, '0'),
    //   'string:',
    //   String.fromCharCode(b)
    // );
    // console.log('🚀 ~ base32Encode ~ value:', value, b);
    value = (value << 8) | b;
    // console.log('🚀 ~ base32Encode ~ value:', value, value.toString(2).padStart(8, '0'));
    bits += 8;
    // console.log('🚀 ~ base32Encode ~ bits:', bits);
    // console.log('-------------------');
    while (bits >= 5) {
      // console.log('🚀 ~ base32Encode ~ bits:', bits);
      // console.log('🚀 ~ base32Encode ~ out:', out);
      // console.log('🚀 ~ base32Encode ~ value:', value, value.toString(2).padStart(8, '0'));
      out += BASE32[(value >>> (bits - 5)) & 31];
      // console.log('🚀 ~ base32Encode ~ value:', value, value.toString(2).padStart(8, '0'));
      // console.log('🚀 ~ base32Encode ~ out:', out);
      bits -= 5;
    }
    // console.log('-------------------');
  }
  // in case the original data has some remaining bits left, shift the bits left and add 00 to it.
  if (bits > 0) {
    out += BASE32[(value << (5 - bits)) & 31];
  }
  return out;
}

/**
 *
 * Function that takes in random bytes and converts them to base 32 encoded string.
 * This is the string builder alternative to bit manipulation
 * We are building and storing the complete bytes first in memory
 * This is slower and less optimized as bit manipulation is optimized by CPU by default
 * This is added only to make our understanding simpler
 * @param buf array buffer of random bytes to be converted to base 32 encoded string
 * @returns base 32 encoded string
 */
function base32EncodeString(buf: Buffer<ArrayBuffer>) {
  // STEP 1 — Convert every byte to an 8-bit binary string
  let binary = '';
  for (const byte of buf) {
    // console.log(
    //   '🚀 ~ base32EncodeString ~ byte:',
    //   byte,
    //   byte.toString(2),
    //   byte.toString(16),
    //   String.fromCharCode(byte)
    // );
    binary += byte.toString(2).padStart(8, '0');
  }
  // console.log('🚀 ~ base32EncodeString ~ binary:', binary);
  // console.log('🚀 ~ base32EncodeString ~ binary.length:', binary.length);

  // STEP 2 — Break the bitstring into 5-bit chunks
  let out = '';
  for (let i = 0; i < binary.length; i += 5) {
    const chunk = binary.slice(i, i + 5);
    // console.log('🚀 ~ base32EncodeString ~ chunk:', chunk);

    // If the last chunk is < 5 bits, pad it with zeros on the right
    const padded = chunk.padEnd(5, '0');
    // console.log('🚀 ~ base32EncodeString ~ padded:', padded);

    // Convert 5-bit binary string → number
    const index = parseInt(padded, 2);
    // console.log('🚀 ~ base32EncodeString ~ index:', index);

    // Map number → Base32 character
    out += BASE32[index];
    // console.log('🚀 ~ base32EncodeString ~ out:', out);
  }

  return out;
}

console.log(base32Encode(test_buffer));
console.log(base32EncodeString(test_buffer));

/**
 * quick correctness test
 */
function testSpeed() {
  const sample = randomBytes(32);
  if (base32Encode(sample) !== base32EncodeString(sample)) {
    console.error('Mismatch!');
    process.exit(1);
  }

  for (const size of [4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192]) {
    const buf = randomBytes(size);
    const runs = 100_000;
    console.log(`\nSize: ${size} bytes, runs: ${runs}`);

    let t0 = Date.now();
    for (let i = 0; i < runs; i++) base32Encode(buf);
    console.log('bitwise:', Date.now() - t0, 'ms');

    t0 = Date.now();
    for (let i = 0; i < runs; i++) base32EncodeString(buf);
    console.log('stringy:', Date.now() - t0, 'ms');
  }
}

// testSpeed();

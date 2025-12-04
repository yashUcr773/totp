import { BASE32, test_buffer } from './0.constants.js';
import { base32Encode } from './2.base32encoder.js';
import { randomBytes } from 'crypto';

/**
 * Decode a Base32-encoded string using bitwise operations.
 *
 * Process overview:
 * 1. Normalize input by removing padding and invalid characters.
 * 2. Convert each Base32 character into its 5-bit value.
 * 3. Accumulate bits into a shifting buffer (`value`).
 * 4. Whenever the buffer has ≥ 8 bits, extract 1 byte.
 * 5. Return the full byte array as a Buffer.
 */
export function base32Decode(str: string) {
  // Normalize the input:
  // - Uppercase ensures consistent alphabet lookup
  // - Remove trailing '=' padding (RFC 4648)
  // - Remove any characters not part of Base32 alphabet
  const clean = str
    .toUpperCase()
    .replace(/=+$/, '')
    .replace(/[^A-Z2-7]/g, '');

  // `bits` tracks how many valid bits are currently stored in `value`
  let bits = 0;

  // `value` acts as a dynamic bit-storage register
  // New 5-bit values are appended here via shifting
  let value = 0;

  // Output bytes collected during decoding
  const bytes = [];

  // Walk through each Base32 character
  for (const ch of clean) {
    // Look up the numeric value of the Base32 character (0–31)
    const index = BASE32.indexOf(ch);

    // Shift left 5 bits to make room for next chunk, then insert the new value
    // This appends the 5 incoming bits to the right end of the bit buffer
    value = (value << 5) | index;

    // We added 5 bits of valid data to the buffer
    bits += 5;

    // If we now have enough bits to form 1 full byte (8 bits)…
    if (bits >= 8) {
      // Extract the topmost 8 bits from `value`
      //   - Shift right to align them to the lowest 8 bits
      //   - Mask with 0xff to ensure we only keep those 8 bits
      const byte = (value >>> (bits - 8)) & 0xff;
      bytes.push(byte);

      // Reduce bit count by 8, since we consumed one byte
      bits -= 8;
    }
  }

  // Convert collected bytes into a Node.js Buffer (raw binary)
  return Buffer.from(bytes);
}

/**
 * Decode a Base32 string into raw bytes using a string-based algorithm (no bitwise operators).
 *
 * Steps:
 * 1. Convert each Base32 character into its Base32 index (0–31).
 * 2. Convert each index into a 5-bit binary string.
 * 3. Join all 5-bit chunks into one long bitstream.
 * 4. Read the bitstream in 8-bit groups to reconstruct original bytes.
 * 5. Return a Buffer from the decoded byte values.
 */
function base32DecoderString(str: string) {
  // Array for holding each Base32 character's index value (0–31)
  let indexes: number[] = [];

  // Array of "5-bit" binary strings representing Base32 values
  let bit32Binary: string[] = [];

  // Long bitstream created by joining the 5-bit chunks
  let binaryString: string = '';

  // Array for storing decoded byte values (0–255)
  let bit64Binary: number[] = [];

  // Hex display version of bytes for human-friendly debugging
  let hexOutput: string[] = [];

  // Convert each Base32 character into a binary representation
  for (let s of str) {
    // Look up the index in the Base32 alphabet (A–Z, 2–7)
    const index = BASE32.indexOf(s);

    indexes.push(index);

    // Convert index to binary and ensure 5 bits (pad with zeros if needed)
    const bit32Bin = index.toString(2).padStart(5, '0');
    bit32Binary.push(bit32Bin);
  }

  // console.log('Base32 indices:', indexes.join('-'));
  // console.log('5-bit binary groups:', bit32Binary.join('-'));

  // Create one continuous bitstream from all the 5-bit chunks
  binaryString = bit32Binary.join('');
  // console.log('Bitstream:', binaryString);

  // Process bitstream in 8-bit segments to rebuild original bytes
  for (let i = 0; i < binaryString.length; i += 8) {
    // Only convert when there are a full 8 bits available
    if (i + 8 <= binaryString.length) {
      const byteBits = binaryString.substring(i, i + 8);
      const byte = parseInt(byteBits, 2); // Convert binary → number (0–255)

      bit64Binary.push(byte);
      hexOutput.push(byte.toString(16));
    }
  }
  // console.log('bit64Binary', bit64Binary.join('-'));
  // console.log(hexOutput.join('-'));

  // Convert array of byte values into a binary Buffer
  return Buffer.from(bit64Binary);
}

console.log('🚀 ~ temp_buffer:', test_buffer);
console.log('🚀 ~ base32Encode:', base32Encode(test_buffer));
console.log('🚀 ~ base32Decode:', base32Decode(base32Encode(test_buffer)));
console.log('🚀 ~ temp_buffer:', base32DecoderString(base32Encode(test_buffer)));

/**
 * quick correctness test
 */
function testSpeed() {
  const sample = base32Encode(randomBytes(32));
  console.log('🚀 ~ testSpeed ~ base32Decode(sample):', base32Decode(sample));
  console.log('🚀 ~ testSpeed ~ base32DecoderString(sample):', base32DecoderString(sample));
  if (base32Decode(sample).toString('hex') !== base32DecoderString(sample).toString('hex')) {
    console.error('Mismatch!');
    process.exit(1);
  }

  for (const size of [4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192]) {
    const buf = base32Encode(randomBytes(size));
    const runs = 100_000;
    console.log(`\nSize: ${size} bytes, runs: ${runs}`);

    let t0 = Date.now();
    for (let i = 0; i < runs; i++) base32Decode(buf);
    console.log('bitwise:', Date.now() - t0, 'ms');

    t0 = Date.now();
    for (let i = 0; i < runs; i++) base32DecoderString(buf);
    console.log('stringy:', Date.now() - t0, 'ms');
  }
}
// testSpeed();

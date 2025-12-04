/**
 * Random Bytes generates a sequence of raw binary values (0-255). Each byte has 8 bits.
 * Random bytes therefore means random 8-bit values
 * They are unpredictable 8-bit data used for cryptographic and security relared purposes
 * It is typically generated using the OS's cryptographically secure psuedo-random number generator
 * So it is unpredicatible and secure but is not truely random.
 *
 * Random Bytes in node js returns <Buffer 67 4c ff 56 f1 ce 76 61 05 c1>.
 * Random bytes represented as hexadecimal values
 */

import { randomBytes } from 'crypto';
const bytes = randomBytes(10);
console.log('🚀 ~ bytes:', bytes);
console.log('🚀 ~ bytes.toString.base64:', bytes.toString('base64'));
console.log('🚀 ~ bytes.toString.ascii:', bytes.toString('ascii'));
console.log('🚀 ~ bytes.toString.hex:', bytes.toString('hex'));
console.log('🚀 ~ bytes.toString.binary:', bytes.toString('binary'));
console.log('🚀 ~ bytes.toString.utf-8:', bytes.toString('utf-8'));

const buffer = Buffer.from('hello world');
console.log(buffer);
console.log(buffer.toString());

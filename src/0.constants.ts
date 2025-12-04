import { randomBytes } from 'crypto';

export const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
export const test_buffer = Buffer.from('my random string');
export const STEP = 30;
export const secret = 'my random pass';
export const DIGITS = 6;

// console.log(randomBytes(30).toString('hex'));

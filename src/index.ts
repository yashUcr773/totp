import { randomBytes } from 'crypto';
import { base32Encode } from './2.base32encoder.js';
import { totp } from './4.generate_totp.js';
import { buildUri } from './6.buildURI.js';

function generateSecret(bytes = 20) {
  return base32Encode(randomBytes(bytes));
}

const secret = generateSecret();
console.log('Your secret:', secret);

setInterval(() => {
  console.log('Current TOTP:', totp(secret));
}, 1000);

const URIString = buildUri(secret, 'myAcc', 'MyApp');
console.log('🚀 ~ URIString:', URIString);

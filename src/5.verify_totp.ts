import { STEP } from './0.constants.js';
import { totp } from './4.generate_totp.js';

/**
 * Verify a user-entered TOTP code.
 *
 * @param secretBase32 - The same Base32-encoded secret used to generate TOTPs
 * @param token        - The user’s input TOTP code (string or number)
 * @param window       - How many time steps forward/backward to allow
 *
 * Returns:
 *   { ok: true, drift: w } if match found
 *     ok:      whether the token is valid
 *     drift:   how many time steps away from exact time (clock skew)
 *
 *   { ok: false } if no match found
 */
export function verifyTotp(secretBase32: string, token: string, window = 1) {
  // Ensure token is exactly 6 digits (like "003817")
  // padStart makes sure missing zeros are added on the left
  token = String(token).padStart(6, '0');

  // Current time in seconds since Unix epoch
  const now = Math.floor(Date.now() / 1000);

  /**
   * Try generating TOTPs for a range of time offsets:
   *
   *  If window = 1, check:
   *    - previous 30s interval  → w = -1
   *    - current interval       → w = 0
   *    - next 30s interval      → w = +1
   *
   *  This accounts for small time mismatches between devices
   */
  for (let w = -window; w <= window; w++) {
    // Compute TOTP for time offset "w" steps
    const t = totp(secretBase32, now + w * STEP);

    // Compare with user input
    if (t === token) {
      // Valid token — device clock is probably "w" steps off
      return { ok: true, drift: w };
    }
  }

  // None matched → invalid token
  return { ok: false };
}

export function buildUri(secret: string, account: string, issuer = 'MyApp') {
  return (
    `otpauth://totp/${issuer}:${account}` +
    `?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`
  );
}

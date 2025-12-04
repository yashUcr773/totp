import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { generateSecret, buildUri, totp, verifyTotp } from '@/lib/totp';
import { RefreshCw, Copy, Check, X, Key, Shield } from 'lucide-react';

export default function TotpApp() {
  const [secret, setSecret] = useState<string>('');
  const [manualSecret, setManualSecret] = useState<string>('');
  const [account, setAccount] = useState<string>('user@example.com');
  const [issuer, setIssuer] = useState<string>('MyApp');
  const [currentTotp, setCurrentTotp] = useState<string>('');
  const [timeRemaining, setTimeRemaining] = useState<number>(30);
  const [verifyCode, setVerifyCode] = useState<string>('');
  const [verifyResult, setVerifyResult] = useState<{ ok: boolean; drift?: number } | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Generate initial secret
  useEffect(() => {
    handleGenerateSecret();
  }, []);

  // Update TOTP code every second
  useEffect(() => {
    if (!secret) return;

    const updateTotp = async () => {
      const code = await totp(secret);
      setCurrentTotp(code);

      const now = Math.floor(Date.now() / 1000);
      const remaining = 30 - (now % 30);
      setTimeRemaining(remaining);
    };

    updateTotp();
    const interval = setInterval(updateTotp, 1000);

    return () => clearInterval(interval);
  }, [secret]);

  const handleGenerateSecret = () => {
    const newSecret = generateSecret();
    setSecret(newSecret);
    setVerifyResult(null);
  };

  const handleUseManualSecret = () => {
    if (manualSecret.trim()) {
      setSecret(manualSecret.trim().toUpperCase());
      setVerifyResult(null);
    }
  };

  const handleVerifyCode = async () => {
    if (!secret || !verifyCode) return;

    const result = await verifyTotp(secret, verifyCode);
    setVerifyResult(result);

    // Auto-clear result after 3 seconds
    setTimeout(() => setVerifyResult(null), 3000);
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const uri = secret ? buildUri(secret, account, issuer) : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 flex items-center justify-center">
      <div className="w-full max-w-4xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">TOTP Generator</h1>
          <p className="text-muted-foreground">Generate and verify Time-based One-Time Passwords</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Secret Generation Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Secret Key
              </CardTitle>
              <CardDescription>Generate a new secret or enter an existing one</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="secret">Your Secret</Label>
                <div className="flex gap-2">
                  <Input
                    id="secret"
                    value={secret}
                    readOnly
                    className="font-mono text-sm"
                    placeholder="Generate or enter a secret"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={handleCopySecret}
                    disabled={!secret}
                    title="Copy secret"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button onClick={handleGenerateSecret} className="w-full" variant="default">
                <RefreshCw className="h-4 w-4" />
                Generate New Secret
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="manual-secret">Enter Existing Secret</Label>
                <div className="flex gap-2">
                  <Input
                    id="manual-secret"
                    value={manualSecret}
                    onChange={e => setManualSecret(e.target.value)}
                    placeholder="Paste your secret here"
                    className="font-mono text-sm"
                  />
                  <Button onClick={handleUseManualSecret} disabled={!manualSecret.trim()}>
                    Use
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="account">Account</Label>
                <Input
                  id="account"
                  value={account}
                  onChange={e => setAccount(e.target.value)}
                  placeholder="user@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="issuer">Issuer</Label>
                <Input
                  id="issuer"
                  value={issuer}
                  onChange={e => setIssuer(e.target.value)}
                  placeholder="MyApp"
                />
              </div>
            </CardContent>
          </Card>

          {/* QR Code and Current TOTP Card */}
          <Card>
            <CardHeader>
              <CardTitle>Scan QR Code</CardTitle>
              <CardDescription>Scan this with your authenticator app</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {secret ? (
                <>
                  <div className="flex justify-center p-4 bg-white rounded-lg">
                    <QRCodeSVG value={uri} size={200} level="H" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Current TOTP Code</Label>
                      <span className="text-sm text-muted-foreground">
                        {timeRemaining}s remaining
                      </span>
                    </div>
                    <div className="relative">
                      <Input
                        value={currentTotp}
                        readOnly
                        className="text-center text-3xl font-mono font-bold tracking-widest"
                      />
                      <div
                        className="absolute bottom-0 left-0 h-1 bg-primary transition-all duration-1000"
                        style={{ width: `${(timeRemaining / 30) * 100}%` }}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  Generate or enter a secret to see QR code
                </div>
              )}
            </CardContent>
          </Card>

          {/* Verification Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Verify TOTP Code
              </CardTitle>
              <CardDescription>Enter a TOTP code to verify it against your secret</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <div className="flex-1 space-y-2">
                  <Input
                    value={verifyCode}
                    onChange={e => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit code"
                    className="text-center text-2xl font-mono tracking-widest"
                    maxLength={6}
                  />
                </div>
                <Button
                  onClick={handleVerifyCode}
                  disabled={!secret || verifyCode.length !== 6}
                  size="lg"
                >
                  Verify
                </Button>
              </div>

              {verifyResult && (
                <div
                  className={`mt-4 p-4 rounded-lg flex items-center gap-2 ${
                    verifyResult.ok
                      ? 'bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100'
                      : 'bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100'
                  }`}
                >
                  {verifyResult.ok ? (
                    <>
                      <Check className="h-5 w-5" />
                      <span className="font-medium">
                        Valid code!{' '}
                        {verifyResult.drift !== 0 && `(drift: ${verifyResult.drift} steps)`}
                      </span>
                    </>
                  ) : (
                    <>
                      <X className="h-5 w-5" />
                      <span className="font-medium">Invalid code</span>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

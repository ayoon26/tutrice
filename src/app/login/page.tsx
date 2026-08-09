'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Header } from '@/components/ui/Header';
import { Screen } from '@/components/ui/Screen';
import { Title, Text, Note } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';

const SUPABASE_CONFIGURED = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function LoginPage() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(searchParams.get('error'));
  const [pending, setPending] = useState(false);

  async function sendLink() {
    setPending(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <Header title="Sign in" showLogo />
      <Screen>
        <Title>Welcome back to Tutrice.</Title>
        {!SUPABASE_CONFIGURED ? (
          <>
            <Text>No Supabase project is configured yet, so authentication is running in demo mode — everyone shares one local tutor account.</Text>
            <Button href="/">Continue as demo tutor</Button>
          </>
        ) : sent ? (
          <Note>Check {email} for a sign-in link.</Note>
        ) : (
          <>
            <Text>We&apos;ll email you a sign-in link — no password to remember.</Text>
            <div className="field" style={{ padding: '6px var(--space-4)' }}>
              <label>Email</label>
              <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            {error && <Note>{error}</Note>}
            <Button onClick={sendLink} disabled={!email} loading={pending} loadingLabel="Sending…">
              Send sign-in link
            </Button>
          </>
        )}
      </Screen>
    </>
  );
}

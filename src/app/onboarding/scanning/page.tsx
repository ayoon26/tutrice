'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/ui/Header';
import { Screen } from '@/components/ui/Screen';
import { Title, Text } from '@/components/ui/Text';
import { AcornRain } from '@/components/ui/AcornRain';
import { Button } from '@/components/ui/Button';

const MIN_VISIBLE_MS = 1400;

export default function ScanningCalendarPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigated = useRef(false);
  const startedFetch = useRef(false);

  useEffect(() => {
    if (startedFetch.current) return; // guards against React StrictMode's double-invoke in dev
    startedFetch.current = true;
    const started = Date.now();
    fetch('/api/calendar/scan', { method: 'POST' })
      .then((res) => {
        if (!res.ok) throw new Error('Calendar scan failed');
        return res.json();
      })
      .then(() => {
        const elapsed = Date.now() - started;
        setTimeout(() => setReady(true), Math.max(0, MIN_VISIBLE_MS - elapsed));
      })
      .catch(() => setError('We had trouble reading your calendar. You can try again.'));
  }, []);

  useEffect(() => {
    if (!ready || navigated.current) return;
    navigated.current = true;
    const t = setTimeout(() => router.push('/onboarding/students'), 900);
    return () => clearTimeout(t);
  }, [ready, router]);

  return (
    <>
      <Header title="Scanning Calendar" showBack />
      <Screen>
        <AcornRain />
        <Title>Reviewing recurring lesson events</Title>
        <Text>{error ?? 'This should only take a moment.'}</Text>
        <Button onClick={() => router.push('/onboarding/students')} disabled={!ready && !error} loading={!ready && !error} loadingLabel="Scanning…">
          Continue
        </Button>
      </Screen>
    </>
  );
}

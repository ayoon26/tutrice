'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Header } from '@/components/ui/Header';
import { Screen } from '@/components/ui/Screen';
import { Title, Note } from '@/components/ui/Text';
import { AcornRain } from '@/components/ui/AcornRain';
import { Button } from '@/components/ui/Button';

const HARVEST_ACORNS = [
  { left: '12%', delay: '0s' },
  { left: '32%', delay: '.25s' },
  { left: '52%', delay: '.1s' },
  { left: '68%', delay: '.4s' },
  { left: '84%', delay: '.15s' },
];

const MIN_VISIBLE_MS = 1400;

export default function ProcessingLessonPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigated = useRef(false);
  const startedFetch = useRef(false);

  useEffect(() => {
    if (startedFetch.current) return; // guards against React StrictMode's double-invoke in dev
    startedFetch.current = true;
    const started = Date.now();
    fetch(`/api/lessons/${id}/process`, { method: 'POST' })
      .then((res) => {
        if (!res.ok) throw new Error('Processing failed');
        return res.json();
      })
      .then(() => {
        const elapsed = Date.now() - started;
        setTimeout(() => setReady(true), Math.max(0, MIN_VISIBLE_MS - elapsed));
      })
      .catch(() => setError('We had trouble processing the lesson. You can try again.'));
  }, [id]);

  useEffect(() => {
    if (!ready || navigated.current) return;
    navigated.current = true;
    const t = setTimeout(() => router.push(`/lesson/${id}/review`), 900);
    return () => clearTimeout(t);
  }, [ready, router, id]);

  return (
    <>
      <Header title="Processing Lesson" showBack />
      <Screen>
        <AcornRain acorns={HARVEST_ACORNS} />
        <Title>We&apos;re identifying progress, challenges, homework, and details that may be useful next time.</Title>
        <Note>{error ?? "Nothing will be added to the student's memory until you review it."}</Note>
        <Button
          onClick={() => router.push(`/lesson/${id}/review`)}
          disabled={!ready && !error}
          loading={!ready && !error}
          loadingLabel="Processing…"
        >
          Continue
        </Button>
      </Screen>
    </>
  );
}

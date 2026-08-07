'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export function StartLessonButton({ studentId, todayFocus }: { studentId: string; todayFocus?: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function start() {
    setPending(true);
    const res = await fetch('/api/lessons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, todayFocus }),
    });
    if (res.ok) {
      const { lesson } = await res.json();
      router.push(`/lesson/${lesson.id}/recording`);
    } else {
      setPending(false);
    }
  }

  return (
    <Button onClick={start} loading={pending} loadingLabel="Starting…" icon={!pending ? <span className="record-dot" /> : undefined}>
      Start recording
    </Button>
  );
}

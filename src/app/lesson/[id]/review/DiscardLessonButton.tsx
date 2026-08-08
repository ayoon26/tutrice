'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export function DiscardLessonButton({ studentId, suggestionIds }: { studentId: string; suggestionIds: string[] }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function discard() {
    setPending(true);
    await fetch(`/api/students/${studentId}/suggestions/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ acceptedIds: [], rejectedIds: suggestionIds }),
    });
    router.push(`/students/${studentId}`);
  }

  return (
    <Button variant="ghost" onClick={discard} loading={pending} loadingLabel="Discarding…">
      Discard lesson summary
    </Button>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Screen } from '@/components/ui/Screen';
import { Title, Text } from '@/components/ui/Text';
import { CheckItem } from '@/components/ui/CheckItem';
import { Button } from '@/components/ui/Button';
import type { Student } from '@/lib/types';

export function DetectedStudentsForm({ students }: { students: Student[] }) {
  const router = useRouter();
  const [checked, setChecked] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(students.map((s) => [s.id, s.confidence === 'high']))
  );
  const [pending, setPending] = useState(false);
  const selected = students.filter((s) => checked[s.id]);

  async function confirm() {
    setPending(true);
    const res = await fetch('/api/students/detected', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: selected.map((s) => s.id) }),
    });
    setPending(false);
    if (res.ok) router.push('/onboarding/complete');
  }

  return (
    <Screen>
      <Title>
        We found {students.length} possible student{students.length === 1 ? '' : 's'}.
      </Title>
      <Text>Confirm the people you tutor. You can correct this list before student memories are created.</Text>
      {students.map((s) => (
        <CheckItem
          key={s.id}
          title={s.name}
          subtitle={[s.subject, s.scheduleSummary].filter(Boolean).join(' · ') || undefined}
          badge={s.confidence === 'high' ? 'High confidence' : 'Low confidence'}
          badgeTone={s.confidence === 'high' ? 'accent' : 'neutral'}
          dim={s.confidence === 'low' && !checked[s.id]}
          checked={!!checked[s.id]}
          onToggle={() => setChecked((c) => ({ ...c, [s.id]: !c[s.id] }))}
        />
      ))}
      <Button variant="ghost" disabled onClick={() => {}}>
        I&apos;m missing someone
      </Button>
      <Button onClick={confirm} disabled={!selected.length} loading={pending} loadingLabel="Adding…">
        Add {selected.length} student{selected.length === 1 ? '' : 's'}
      </Button>
    </Screen>
  );
}

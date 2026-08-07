'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Screen } from '@/components/ui/Screen';
import { Subtitle, Title, Note } from '@/components/ui/Text';
import { Segmented } from '@/components/ui/Segmented';
import { TextareaField } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';

export function PasteForm({ studentId, studentName }: { studentId: string; studentName: string }) {
  const router = useRouter();
  const [kind, setKind] = useState<'parent' | 'note'>('parent');
  const [text, setText] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function detect() {
    setPending(true);
    setError(null);
    const res = await fetch('/api/capture/detect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, text }),
    });
    setPending(false);
    if (res.ok) {
      router.push(`/students/${studentId}/add/review`);
    } else {
      setError('We could not find anything to review in that text.');
    }
  }

  return (
    <Screen>
      <Subtitle>Adding to: {studentName}</Subtitle>
      <Title>Paste message</Title>
      <Segmented
        value={kind}
        onChange={setKind}
        options={[
          { value: 'parent', label: 'Parent message' },
          { value: 'note', label: 'Personal note' },
        ]}
      />
      <TextareaField
        label="Message"
        value={text}
        onChange={setText}
        placeholder={kind === 'parent' ? 'Paste the message here…' : 'Type your note here…'}
      />
      <Note>Only the information you confirm will be added to {studentName.split(' ')[0]}&apos;s memory.</Note>
      {error && <Note>{error}</Note>}
      <Button onClick={detect} disabled={!text.trim()} loading={pending} loadingLabel="Finding details…">
        Find important details
      </Button>
    </Screen>
  );
}

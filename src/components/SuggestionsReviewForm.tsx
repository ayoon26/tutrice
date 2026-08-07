'use client';

import { useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Screen } from '@/components/ui/Screen';
import { CheckItem } from '@/components/ui/CheckItem';
import { Button } from '@/components/ui/Button';
import type { TagTone } from '@/components/ui/Tag';
import type { SuggestedUpdate } from '@/lib/types';

function badgeTone(badge: string | null): TagTone {
  if (badge === 'Temporary' || badge === 'Needs confirmation') return 'outline';
  if (badge === 'New' || badge === 'Updated') return 'accent';
  return 'neutral';
}

// `submitLabel` can't be a function — this form is a Client Component and
// Server Component pages render it, so the label recipe has to be plain,
// serializable data instead of a closure.
export type SubmitLabel = { kind: 'static'; label: string } | { kind: 'counted-updates' } | { kind: 'update-memory'; firstName: string };

function renderLabel(spec: SubmitLabel, checkedCount: number): string {
  switch (spec.kind) {
    case 'static':
      return spec.label;
    case 'counted-updates':
      return `Save ${checkedCount} update${checkedCount === 1 ? '' : 's'}`;
    case 'update-memory':
      return `Update ${spec.firstName}'s memory`;
  }
}

export function SuggestionsReviewForm({
  studentId,
  suggestions,
  nextHref,
  submitLabel,
  intro,
  secondaryAction,
}: {
  studentId: string;
  suggestions: SuggestedUpdate[];
  nextHref: string;
  submitLabel: SubmitLabel;
  intro?: ReactNode;
  secondaryAction?: ReactNode;
}) {
  const router = useRouter();
  const [checked, setChecked] = useState<Record<string, boolean>>(() => Object.fromEntries(suggestions.map((s) => [s.id, true])));
  const [pending, setPending] = useState(false);
  const checkedCount = Object.values(checked).filter(Boolean).length;

  async function submit() {
    setPending(true);
    const acceptedIds = suggestions.filter((s) => checked[s.id]).map((s) => s.id);
    const rejectedIds = suggestions.filter((s) => !checked[s.id]).map((s) => s.id);
    const res = await fetch(`/api/students/${studentId}/suggestions/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ acceptedIds, rejectedIds }),
    });
    setPending(false);
    if (res.ok) router.push(nextHref);
  }

  return (
    <Screen>
      {intro}
      {suggestions.map((s) => (
        <CheckItem
          key={s.id}
          title={s.label}
          badge={s.badge ?? undefined}
          badgeTone={badgeTone(s.badge)}
          checked={!!checked[s.id]}
          onToggle={() => setChecked((c) => ({ ...c, [s.id]: !c[s.id] }))}
        />
      ))}
      <Button onClick={submit} disabled={!checkedCount} loading={pending} loadingLabel="Saving…">
        {renderLabel(submitLabel, checkedCount)}
      </Button>
      {secondaryAction}
    </Screen>
  );
}

import { NextResponse } from 'next/server';
import { requireTutorId } from '@/lib/auth';
import { db } from '@/lib/data';
import { extractOnboardingPreference } from '@/lib/integrations/ai';
import type { MemoryCategory } from '@/lib/types';

export async function POST(request: Request) {
  const tutorId = await requireTutorId();
  const { ids } = (await request.json()) as { ids: string[] };
  if (!ids?.length) return NextResponse.json({ students: [] });

  const confirmed = await db.confirmStudents(tutorId, ids);

  for (const student of confirmed) {
    const facts: Array<{ category: MemoryCategory; label: string }> = [];
    if (student.subject) facts.push({ category: 'note', label: `Subject: ${student.subject}` });
    if (student.scheduleSummary) facts.push({ category: 'schedule', label: `Schedule: ${student.scheduleSummary}` });

    const notes = await db.getCalendarNotes(student.id);
    const inferred = notes ? await extractOnboardingPreference(notes, student.name) : [];

    const toReview = [
      ...facts.map((f) => ({ ...f, value: null as string | null, badge: null as string | null })),
      ...inferred.map((u) => ({ category: u.category, label: u.label, value: u.value, badge: 'Needs confirmation' })),
    ];
    if (toReview.length) {
      await db.createSuggestedUpdates(
        toReview.map((u) => ({ studentId: student.id, lessonId: null, source: 'onboarding', ...u }))
      );
    }
  }

  return NextResponse.json({ students: confirmed });
}

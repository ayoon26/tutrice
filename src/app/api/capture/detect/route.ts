import { NextResponse } from 'next/server';
import { requireTutorId } from '@/lib/auth';
import { db } from '@/lib/data';
import { extractTextUpdates } from '@/lib/integrations/ai';

export async function POST(request: Request) {
  const tutorId = await requireTutorId();
  const { studentId, text } = (await request.json()) as { studentId: string; text: string };
  const student = await db.getStudent(tutorId, studentId);
  if (!student) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (!text?.trim()) return NextResponse.json({ error: 'Nothing to review' }, { status: 400 });

  const extracted = await extractTextUpdates(text, student.name);
  const created = extracted.length
    ? await db.createSuggestedUpdates(
        extracted.map((u) => ({ studentId, lessonId: null, source: 'manual', category: u.category, label: u.label, value: u.value, badge: u.badge }))
      )
    : [];

  return NextResponse.json({ suggestions: created });
}

import { NextResponse } from 'next/server';
import { requireTutorId } from '@/lib/auth';
import { db } from '@/lib/data';

export async function POST(request: Request, ctx: RouteContext<'/api/students/[id]/suggestions/resolve'>) {
  const tutorId = await requireTutorId();
  const { id } = await ctx.params;
  const student = await db.getStudent(tutorId, id);
  if (!student) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { acceptedIds, rejectedIds } = (await request.json()) as { acceptedIds: string[]; rejectedIds: string[] };
  const accepted = await db.resolveSuggestedUpdates(acceptedIds ?? [], rejectedIds ?? []);

  if (accepted.length) {
    await db.addMemoryItems(
      accepted.map((u) => ({ studentId: id, category: u.category, label: u.label, value: u.value, source: u.source }))
    );
  }

  const lessonId = accepted.find((u) => u.lessonId)?.lessonId;
  if (lessonId) await db.updateLesson(lessonId, { status: 'reviewed' });

  return NextResponse.json({ acceptedCount: accepted.length });
}

import { NextResponse } from 'next/server';
import { requireTutorId } from '@/lib/auth';
import { db } from '@/lib/data';
import { storeLessonAudio } from '@/lib/integrations/audioStore';

export async function POST(request: Request, ctx: RouteContext<'/api/lessons/[id]/recording'>) {
  const tutorId = await requireTutorId();
  const { id } = await ctx.params;
  const lesson = await db.getLesson(id);
  if (!lesson) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const student = await db.getStudent(tutorId, lesson.studentId);
  if (!student) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const form = await request.formData();
  const file = form.get('audio');

  if (file instanceof File && file.size > 0) {
    const bytes = Buffer.from(await file.arrayBuffer());
    const path = await storeLessonAudio(id, bytes, file.type || 'audio/webm');
    await db.updateLesson(id, { audioUrl: path, status: 'processing' });
  } else {
    await db.updateLesson(id, { status: 'processing' });
  }

  return NextResponse.json({ ok: true });
}

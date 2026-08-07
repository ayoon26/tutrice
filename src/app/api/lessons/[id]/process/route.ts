import { NextResponse } from 'next/server';
import { requireTutorId } from '@/lib/auth';
import { db } from '@/lib/data';
import { readLessonAudio, deleteLessonAudio } from '@/lib/integrations/audioStore';
import { transcribeAudio, MOCK_TRANSCRIPT } from '@/lib/integrations/transcription';
import { extractLessonUpdates } from '@/lib/integrations/ai';

export async function POST(_request: Request, ctx: RouteContext<'/api/lessons/[id]/process'>) {
  const tutorId = await requireTutorId();
  const { id } = await ctx.params;
  const lesson = await db.getLesson(id);
  if (!lesson) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const student = await db.getStudent(tutorId, lesson.studentId);
  if (!student) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  let transcript = lesson.transcript;
  if (!transcript) {
    const audio = lesson.audioUrl ? await readLessonAudio(id) : null;
    if (audio) {
      const result = await transcribeAudio(new Blob([new Uint8Array(audio.buffer)], { type: audio.contentType }));
      transcript = result.transcript;
    } else {
      transcript = MOCK_TRANSCRIPT;
    }

    const extracted = await extractLessonUpdates(transcript, student.name);
    if (extracted.length) {
      await db.createSuggestedUpdates(
        extracted.map((u) => ({ studentId: student.id, lessonId: id, source: 'lesson', category: u.category, label: u.label, value: u.value, badge: u.badge }))
      );
    }
    await db.updateLesson(id, { transcript, summary: transcript.length > 180 ? `${transcript.slice(0, 180)}…` : transcript });
    if (lesson.audioUrl) await deleteLessonAudio(id);
  }

  return NextResponse.json({ ok: true });
}

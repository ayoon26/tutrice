import { NextResponse } from 'next/server';
import { requireTutorId } from '@/lib/auth';
import { db } from '@/lib/data';

export async function POST(request: Request) {
  const tutorId = await requireTutorId();
  const { studentId, todayFocus } = (await request.json()) as { studentId: string; todayFocus?: string };
  const student = await db.getStudent(tutorId, studentId);
  if (!student) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const lesson = await db.createLesson(studentId, todayFocus ?? null);
  return NextResponse.json({ lesson });
}

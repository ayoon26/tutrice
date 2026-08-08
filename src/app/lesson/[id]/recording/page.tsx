import { notFound, redirect } from 'next/navigation';
import { requireTutorId } from '@/lib/auth';
import { db } from '@/lib/data';
import { Header } from '@/components/ui/Header';
import { RecordingScreen } from './RecordingScreen';

export default async function ActiveLessonRecordingPage({ params }: PageProps<'/lesson/[id]/recording'>) {
  const tutorId = await requireTutorId();
  const { id } = await params;
  const lesson = await db.getLesson(id);
  if (!lesson) notFound();
  const student = await db.getStudent(tutorId, lesson.studentId);
  if (!student) notFound();
  if (lesson.status !== 'recording') redirect(`/lesson/${id}/processing`);

  return (
    <>
      <Header title="Active Lesson Recording" showBack />
      <RecordingScreen lessonId={id} studentName={student.name} todayFocus={lesson.todayFocus} />
    </>
  );
}

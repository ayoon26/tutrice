import { notFound } from 'next/navigation';
import { requireTutorId } from '@/lib/auth';
import { db } from '@/lib/data';
import { Header } from '@/components/ui/Header';
import { Screen } from '@/components/ui/Screen';
import { Mascot } from '@/components/ui/Mascot';
import { Title, Text, Note } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';

export default async function LessonDonePage({ params }: PageProps<'/lesson/[id]/done'>) {
  const tutorId = await requireTutorId();
  const { id } = await params;
  const lesson = await db.getLesson(id);
  if (!lesson) notFound();
  const student = await db.getStudent(tutorId, lesson.studentId);
  if (!student) notFound();

  const accepted = await db.listSuggestedUpdates(student.id, { lessonId: id, source: 'lesson', status: 'accepted' });
  const memory = await db.listMemory(student.id);
  const request = [...memory].reverse().find((m) => m.category === 'request');

  return (
    <>
      <Header title="Lesson Memory Updated" showBack />
      <Screen>
        <Mascot />
        <Title>{student.name}&apos;s memory is updated.</Title>
        <Text>
          We saved the lesson summary and added {accepted.length} reviewed detail{accepted.length === 1 ? '' : 's'}.
        </Text>
        {request && <Note>{request.label}</Note>}
        <Button variant="ghost" disabled>
          Draft parent update
        </Button>
        <Button href={`/students/${student.id}`}>View updated memory</Button>
        <Button variant="secondary" href="/today">
          Back to Today
        </Button>
      </Screen>
    </>
  );
}

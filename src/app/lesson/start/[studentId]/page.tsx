import { notFound } from 'next/navigation';
import { requireTutorId } from '@/lib/auth';
import { db } from '@/lib/data';
import { Header } from '@/components/ui/Header';
import { Screen } from '@/components/ui/Screen';
import { Subtitle, Title, Text, Note } from '@/components/ui/Text';
import { Item } from '@/components/ui/Item';
import { Button } from '@/components/ui/Button';
import { StartLessonButton } from '@/components/StartLessonButton';

export default async function LessonStartPage({ params }: PageProps<'/lesson/start/[studentId]'>) {
  const tutorId = await requireTutorId();
  const { studentId } = await params;
  const student = await db.getStudent(tutorId, studentId);
  if (!student) notFound();

  return (
    <>
      <Header title="Start Lesson" showBack />
      <Screen>
        <Subtitle>
          {student.name}
          {student.subject ? ` · ${student.subject}` : ''} · Today
        </Subtitle>
        <Title>Capture the lesson without taking notes.</Title>
        <Text>After the lesson, Tutrice will suggest progress, difficulties, homework, and details worth adding to {student.name.split(' ')[0]}&apos;s memory.</Text>
        <Note>Make sure everyone present knows the lesson is being recorded.</Note>
        <Item title="Record audio and create a lesson summary" />
        <Item title="Keep audio until the summary is reviewed" />
        <Item title="Delete audio after processing" />
        <StartLessonButton studentId={studentId} />
        <Button variant="ghost" disabled>
          Continue without recording
        </Button>
      </Screen>
    </>
  );
}

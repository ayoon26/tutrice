import { notFound } from 'next/navigation';
import { requireTutorId } from '@/lib/auth';
import { db } from '@/lib/data';
import { Header } from '@/components/ui/Header';
import { Screen } from '@/components/ui/Screen';
import { Subtitle, SectionLabel, Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default async function PreparePage({ params }: PageProps<'/today/prepare/[studentId]'>) {
  const tutorId = await requireTutorId();
  const { studentId } = await params;
  const student = await db.getStudent(tutorId, studentId);
  if (!student) notFound();

  const memory = await db.listMemory(studentId);
  const latestOf = (category: string) => [...memory].reverse().find((m) => m.category === category);
  const preference = latestOf('learning_preference');
  const challenge = latestOf('challenge');
  const progress = latestOf('progress');
  const request = latestOf('request');

  const remember = [preference?.label, challenge?.label].filter(Boolean).join(' ') || `No notes yet for ${student.name} — this will be their first tracked lesson.`;

  return (
    <>
      <Header title={`Prepare for ${student.name.split(' ')[0]}`} showBack />
      <Screen>
        <Subtitle>Ready when you are</Subtitle>
        <SectionLabel>What to remember today</SectionLabel>
        <Text>{remember}</Text>
        <SectionLabel>Suggested lesson focus</SectionLabel>
        {progress && <Card title="Since your last lesson" plainLines={[progress.label]} />}
        {request && <Card title="After the lesson" plainLines={[request.label]} />}
        <Button href={`/lesson/start/${studentId}`}>Start lesson</Button>
        <Button variant="secondary" href={`/students/${studentId}`}>
          Open full student memory
        </Button>
        <Button variant="ghost" disabled>
          Edit today&apos;s focus
        </Button>
      </Screen>
    </>
  );
}

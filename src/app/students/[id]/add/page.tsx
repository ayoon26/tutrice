import { notFound } from 'next/navigation';
import { requireTutorId } from '@/lib/auth';
import { db } from '@/lib/data';
import { Header } from '@/components/ui/Header';
import { Screen } from '@/components/ui/Screen';
import { Subtitle, SectionLabel, Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';

export default async function AddInformationMenuPage({ params }: PageProps<'/students/[id]/add'>) {
  const tutorId = await requireTutorId();
  const { id } = await params;
  const student = await db.getStudent(tutorId, id);
  if (!student) notFound();

  const memory = await db.listMemory(id);
  const latestOf = (category: string) => [...memory].reverse().find((m) => m.category === category);
  const remember = [latestOf('learning_preference')?.label, latestOf('challenge')?.label].filter(Boolean).join(' ') || 'Nothing recorded yet.';

  return (
    <>
      <Header title="Add Information Menu" showBack />
      <Screen>
        <Subtitle>
          {student.name}
          {student.subject ? ` · ${student.subject}` : ''}
        </Subtitle>
        <SectionLabel>Current learning</SectionLabel>
        <Text>What to remember today: {remember}</Text>
        <Text>We&apos;ll organize it and show you what may change. You&apos;ll review detected details before they are saved.</Text>
        <Button href={`/students/${id}/add/paste`}>Add something about {student.name.split(' ')[0]}</Button>
      </Screen>
    </>
  );
}

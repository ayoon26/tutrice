import { notFound } from 'next/navigation';
import { requireTutorId } from '@/lib/auth';
import { db } from '@/lib/data';
import { Header } from '@/components/ui/Header';
import { Screen } from '@/components/ui/Screen';
import { Mascot } from '@/components/ui/Mascot';
import { Title, Text, SectionLabel } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';

export default async function ManualUpdateDonePage({ params }: PageProps<'/students/[id]/add/done'>) {
  const tutorId = await requireTutorId();
  const { id } = await params;
  const student = await db.getStudent(tutorId, id);
  if (!student) notFound();

  const accepted = await db.listSuggestedUpdates(id, { source: 'manual', status: 'accepted' });
  const memory = await db.listMemory(id);
  const remember = [...memory].reverse().slice(0, 2).map((m) => m.label).join(' ') || 'Nothing recorded yet.';

  return (
    <>
      <Header title="Manual Memory Update Success" showBack />
      <Screen>
        <Mascot />
        <Title>{student.name}&apos;s memory is up to date.</Title>
        <Text>
          We added {accepted.length} reviewed detail{accepted.length === 1 ? '' : 's'}.
        </Text>
        <SectionLabel>What to remember today</SectionLabel>
        <Text>{remember}</Text>
        <Button href={`/students/${id}`}>View updated memory</Button>
        <Button variant="secondary" href="/today">
          Back to Today
        </Button>
      </Screen>
    </>
  );
}

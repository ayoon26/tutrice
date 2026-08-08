import { notFound } from 'next/navigation';
import { requireTutorId } from '@/lib/auth';
import { db } from '@/lib/data';
import { categoryLabel } from '@/lib/format';
import { Header } from '@/components/ui/Header';
import { Screen } from '@/components/ui/Screen';
import { Subtitle, SectionLabel } from '@/components/ui/Text';
import { Item } from '@/components/ui/Item';
import { Button } from '@/components/ui/Button';
import type { MemoryCategory } from '@/lib/types';

const CATEGORY_ORDER: MemoryCategory[] = [
  'learning_preference',
  'goal',
  'request',
  'schedule',
  'progress',
  'challenge',
  'technique',
  'homework',
  'note',
];

export default async function StudentMemoryPage({ params }: PageProps<'/students/[id]'>) {
  const tutorId = await requireTutorId();
  const { id } = await params;
  const student = await db.getStudent(tutorId, id);
  if (!student) notFound();

  const memory = await db.listMemory(id);
  const byCategory = new Map<MemoryCategory, typeof memory>();
  for (const item of memory) {
    byCategory.set(item.category, [...(byCategory.get(item.category) ?? []), item]);
  }

  return (
    <>
      <Header title={`${student.name}'s Student Memory`} showBack />
      <Screen>
        <Subtitle>{student.subject ?? 'Tutoring'}{student.scheduleSummary ? ` · ${student.scheduleSummary}` : ''}</Subtitle>
        {CATEGORY_ORDER.filter((c) => byCategory.has(c)).map((category) => (
          <div key={category}>
            <SectionLabel>{categoryLabel(category)}</SectionLabel>
            {byCategory.get(category)!.map((item) => (
              <Item key={item.id} title={item.label} subtitle={item.value ?? undefined} />
            ))}
          </div>
        ))}
        {!memory.length && <Item title="No memory recorded yet." />}
        <Button href={`/today/prepare/${id}`}>Prepare</Button>
        <Button variant="secondary" href={`/students/${id}/add`}>
          Add information
        </Button>
      </Screen>
    </>
  );
}

import { redirect } from 'next/navigation';
import { requireTutorId } from '@/lib/auth';
import { db } from '@/lib/data';
import { Header } from '@/components/ui/Header';
import { Screen } from '@/components/ui/Screen';
import { Title, Text, SectionLabel } from '@/components/ui/Text';
import { Item } from '@/components/ui/Item';
import { Button } from '@/components/ui/Button';

export default async function StudentMemoriesCreatedPage() {
  const tutorId = await requireTutorId();
  const confirmed = await db.listStudents(tutorId, 'confirmed');
  if (!confirmed.length) redirect('/onboarding/students');

  const withReviewFlag = await Promise.all(
    confirmed.map(async (s) => ({
      student: s,
      pending: (await db.listSuggestedUpdates(s.id, { source: 'onboarding', status: 'pending' })).length > 0,
    }))
  );
  const firstToReview = withReviewFlag.find((s) => s.pending) ?? withReviewFlag[0];

  return (
    <>
      <Header title="Student Memories Created" showBack />
      <Screen>
        <Title>Your student list is ready.</Title>
        <Text>We created an initial memory for each confirmed student using their lesson schedules and available notes.</Text>
        <SectionLabel>Confirmed students</SectionLabel>
        {withReviewFlag.map(({ student, pending }) => (
          <Item
            key={student.id}
            title={student.name}
            subtitle={pending ? 'We found learning context from calendar notes.' : 'Calendar details only'}
            badge={pending ? 'Ready to review' : 'Calendar details only'}
            badgeTone={pending ? 'accent' : 'neutral'}
          />
        ))}
        <Button href={`/onboarding/review/${firstToReview.student.id}`}>Review {firstToReview.student.name.split(' ')[0]}&apos;s memory</Button>
      </Screen>
    </>
  );
}

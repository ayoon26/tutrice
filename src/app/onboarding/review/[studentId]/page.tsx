import { notFound, redirect } from 'next/navigation';
import { requireTutorId } from '@/lib/auth';
import { db } from '@/lib/data';
import { Header } from '@/components/ui/Header';
import { Title, Text } from '@/components/ui/Text';
import { SuggestionsReviewForm } from '@/components/SuggestionsReviewForm';

export default async function OnboardingMemoryReviewPage({ params }: PageProps<'/onboarding/review/[studentId]'>) {
  const tutorId = await requireTutorId();
  const { studentId } = await params;
  const student = await db.getStudent(tutorId, studentId);
  if (!student) notFound();

  const suggestions = await db.listSuggestedUpdates(studentId, { source: 'onboarding', status: 'pending' });
  if (!suggestions.length) redirect('/onboarding/done');
  const firstName = student.name.split(' ')[0];

  return (
    <>
      <Header title="Onboarding Student Memory Review" showBack />
      <SuggestionsReviewForm
        studentId={studentId}
        suggestions={suggestions}
        nextHref="/onboarding/done"
        submitLabel={{ kind: 'static', label: 'Everything looks right' }}
        intro={
          <>
            <Title>Here&apos;s what we understood about {firstName}.</Title>
            <Text>Confirm what looks right. Correct or remove anything we misunderstood.</Text>
          </>
        }
      />
    </>
  );
}

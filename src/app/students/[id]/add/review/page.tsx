import { notFound, redirect } from 'next/navigation';
import { requireTutorId } from '@/lib/auth';
import { db } from '@/lib/data';
import { Header } from '@/components/ui/Header';
import { Title, Text } from '@/components/ui/Text';
import { SuggestionsReviewForm } from '@/components/SuggestionsReviewForm';

export default async function ReviewDetectedInfoPage({ params }: PageProps<'/students/[id]/add/review'>) {
  const tutorId = await requireTutorId();
  const { id } = await params;
  const student = await db.getStudent(tutorId, id);
  if (!student) notFound();

  const suggestions = await db.listSuggestedUpdates(id, { source: 'manual', status: 'pending' });
  if (!suggestions.length) redirect(`/students/${id}/add/paste`);

  return (
    <>
      <Header title="Review Detected Information" showBack />
      <SuggestionsReviewForm
        studentId={id}
        suggestions={suggestions}
        nextHref={`/students/${id}/add/done`}
        submitLabel={{ kind: 'update-memory', firstName: student.name.split(' ')[0] }}
        intro={
          <>
            <Title>
              We found {suggestions.length} detail{suggestions.length === 1 ? '' : 's'}.
            </Title>
            <Text>Review what should be added or changed.</Text>
          </>
        }
      />
    </>
  );
}

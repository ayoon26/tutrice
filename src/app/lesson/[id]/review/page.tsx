import { notFound, redirect } from 'next/navigation';
import { requireTutorId } from '@/lib/auth';
import { db } from '@/lib/data';
import { Header } from '@/components/ui/Header';
import { Title, Text } from '@/components/ui/Text';
import { SuggestionsReviewForm } from '@/components/SuggestionsReviewForm';
import { DiscardLessonButton } from './DiscardLessonButton';

export default async function ReviewLessonPage({ params }: PageProps<'/lesson/[id]/review'>) {
  const tutorId = await requireTutorId();
  const { id } = await params;
  const lesson = await db.getLesson(id);
  if (!lesson) notFound();
  const student = await db.getStudent(tutorId, lesson.studentId);
  if (!student) notFound();

  const suggestions = await db.listSuggestedUpdates(student.id, { lessonId: id, source: 'lesson', status: 'pending' });
  if (!suggestions.length) redirect(`/lesson/${id}/done`);

  return (
    <>
      <Header title="Review Lesson Details" showBack />
      <SuggestionsReviewForm
        studentId={student.id}
        suggestions={suggestions}
        nextHref={`/lesson/${id}/done`}
        submitLabel={{ kind: 'counted-updates' }}
        intro={
          <>
            <Title>Review lesson</Title>
            <Text>{lesson.summary ?? 'Here is what came up during the lesson.'}</Text>
          </>
        }
        secondaryAction={<DiscardLessonButton studentId={student.id} suggestionIds={suggestions.map((s) => s.id)} />}
      />
    </>
  );
}

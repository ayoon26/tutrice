import { notFound } from 'next/navigation';
import { requireTutorId } from '@/lib/auth';
import { db } from '@/lib/data';
import { Header } from '@/components/ui/Header';
import { PasteForm } from './PasteForm';

export default async function PasteMessagePage({ params }: PageProps<'/students/[id]/add/paste'>) {
  const tutorId = await requireTutorId();
  const { id } = await params;
  const student = await db.getStudent(tutorId, id);
  if (!student) notFound();

  return (
    <>
      <Header title="Paste Message" showBack />
      <PasteForm studentId={id} studentName={student.name} />
    </>
  );
}

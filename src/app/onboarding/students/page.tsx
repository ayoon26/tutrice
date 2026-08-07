import { redirect } from 'next/navigation';
import { requireTutorId } from '@/lib/auth';
import { db } from '@/lib/data';
import { Header } from '@/components/ui/Header';
import { DetectedStudentsForm } from './DetectedStudentsForm';

export default async function DetectedStudentsPage() {
  const tutorId = await requireTutorId();
  const detected = await db.listStudents(tutorId, 'detected');
  if (!detected.length) redirect('/onboarding/connect');

  return (
    <>
      <Header title="Detected Students" showBack />
      <DetectedStudentsForm students={detected} />
    </>
  );
}

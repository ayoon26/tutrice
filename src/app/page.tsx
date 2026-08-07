import { redirect } from 'next/navigation';
import { requireTutorId } from '@/lib/auth';
import { db } from '@/lib/data';

export default async function RootPage() {
  const tutorId = await requireTutorId();
  const confirmed = await db.listStudents(tutorId, 'confirmed');
  redirect(confirmed.length ? '/today' : '/onboarding');
}

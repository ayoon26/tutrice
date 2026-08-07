import { NextResponse } from 'next/server';
import { requireTutorId } from '@/lib/auth';
import { db } from '@/lib/data';
import { hasGoogleOAuth } from '@/lib/config';
import { scanCalendarForStudents, type DetectedStudent } from '@/lib/integrations/googleCalendar';
import { MOCK_DETECTED_STUDENTS } from '@/lib/mock/seed';

export async function POST() {
  const tutorId = await requireTutorId();

  let detected: DetectedStudent[];
  const accessToken = hasGoogleOAuth ? await db.getCalendarAccessToken(tutorId) : null;
  if (accessToken) {
    detected = await scanCalendarForStudents(accessToken);
  } else {
    detected = MOCK_DETECTED_STUDENTS;
  }

  const created = await db.createDetectedStudents(
    tutorId,
    detected.map(({ name, subject, scheduleSummary, confidence, notes }) => ({ name, subject, scheduleSummary, confidence, notes }))
  );

  return NextResponse.json({ students: created });
}

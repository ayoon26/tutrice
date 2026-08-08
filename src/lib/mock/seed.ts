import type { DetectedStudent } from '@/lib/integrations/googleCalendar';

// Used when Google Calendar isn't configured, so the onboarding scan step
// still has something believable to show and confirm.
export const MOCK_DETECTED_STUDENTS: DetectedStudent[] = [
  {
    name: 'Sarah Kim',
    subject: 'Algebra',
    scheduleSummary: 'Tuesdays and Thursdays at 4:00 PM',
    confidence: 'high',
    notes: 'Sarah picks things up fastest when she can see the steps drawn out — diagrams help a lot.',
  },
  { name: 'Daniel Lee', subject: 'Geometry', scheduleSummary: 'Wednesdays at 5:30 PM', confidence: 'high' },
  { name: 'Dentist', subject: null, scheduleSummary: 'One appointment', confidence: 'low' },
];

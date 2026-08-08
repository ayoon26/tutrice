export type Confidence = 'high' | 'low' | null;

export type StudentStatus = 'detected' | 'confirmed';

export interface Student {
  id: string;
  tutorId: string;
  name: string;
  subject: string | null;
  scheduleSummary: string | null;
  confidence: Confidence;
  status: StudentStatus;
  createdAt: string;
}

export type MemoryCategory =
  | 'learning_preference'
  | 'goal'
  | 'schedule'
  | 'progress'
  | 'challenge'
  | 'technique'
  | 'homework'
  | 'request'
  | 'note';

export type MemorySource = 'calendar' | 'lesson' | 'manual' | 'onboarding';

// A memory item is always confirmed — anything awaiting a tutor's review
// lives in `suggested_updates` until they accept it, at which point it's
// promoted into a MemoryItem.
export interface MemoryItem {
  id: string;
  studentId: string;
  category: MemoryCategory;
  label: string;
  value: string | null;
  source: MemorySource;
  createdAt: string;
}

export type LessonStatus = 'scheduled' | 'recording' | 'processing' | 'reviewed';

export interface Lesson {
  id: string;
  studentId: string;
  scheduledAt: string | null;
  status: LessonStatus;
  todayFocus: string | null;
  audioUrl: string | null;
  transcript: string | null;
  summary: string | null;
  createdAt: string;
}

export type SuggestionSource = 'onboarding' | 'lesson' | 'manual';

export interface SuggestedUpdate {
  id: string;
  studentId: string;
  lessonId: string | null;
  source: SuggestionSource;
  category: MemoryCategory;
  label: string;
  value: string | null;
  badge: string | null;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface CalendarConnection {
  tutorId: string;
  provider: 'google';
  connectedAt: string;
}

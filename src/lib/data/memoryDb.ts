import type { Lesson, MemoryItem, Student, SuggestedUpdate } from '@/lib/types';

interface StoredCalendarConnection {
  tutorId: string;
  accessToken: string;
  refreshToken: string | null;
  expiresAt: string | null;
  connectedAt: string;
}

// Process-local store used whenever Supabase isn't configured. Good enough
// for a single-instance dev/demo deployment; real persistence takes over
// automatically the moment Supabase env vars are set.
//
// Held on `globalThis` rather than a plain module-level variable: Next.js's
// dev server (and Turbopack's per-route module graphs) can otherwise end up
// with more than one instance of this module alive at once, which would
// silently split the "database" in two.
interface MemoryStore {
  students: Map<string, Student>;
  calendarNotes: Map<string, string>;
  memoryItems: Map<string, MemoryItem>;
  lessons: Map<string, Lesson>;
  suggestedUpdates: Map<string, SuggestedUpdate>;
  calendarConnections: Map<string, StoredCalendarConnection>;
}

const globalForStore = globalThis as unknown as { __tutriceMemoryStore?: MemoryStore };
const store: MemoryStore =
  globalForStore.__tutriceMemoryStore ??
  (globalForStore.__tutriceMemoryStore = {
    students: new Map(),
    calendarNotes: new Map(),
    memoryItems: new Map(),
    lessons: new Map(),
    suggestedUpdates: new Map(),
    calendarConnections: new Map(),
  });

const { students, calendarNotes, memoryItems, lessons, suggestedUpdates, calendarConnections } = store;

const newId = () => crypto.randomUUID();
const now = () => new Date().toISOString();

export const memoryDb = {
  // ── students ──────────────────────────────────────────────────────────
  listStudents(tutorId: string, status?: Student['status']) {
    return [...students.values()]
      .filter((s) => s.tutorId === tutorId && (!status || s.status === status))
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },
  getStudent(tutorId: string, id: string) {
    const s = students.get(id);
    return s && s.tutorId === tutorId ? s : null;
  },
  createDetectedStudents(
    tutorId: string,
    detected: Array<Pick<Student, 'name' | 'subject' | 'scheduleSummary' | 'confidence'> & { notes?: string }>
  ) {
    return detected.map((d) => {
      const student: Student = {
        id: newId(),
        tutorId,
        name: d.name,
        subject: d.subject,
        scheduleSummary: d.scheduleSummary,
        confidence: d.confidence,
        status: 'detected',
        createdAt: now(),
      };
      students.set(student.id, student);
      if (d.notes) calendarNotes.set(student.id, d.notes);
      return student;
    });
  },
  getCalendarNotes(studentId: string) {
    return calendarNotes.get(studentId) ?? null;
  },
  confirmStudents(tutorId: string, ids: string[]) {
    const confirmed: Student[] = [];
    for (const id of ids) {
      const s = students.get(id);
      if (!s || s.tutorId !== tutorId) continue;
      const updated: Student = { ...s, status: 'confirmed' };
      students.set(id, updated);
      confirmed.push(updated);
    }
    return confirmed;
  },

  // ── memory items ─────────────────────────────────────────────────────
  listMemory(studentId: string) {
    return [...memoryItems.values()]
      .filter((m) => m.studentId === studentId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },
  addMemoryItems(items: Array<Omit<MemoryItem, 'id' | 'createdAt'>>) {
    return items.map((item) => {
      const record: MemoryItem = { ...item, id: newId(), createdAt: now() };
      memoryItems.set(record.id, record);
      return record;
    });
  },

  // ── calendar connection ──────────────────────────────────────────────
  getCalendarConnection(tutorId: string) {
    const conn = calendarConnections.get(tutorId);
    return conn ? { tutorId: conn.tutorId, provider: 'google' as const, connectedAt: conn.connectedAt } : null;
  },
  setCalendarConnection(tutorId: string, tokens: { accessToken: string; refreshToken: string | null; expiresAt: string | null }) {
    calendarConnections.set(tutorId, { tutorId, ...tokens, connectedAt: now() });
  },
  getCalendarAccessToken(tutorId: string) {
    return calendarConnections.get(tutorId)?.accessToken ?? null;
  },

  // ── lessons ──────────────────────────────────────────────────────────
  createLesson(studentId: string, todayFocus: string | null) {
    const lesson: Lesson = {
      id: newId(),
      studentId,
      scheduledAt: now(),
      status: 'recording',
      todayFocus,
      audioUrl: null,
      transcript: null,
      summary: null,
      createdAt: now(),
    };
    lessons.set(lesson.id, lesson);
    return lesson;
  },
  getLesson(id: string) {
    return lessons.get(id) ?? null;
  },
  updateLesson(id: string, patch: Partial<Lesson>) {
    const cur = lessons.get(id);
    if (!cur) return null;
    const updated = { ...cur, ...patch };
    lessons.set(id, updated);
    return updated;
  },

  // ── suggested updates ────────────────────────────────────────────────
  listSuggestedUpdates(studentId: string, filter?: { lessonId?: string; source?: SuggestedUpdate['source']; status?: SuggestedUpdate['status'] }) {
    return [...suggestedUpdates.values()]
      .filter(
        (u) =>
          u.studentId === studentId &&
          (!filter?.lessonId || u.lessonId === filter.lessonId) &&
          (!filter?.source || u.source === filter.source) &&
          (!filter?.status || u.status === filter.status)
      )
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },
  createSuggestedUpdates(items: Array<Omit<SuggestedUpdate, 'id' | 'createdAt' | 'status'>>) {
    return items.map((item) => {
      const record: SuggestedUpdate = { ...item, id: newId(), status: 'pending', createdAt: now() };
      suggestedUpdates.set(record.id, record);
      return record;
    });
  },
  resolveSuggestedUpdates(acceptedIds: string[], rejectedIds: string[]) {
    const accepted: SuggestedUpdate[] = [];
    for (const id of acceptedIds) {
      const u = suggestedUpdates.get(id);
      if (!u) continue;
      const updated = { ...u, status: 'accepted' as const };
      suggestedUpdates.set(id, updated);
      accepted.push(updated);
    }
    for (const id of rejectedIds) {
      const u = suggestedUpdates.get(id);
      if (!u) continue;
      suggestedUpdates.set(id, { ...u, status: 'rejected' as const });
    }
    return accepted;
  },
};

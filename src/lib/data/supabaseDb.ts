import { createClient } from '@/lib/supabase/server';
import type {
  CalendarConnection,
  Confidence,
  Lesson,
  LessonStatus,
  MemoryCategory,
  MemoryItem,
  MemorySource,
  Student,
  StudentStatus,
  SuggestedUpdate,
  SuggestionSource,
} from '@/lib/types';

interface StudentRow {
  id: string;
  tutor_id: string;
  name: string;
  subject: string | null;
  schedule_summary: string | null;
  confidence: Confidence;
  status: StudentStatus;
  created_at: string;
}
const student = (r: StudentRow): Student => ({
  id: r.id,
  tutorId: r.tutor_id,
  name: r.name,
  subject: r.subject,
  scheduleSummary: r.schedule_summary,
  confidence: r.confidence,
  status: r.status,
  createdAt: r.created_at,
});

interface MemoryItemRow {
  id: string;
  student_id: string;
  category: MemoryCategory;
  label: string;
  value: string | null;
  source: MemorySource;
  created_at: string;
}
const memoryItem = (r: MemoryItemRow): MemoryItem => ({
  id: r.id,
  studentId: r.student_id,
  category: r.category,
  label: r.label,
  value: r.value,
  source: r.source,
  createdAt: r.created_at,
});

interface LessonRow {
  id: string;
  student_id: string;
  scheduled_at: string | null;
  status: LessonStatus;
  today_focus: string | null;
  audio_url: string | null;
  transcript: string | null;
  summary: string | null;
  created_at: string;
}
const lesson = (r: LessonRow): Lesson => ({
  id: r.id,
  studentId: r.student_id,
  scheduledAt: r.scheduled_at,
  status: r.status,
  todayFocus: r.today_focus,
  audioUrl: r.audio_url,
  transcript: r.transcript,
  summary: r.summary,
  createdAt: r.created_at,
});

interface SuggestedUpdateRow {
  id: string;
  student_id: string;
  lesson_id: string | null;
  source: SuggestionSource;
  category: MemoryCategory;
  label: string;
  value: string | null;
  badge: string | null;
  status: SuggestedUpdate['status'];
  created_at: string;
}
const suggestedUpdate = (r: SuggestedUpdateRow): SuggestedUpdate => ({
  id: r.id,
  studentId: r.student_id,
  lessonId: r.lesson_id,
  source: r.source,
  category: r.category,
  label: r.label,
  value: r.value,
  badge: r.badge,
  status: r.status,
  createdAt: r.created_at,
});

export const supabaseDb = {
  async listStudents(tutorId: string, status?: Student['status']) {
    const supabase = await createClient();
    let q = supabase.from('students').select('*').eq('tutor_id', tutorId).order('created_at');
    if (status) q = q.eq('status', status);
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []).map(student);
  },
  async getStudent(tutorId: string, id: string) {
    const supabase = await createClient();
    const { data, error } = await supabase.from('students').select('*').eq('tutor_id', tutorId).eq('id', id).maybeSingle();
    if (error) throw error;
    return data ? student(data) : null;
  },
  async createDetectedStudents(
    tutorId: string,
    detected: Array<Pick<Student, 'name' | 'subject' | 'scheduleSummary' | 'confidence'> & { notes?: string }>
  ) {
    const supabase = await createClient();
    const rows = detected.map((d) => ({
      tutor_id: tutorId,
      name: d.name,
      subject: d.subject,
      schedule_summary: d.scheduleSummary,
      confidence: d.confidence,
      calendar_notes: d.notes ?? null,
      status: 'detected',
    }));
    const { data, error } = await supabase.from('students').insert(rows).select('*');
    if (error) throw error;
    return (data ?? []).map(student);
  },
  async getCalendarNotes(studentId: string): Promise<string | null> {
    const supabase = await createClient();
    const { data, error } = await supabase.from('students').select('calendar_notes').eq('id', studentId).maybeSingle();
    if (error) throw error;
    return data?.calendar_notes ?? null;
  },
  async confirmStudents(tutorId: string, ids: string[]) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('students')
      .update({ status: 'confirmed' })
      .eq('tutor_id', tutorId)
      .in('id', ids)
      .select('*');
    if (error) throw error;
    return (data ?? []).map(student);
  },

  async listMemory(studentId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase.from('memory_items').select('*').eq('student_id', studentId).order('created_at');
    if (error) throw error;
    return (data ?? []).map(memoryItem);
  },
  async addMemoryItems(items: Array<Omit<MemoryItem, 'id' | 'createdAt'>>) {
    const supabase = await createClient();
    const rows = items.map((i) => ({
      student_id: i.studentId,
      category: i.category,
      label: i.label,
      value: i.value,
      source: i.source,
    }));
    const { data, error } = await supabase.from('memory_items').insert(rows).select('*');
    if (error) throw error;
    return (data ?? []).map(memoryItem);
  },

  async getCalendarConnection(tutorId: string): Promise<CalendarConnection | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('calendar_connections')
      .select('tutor_id, provider, connected_at')
      .eq('tutor_id', tutorId)
      .eq('provider', 'google')
      .maybeSingle();
    if (error) throw error;
    return data ? { tutorId: data.tutor_id, provider: 'google', connectedAt: data.connected_at } : null;
  },
  async setCalendarConnection(
    tutorId: string,
    tokens: { accessToken: string; refreshToken: string | null; expiresAt: string | null }
  ) {
    const supabase = await createClient();
    const { error } = await supabase.from('calendar_connections').upsert(
      {
        tutor_id: tutorId,
        provider: 'google',
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
        expires_at: tokens.expiresAt,
      },
      { onConflict: 'tutor_id,provider' }
    );
    if (error) throw error;
  },
  async getCalendarAccessToken(tutorId: string): Promise<string | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('calendar_connections')
      .select('access_token')
      .eq('tutor_id', tutorId)
      .eq('provider', 'google')
      .maybeSingle();
    if (error) throw error;
    return data?.access_token ?? null;
  },

  async createLesson(studentId: string, todayFocus: string | null) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('lessons')
      .insert({ student_id: studentId, today_focus: todayFocus, status: 'recording', scheduled_at: new Date().toISOString() })
      .select('*')
      .single();
    if (error) throw error;
    return lesson(data);
  },
  async getLesson(id: string) {
    const supabase = await createClient();
    const { data, error } = await supabase.from('lessons').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data ? lesson(data) : null;
  },
  async updateLesson(id: string, patch: Partial<Lesson>) {
    const supabase = await createClient();
    const row: Record<string, unknown> = {};
    if (patch.status) row.status = patch.status;
    if (patch.audioUrl !== undefined) row.audio_url = patch.audioUrl;
    if (patch.transcript !== undefined) row.transcript = patch.transcript;
    if (patch.summary !== undefined) row.summary = patch.summary;
    const { data, error } = await supabase.from('lessons').update(row).eq('id', id).select('*').maybeSingle();
    if (error) throw error;
    return data ? lesson(data) : null;
  },

  async listSuggestedUpdates(
    studentId: string,
    filter?: { lessonId?: string; source?: SuggestedUpdate['source']; status?: SuggestedUpdate['status'] }
  ) {
    const supabase = await createClient();
    let q = supabase.from('suggested_updates').select('*').eq('student_id', studentId).order('created_at');
    if (filter?.lessonId) q = q.eq('lesson_id', filter.lessonId);
    if (filter?.source) q = q.eq('source', filter.source);
    if (filter?.status) q = q.eq('status', filter.status);
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []).map(suggestedUpdate);
  },
  async createSuggestedUpdates(items: Array<Omit<SuggestedUpdate, 'id' | 'createdAt' | 'status'>>) {
    const supabase = await createClient();
    const rows = items.map((i) => ({
      student_id: i.studentId,
      lesson_id: i.lessonId,
      source: i.source,
      category: i.category,
      label: i.label,
      value: i.value,
      badge: i.badge,
    }));
    const { data, error } = await supabase.from('suggested_updates').insert(rows).select('*');
    if (error) throw error;
    return (data ?? []).map(suggestedUpdate);
  },
  async resolveSuggestedUpdates(acceptedIds: string[], rejectedIds: string[]) {
    const supabase = await createClient();
    if (rejectedIds.length) {
      const { error } = await supabase.from('suggested_updates').update({ status: 'rejected' }).in('id', rejectedIds);
      if (error) throw error;
    }
    if (!acceptedIds.length) return [];
    const { data, error } = await supabase
      .from('suggested_updates')
      .update({ status: 'accepted' })
      .in('id', acceptedIds)
      .select('*');
    if (error) throw error;
    return (data ?? []).map(suggestedUpdate);
  },
};

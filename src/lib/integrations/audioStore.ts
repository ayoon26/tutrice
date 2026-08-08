import { hasSupabase } from '@/lib/config';
import { createServiceRoleClient } from '@/lib/supabase/server';

const BUCKET = 'lesson-audio';

// Process-local fallback used whenever Supabase Storage isn't configured —
// same lifetime tradeoff (and same globalThis reasoning) as the in-memory data store.
const globalForAudio = globalThis as unknown as { __tutriceMemoryAudio?: Map<string, { buffer: Buffer; contentType: string }> };
const memoryAudio = globalForAudio.__tutriceMemoryAudio ?? (globalForAudio.__tutriceMemoryAudio = new Map());

export async function storeLessonAudio(lessonId: string, bytes: Buffer, contentType: string): Promise<string> {
  if (hasSupabase) {
    const supabase = createServiceRoleClient();
    const path = `${lessonId}.webm`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, bytes, { contentType, upsert: true });
    if (error) throw error;
    return `${BUCKET}/${path}`;
  }
  memoryAudio.set(lessonId, { buffer: bytes, contentType });
  return `memory://${lessonId}`;
}

export async function readLessonAudio(lessonId: string): Promise<{ buffer: Buffer; contentType: string } | null> {
  if (hasSupabase) {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase.storage.from(BUCKET).download(`${lessonId}.webm`);
    if (error || !data) return null;
    return { buffer: Buffer.from(await data.arrayBuffer()), contentType: data.type || 'audio/webm' };
  }
  return memoryAudio.get(lessonId) ?? null;
}

export async function deleteLessonAudio(lessonId: string): Promise<void> {
  if (hasSupabase) {
    const supabase = createServiceRoleClient();
    await supabase.storage.from(BUCKET).remove([`${lessonId}.webm`]);
    return;
  }
  memoryAudio.delete(lessonId);
}

import { redirect } from 'next/navigation';
import { hasSupabase } from '@/lib/config';
import { createClient } from '@/lib/supabase/server';

// Single-tenant id used everywhere while running without Supabase configured,
// so the whole app is click-through-able with zero setup.
export const DEMO_TUTOR_ID = '00000000-0000-0000-0000-000000000001';

export async function getCurrentTutorId(): Promise<string | null> {
  if (!hasSupabase) return DEMO_TUTOR_ID;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function requireTutorId(): Promise<string> {
  const id = await getCurrentTutorId();
  if (!id) redirect('/login');
  return id;
}

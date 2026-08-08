import { hasSupabase } from '@/lib/config';
import { memoryDb } from '@/lib/data/memoryDb';
import { supabaseDb } from '@/lib/data/supabaseDb';

// Both implementations expose the same shape; Supabase's is async because it
// hits the network, so every call site awaits regardless of which backend
// is active.
export const db: { [K in keyof typeof supabaseDb]: (typeof supabaseDb)[K] } = hasSupabase
  ? supabaseDb
  : (memoryDb as unknown as typeof supabaseDb);

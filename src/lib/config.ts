// Central feature flags. Each integration degrades to a clearly-labeled mock
// implementation when its credentials are absent, so the app is fully
// click-through-able before any real keys exist.

export const hasSupabase = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const hasGoogleOAuth = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);

export const hasGemini = Boolean(process.env.GEMINI_API_KEY);

export const hasTranscription = Boolean(process.env.OPENAI_API_KEY);

export const isMockMode = !hasSupabase;

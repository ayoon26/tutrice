# Tutrice

Organized student memory for tutors — calendars, lessons, and notes brought
together, reviewed before anything is saved.

This is the production implementation of the `Tutrice.dc.html` design from
the `../chats` / `../project` Claude Design handoff bundle: the same 21
screens, sketchy-mascot brand, and copy, rebuilt as a real Next.js app on
Supabase with working Google Calendar OAuth, browser audio recording,
speech-to-text, and Claude-based memory extraction.

## Stack

- **Next.js 16** (App Router, Turbopack, React 19)
- **Supabase** — Postgres, Auth, Storage
- **Google Calendar API** — OAuth2, read-only
- **Anthropic Claude** — extracts structured memory updates from lesson
  transcripts and pasted notes
- **OpenAI Whisper** — speech-to-text for lesson recordings

## Mock mode — runs with zero setup

Every external integration is optional. With no environment variables set at
all:

```bash
npm install
npm run dev
```

`http://localhost:3000` boots straight into onboarding. Calendar scanning
returns a fixed sample roster (Sarah Kim, Daniel Lee, and a low-confidence
false positive), lesson transcripts fall back to a sample transcript, and
memory-update suggestions fall back to fixed sample data — all wired through
the *real* screens, navigation, and review/accept flow, just with sample
inputs instead of live ones. Data lives in an in-memory store for the life of
the `next dev` process (see `src/lib/data/memoryDb.ts`).

Turn on any integration below independently — the app checks for each one's
env vars at request time and only uses the mock path when they're missing.

## Turning on real integrations

Copy `.env.example` to `.env.local` and fill in what you're ready to use.

### Supabase (persistence + auth)

1. Create a project at [supabase.com](https://supabase.com).
2. Run `supabase/schema.sql` against it (SQL Editor, or `supabase db push`).
3. Create a **private** Storage bucket named `lesson-audio` (used to hand
   lesson recordings to transcription; the app deletes each recording from
   the bucket right after it's transcribed).
4. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and
   `SUPABASE_SERVICE_ROLE_KEY` (Project Settings → API).
5. In Auth settings, enable email OTP / magic-link sign-in.

Once these are set, `/login` switches from the "continue as demo tutor"
button to a real email sign-in, and all data is per-tutor with row-level
security (see `supabase/schema.sql` for the policies).

### Google Calendar

1. In [Google Cloud Console](https://console.cloud.google.com/apis/credentials),
   create an OAuth 2.0 **Web application** client and enable the Calendar API.
2. Add `http://localhost:3000/api/calendar/oauth/callback` as an authorized
   redirect URI (and your production URL's equivalent when you deploy).
3. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

The onboarding "Allow calendar access" step then does a real OAuth consent
flow and scans the tutor's actual calendar for recurring events that look
like tutoring sessions (subject keywords, "lesson"/"tutoring" in the title,
a weekly cadence) instead of returning the sample roster.

### Claude (memory extraction) and Whisper (transcription)

Set `ANTHROPIC_API_KEY` and/or `OPENAI_API_KEY`. Each is independent:

- With only `ANTHROPIC_API_KEY` set, lesson recordings still transcribe to a
  fixed sample transcript, but that transcript (and any pasted parent
  message / note) is run through Claude for real to produce the reviewable
  suggestion list.
- With only `OPENAI_API_KEY` set, recordings are transcribed for real, but
  the suggested updates shown for review are the fixed sample set.

## How the pieces fit together

- `src/lib/data/` — the data-access layer. `db` (from `src/lib/data/index.ts`)
  dispatches to `supabaseDb.ts` or the in-memory `memoryDb.ts` depending on
  whether Supabase is configured; every route/page calls the same `db.*`
  functions either way.
- `src/lib/integrations/` — Google Calendar, transcription, and Claude
  extraction, each with its own mock fallback.
- `src/components/ui/` — the shared visual kit (buttons, cards, checklist
  rows, the header/step-progress bar, the mascot, the acorn-fall loading
  animation) matching the design's Tutrice brand tokens in
  `src/app/globals.css`.
- **Memory model**: a `memory_items` row is always a confirmed fact. Anything
  awaiting a tutor's review — onboarding facts pulled from a calendar, a
  lesson summary, a pasted note — is a `suggested_updates` row first;
  accepting it in the review screen is what promotes it into `memory_items`.
  Onboarding review (screen 07), lesson review (15), and manual-capture
  review (19) are all the same `SuggestionsReviewForm` component and the
  same `/api/students/[id]/suggestions/resolve` endpoint, just filtered by
  `source`.

## Commands

```bash
npm run dev     # start the dev server
npm run build   # production build (also runs the TypeScript check)
npm run lint    # eslint
```

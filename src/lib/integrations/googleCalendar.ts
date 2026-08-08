import { google } from 'googleapis';
import { hasGoogleOAuth } from '@/lib/config';

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

function oauthClient(redirectUri: string) {
  return new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, redirectUri);
}

export function getGoogleAuthUrl(redirectUri: string, state: string) {
  if (!hasGoogleOAuth) throw new Error('Google OAuth is not configured');
  const client = oauthClient(redirectUri);
  return client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
    state,
  });
}

export async function exchangeCodeForTokens(code: string, redirectUri: string) {
  const client = oauthClient(redirectUri);
  const { tokens } = await client.getToken(code);
  return {
    accessToken: tokens.access_token!,
    refreshToken: tokens.refresh_token ?? null,
    expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
  };
}

export interface DetectedStudent {
  name: string;
  subject: string | null;
  scheduleSummary: string | null;
  confidence: 'high' | 'low';
  notes?: string;
}

const SUBJECT_WORDS = ['algebra', 'geometry', 'calculus', 'chemistry', 'physics', 'biology', 'reading', 'writing', 'sat', 'act', 'french', 'spanish', 'piano', 'coding'];

// Groups recurring calendar events by title and guesses which ones are
// tutoring sessions (repeats on a weekly cadence, mentions a subject / has
// "lesson"/"tutoring" in the title) vs one-off personal appointments.
export async function scanCalendarForStudents(accessToken: string): Promise<DetectedStudent[]> {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  const calendar = google.calendar({ version: 'v3', auth });

  const timeMin = new Date();
  timeMin.setDate(timeMin.getDate() - 60);
  const timeMax = new Date();
  timeMax.setDate(timeMax.getDate() + 14);

  const { data } = await calendar.events.list({
    calendarId: 'primary',
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
    maxResults: 250,
  });

  const byTitle = new Map<string, { count: number; days: Set<string>; times: Set<string>; notes: string }>();
  for (const ev of data.items ?? []) {
    const title = (ev.summary || '').trim();
    if (!title) continue;
    const start = ev.start?.dateTime || ev.start?.date;
    if (!start) continue;
    const d = new Date(start);
    const entry = byTitle.get(title) ?? { count: 0, days: new Set(), times: new Set(), notes: ev.description || '' };
    entry.count += 1;
    entry.days.add(d.toLocaleDateString(undefined, { weekday: 'long' }));
    if (ev.start?.dateTime) entry.times.add(d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }));
    byTitle.set(title, entry);
  }

  const detected: DetectedStudent[] = [];
  for (const [title, info] of byTitle) {
    const isRecurring = info.count >= 2;
    const lower = title.toLowerCase();
    const subject = SUBJECT_WORDS.find((w) => lower.includes(w));
    const looksLikeLesson = isRecurring && (subject || /lesson|tutor|session/.test(lower));
    if (!looksLikeLesson) continue;

    const name = title
      .replace(/\b(lesson|tutoring|session|with|weekly|-|–)\b/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    detected.push({
      name: name || title,
      subject: subject ? subject[0].toUpperCase() + subject.slice(1) : null,
      scheduleSummary: `${[...info.days].join(' and ')}${info.times.size ? ` at ${[...info.times][0]}` : ''}`,
      confidence: subject ? 'high' : 'low',
      notes: info.notes?.trim() || undefined,
    });
  }
  return detected;
}

export interface TodayEvent {
  title: string;
  time: string;
}

export async function listTodayEvents(accessToken: string): Promise<TodayEvent[]> {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  const calendar = google.calendar({ version: 'v3', auth });

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const { data } = await calendar.events.list({
    calendarId: 'primary',
    timeMin: start.toISOString(),
    timeMax: end.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
  });

  return (data.items ?? [])
    .filter((ev) => ev.summary && ev.start?.dateTime)
    .map((ev) => ({
      title: ev.summary!,
      time: new Date(ev.start!.dateTime!).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }),
    }));
}

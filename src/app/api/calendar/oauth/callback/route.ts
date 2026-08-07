import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/data';
import { exchangeCodeForTokens } from '@/lib/integrations/googleCalendar';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const tutorId = searchParams.get('state'); // set to the tutor id when we built the consent URL

  if (!code || !tutorId) {
    return NextResponse.redirect(new URL('/onboarding/connect/google?error=missing_code', origin));
  }

  try {
    const redirectUri = `${origin}/api/calendar/oauth/callback`;
    const tokens = await exchangeCodeForTokens(code, redirectUri);
    await db.setCalendarConnection(tutorId, tokens);
  } catch {
    return NextResponse.redirect(new URL('/onboarding/connect/google?error=token_exchange', origin));
  }

  return NextResponse.redirect(new URL('/onboarding/scanning', origin));
}

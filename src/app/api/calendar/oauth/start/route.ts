import { NextResponse, type NextRequest } from 'next/server';
import { requireTutorId } from '@/lib/auth';
import { hasGoogleOAuth } from '@/lib/config';
import { getGoogleAuthUrl } from '@/lib/integrations/googleCalendar';

export async function GET(request: NextRequest) {
  const tutorId = await requireTutorId();
  const { origin } = new URL(request.url);

  if (!hasGoogleOAuth) {
    // No Google credentials configured — skip straight to the (mocked) scan.
    return NextResponse.redirect(new URL('/onboarding/scanning', origin));
  }

  const redirectUri = `${origin}/api/calendar/oauth/callback`;
  const authUrl = getGoogleAuthUrl(redirectUri, tutorId);
  return NextResponse.redirect(authUrl);
}

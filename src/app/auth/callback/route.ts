import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { hasSupabase } from '@/lib/config';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  // Vercel's edge network can present the serverless function with a
  // different origin than the domain the browser actually requested —
  // prefer the forwarded host so the redirect (and its cookies) land on
  // the same domain the user is on, not an internal/mismatched one.
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') ?? 'https';
  const publicOrigin = forwardedHost ? `${forwardedProto}://${forwardedHost}` : origin;

  if (!hasSupabase) {
    return NextResponse.redirect(`${publicOrigin}/`);
  }

  if (!code) {
    return NextResponse.redirect(
      `${publicOrigin}/login?error=${encodeURIComponent('Sign-in link is missing its verification code — request a new one.')}`
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${publicOrigin}/login?error=${encodeURIComponent(error.message)}`);
  }
  return NextResponse.redirect(`${publicOrigin}/`);
}

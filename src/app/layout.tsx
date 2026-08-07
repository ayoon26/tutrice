import type { Metadata, Viewport } from 'next';
import { Fredoka, Nunito } from 'next/font/google';
import './globals.css';

const fredoka = Fredoka({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-heading-family',
});

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-body-family',
});

export const metadata: Metadata = {
  title: 'Tutrice',
  description: 'Organized student memory for tutors — calendars, lessons, and notes, brought together.',
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
};

// Every screen renders per-tutor data (and, once Supabase is configured,
// per-request auth state) — never let the build cache a static snapshot.
export const dynamic = 'force-dynamic';

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${fredoka.variable} ${nunito.variable}`}>
      <body>
        <div className="app-shell">
          <div className="app-frame">{children}</div>
        </div>
      </body>
    </html>
  );
}

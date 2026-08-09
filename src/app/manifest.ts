import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Tutrice',
    short_name: 'Tutrice',
    description: 'Organized student memory for tutors — calendars, lessons, and notes, brought together.',
    start_url: '/',
    display: 'standalone',
    background_color: '#faf7ee',
    theme_color: '#faf7ee',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}

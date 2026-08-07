export type TagTone = 'accent' | 'accent-2' | 'neutral' | 'outline';

export function Tag({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: TagTone }) {
  return <span className={`tag tag-${tone}`}>{children}</span>;
}

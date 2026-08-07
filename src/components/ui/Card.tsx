import Link from 'next/link';
import type { ReactNode } from 'react';
import { Tag, type TagTone } from './Tag';

export function Card({
  title,
  meta,
  badge,
  badgeTone,
  lines,
  plainLines,
  href,
}: {
  title: ReactNode;
  meta?: ReactNode;
  badge?: string;
  badgeTone?: TagTone;
  lines?: { label: string; value: string }[];
  /** Already-phrased text (e.g. a stored memory item's own label) — rendered without an extra bold prefix. */
  plainLines?: string[];
  href?: string;
}) {
  const body = (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
        <div className="card-title">{title}</div>
        {badge && <Tag tone={badgeTone}>{badge}</Tag>}
      </div>
      {meta && <div className="card-meta">{meta}</div>}
      {lines?.map((ln, i) => (
        <div key={i} style={{ fontSize: 12.5, lineHeight: 1.55 }}>
          <strong style={{ fontWeight: 600 }}>{ln.label}: </strong>
          <span style={{ opacity: 0.85 }}>{ln.value}</span>
        </div>
      ))}
      {plainLines?.map((text, i) => (
        <div key={i} style={{ fontSize: 12.5, lineHeight: 1.55, opacity: 0.85 }}>
          {text}
        </div>
      ))}
    </>
  );
  const style: React.CSSProperties = { margin: 'var(--space-2) var(--space-4)', width: 'auto' };
  if (href) {
    return (
      <Link href={href} className="card" style={{ ...style, textDecoration: 'none', color: 'inherit' }}>
        {body}
      </Link>
    );
  }
  return (
    <div className="card" style={style}>
      {body}
    </div>
  );
}

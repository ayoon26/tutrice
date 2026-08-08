'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { Tag, type TagTone } from './Tag';

function Chevron() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="color-mix(in srgb, var(--color-text) 40%, transparent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

export function Item({
  title,
  subtitle,
  badge,
  badgeTone,
  href,
  onClick,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  badge?: string;
  badgeTone?: TagTone;
  href?: string;
  onClick?: () => void;
}) {
  const clickable = Boolean(href || onClick);
  const content = (
    <>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="row-title">{title}</div>
        {subtitle && <div className="row-subtitle">{subtitle}</div>}
      </div>
      {badge && <Tag tone={badgeTone}>{badge}</Tag>}
      {clickable && <Chevron />}
    </>
  );
  if (href) {
    return (
      <Link href={href} className="row clickable" style={{ textDecoration: 'none', color: 'inherit' }}>
        {content}
      </Link>
    );
  }
  return (
    <div className={`row${clickable ? ' clickable' : ''}`} onClick={onClick}>
      {content}
    </div>
  );
}

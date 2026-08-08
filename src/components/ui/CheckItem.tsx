'use client';

import { Tag, type TagTone } from './Tag';

function Check() {
  return (
    <svg className="checkbox-pop" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

export function CheckItem({
  title,
  subtitle,
  badge,
  badgeTone,
  checked,
  onToggle,
  dim,
}: {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeTone?: TagTone;
  checked: boolean;
  onToggle: () => void;
  dim?: boolean;
}) {
  return (
    <div className="check-row" style={{ opacity: dim ? 0.55 : 1 }} onClick={onToggle}>
      <div className="check-box" style={{ background: checked ? 'var(--color-accent)' : 'transparent' }}>
        {checked && <Check />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'baseline' }}>
          <div style={{ fontSize: 13.5 }}>{title}</div>
          {badge && <Tag tone={badgeTone}>{badge}</Tag>}
        </div>
        {subtitle && <div style={{ fontSize: 11.5, color: 'color-mix(in srgb, var(--color-text) 55%, transparent)', marginTop: 2 }}>{subtitle}</div>}
      </div>
    </div>
  );
}

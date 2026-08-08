import type { ReactNode } from 'react';

export function Title({ children }: { children: ReactNode }) {
  return (
    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 'var(--font-heading-weight)', fontSize: 25, padding: 'var(--space-3) var(--space-4) 0', lineHeight: 1.18 }}>
      {children}
    </div>
  );
}

export function Subtitle({ children }: { children: ReactNode }) {
  return (
    <div style={{ fontSize: 13, color: 'color-mix(in srgb, var(--color-text) 60%, transparent)', padding: '4px var(--space-4) var(--space-2)', lineHeight: 1.5 }}>
      {children}
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        fontSize: 10,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'var(--color-accent-700)',
        padding: 'var(--space-3) var(--space-4) 4px',
        borderTop: '1px solid var(--color-divider)',
        marginTop: 'var(--space-2)',
      }}
    >
      {children}
    </div>
  );
}

export function Text({ children }: { children: ReactNode }) {
  return (
    <div style={{ fontSize: 13.5, color: 'var(--color-text)', opacity: 0.85, padding: '3px var(--space-4)', lineHeight: 1.6 }}>{children}</div>
  );
}

export function Note({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        margin: 'var(--space-2) var(--space-4)',
        padding: '11px 13px',
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-md)',
        fontSize: 12.5,
        color: 'color-mix(in srgb, var(--color-text) 75%, transparent)',
        lineHeight: 1.5,
      }}
    >
      {children}
    </div>
  );
}

export function Divider() {
  return <div className="hr" style={{ margin: 'var(--space-2) var(--space-4)' }} />;
}

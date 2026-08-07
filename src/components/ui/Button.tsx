'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

const WRAP_STYLE: Record<Variant, React.CSSProperties> = {
  primary: { padding: '6px var(--space-4) 2px' } as React.CSSProperties,
  secondary: { padding: '2px var(--space-4) 2px' } as React.CSSProperties,
  ghost: { padding: '4px var(--space-4) 4px', textAlign: 'center' },
};

interface ButtonProps {
  children: ReactNode;
  variant?: Variant;
  block?: boolean;
  icon?: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  loadingLabel?: string;
  href?: string;
  onClick?: () => void;
}

export function Button({ children, variant = 'primary', block, icon, disabled, loading, loadingLabel, href, onClick }: ButtonProps) {
  const isBlock = block ?? variant !== 'ghost';
  const cls = `btn btn-${variant}${isBlock ? ' btn-block' : ''}`;
  const content = (
    <>
      {icon}
      <span>{loading && loadingLabel ? loadingLabel : children}</span>
    </>
  );
  const inner = href ? (
    disabled || loading ? (
      <span className={cls} style={{ pointerEvents: 'none', opacity: 0.45 }}>
        {content}
      </span>
    ) : (
      <Link href={href} className={cls}>
        {content}
      </Link>
    )
  ) : (
    <button type="button" className={cls} onClick={onClick} disabled={disabled || loading}>
      {content}
    </button>
  );
  return <div style={WRAP_STYLE[variant]}>{inner}</div>;
}

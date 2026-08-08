'use client';

import { useRouter } from 'next/navigation';

function Logo() {
  return (
    <svg width="30" height="30" viewBox="0 0 40 40" fill="none" style={{ flex: 'none' }}>
      <circle cx="20" cy="20" r="20" fill="var(--color-neutral-900)" />
      <path d="M11 13 L15 6 L18 13 Z" fill="var(--color-neutral-900)" />
      <path d="M29 13 L25 6 L22 13 Z" fill="var(--color-neutral-900)" />
      <path d="M12 24 Q20 15 28 24 Q28 30 20 30 Q12 30 12 24 Z" fill="#fff" />
      <circle cx="15.5" cy="22.5" r="3.4" fill="none" stroke="#fff" strokeWidth="1.6" />
      <circle cx="24.5" cy="22.5" r="3.4" fill="none" stroke="#fff" strokeWidth="1.6" />
      <line x1="18.9" y1="22.5" x2="21.1" y2="22.5" stroke="#fff" strokeWidth="1.6" />
      <circle cx="20" cy="27.5" r="1.4" fill="#fff" />
    </svg>
  );
}

function BackChevron() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M11 5l-7 7 7 7" />
    </svg>
  );
}

export function Header({
  title,
  showBack,
  showLogo,
  step,
  onBackHref,
}: {
  title: string;
  showBack?: boolean;
  showLogo?: boolean;
  step?: [number, number];
  onBackHref?: string;
}) {
  const router = useRouter();
  return (
    <div className="app-header">
      <div className="app-header-row">
        {showBack && (
          <button
            type="button"
            className="btn btn-secondary btn-icon"
            style={{ flex: 'none' }}
            onClick={() => (onBackHref ? router.push(onBackHref) : router.back())}
            aria-label="Back"
          >
            <BackChevron />
          </button>
        )}
        {showLogo && !showBack && <Logo />}
        <div className="app-header-title">{title}</div>
      </div>
      {step && (
        <div className="app-header-step">
          <div className="app-header-step-label">
            Step {step[0]} of {step[1]}
          </div>
          <div className="app-header-step-bar">
            <div className="app-header-step-fill" style={{ width: `${Math.round((step[0] / step[1]) * 100)}%` }} />
          </div>
        </div>
      )}
      <div className="hr" style={{ margin: '10px 0 0' }} />
    </div>
  );
}

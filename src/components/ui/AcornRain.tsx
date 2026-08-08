const DEFAULT_ACORNS = [
  { left: '10%', delay: '0s' },
  { left: '26%', delay: '.3s' },
  { left: '42%', delay: '.15s' },
  { left: '58%', delay: '.45s' },
  { left: '74%', delay: '.2s' },
  { left: '90%', delay: '.35s' },
];

export function AcornRain({ acorns = DEFAULT_ACORNS }: { acorns?: { left: string; delay: string }[] }) {
  return (
    <div className="acorn-rain">
      {acorns.map((a, i) => (
        <span key={i} style={{ left: a.left, animationDelay: a.delay }}>
          🌰
        </span>
      ))}
    </div>
  );
}

'use client';

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="seg" style={{ margin: 'var(--space-2) var(--space-4)', width: 'calc(100% - 2 * var(--space-4))' }}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <label
            key={opt.value}
            className="seg-opt"
            style={{
              flex: 1,
              justifyContent: 'center',
              boxShadow: active ? 'inset 0 0 0 1px var(--color-accent)' : undefined,
              color: active ? 'var(--color-accent)' : undefined,
            }}
          >
            <input type="radio" checked={active} onChange={() => onChange(opt.value)} />
            {opt.label}
          </label>
        );
      })}
    </div>
  );
}

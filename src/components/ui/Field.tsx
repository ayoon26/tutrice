'use client';

export function TextareaField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="field" style={{ padding: '6px var(--space-4)' }}>
      <label>{label}</label>
      <textarea
        className="input"
        style={{ minHeight: 96, lineHeight: 1.5, fontSize: 13 }}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

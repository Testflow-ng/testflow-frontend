function AppleGlyph({ size = 22 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.51 4.09l-.02-.01M12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25" />
    </svg>
  );
}

function PlayGlyph({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M4 3.5c0-.82.9-1.32 1.6-.9l13.2 7.62c.7.4.7 1.4 0 1.8L5.6 19.63c-.7.4-1.6-.09-1.6-.9V3.5Z" />
    </svg>
  );
}

const BADGES = [
  { key: 'apple', Glyph: AppleGlyph, top: 'Coming soon on the', label: 'App Store' },
  { key: 'google', Glyph: PlayGlyph, top: 'Coming soon on', label: 'Google Play' },
];

function StoreBadges({ className }) {
  return (
    <div className={className}>
      {BADGES.map(({ key, Glyph, top, label }) => (
        <div
          key={key}
          className="flex items-center gap-3 rounded-full border border-border bg-surface px-5 py-2.5 text-foreground-strong"
        >
          <Glyph />
          <div className="text-left leading-tight">
            <p className="text-[10px] font-medium text-muted">{top}</p>
            <p className="text-sm font-bold">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default StoreBadges;

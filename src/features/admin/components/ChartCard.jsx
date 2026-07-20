function ChartCard({ title, subtitle, children }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="mb-4">
        <h3 className="font-heading text-base font-bold text-foreground-strong">
          {title}
        </h3>
        {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export default ChartCard;

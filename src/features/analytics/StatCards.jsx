function StatCards({ stats }) {
  const items = [
    { label: 'Exams taken', value: stats.totalExams },
    { label: 'Average score', value: `${stats.averageScore}%` },
    { label: 'Best score', value: `${stats.bestScore}%` },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map((item) => (
        <div key={item.label} className="rounded-lg border border-border bg-surface p-3 text-center">
          <p className="text-2xl font-bold tabular-nums text-foreground-strong">{item.value}</p>
          <p className="mt-0.5 text-[11px] text-muted">{item.label}</p>
        </div>
      ))}
    </div>
  );
}

export default StatCards;

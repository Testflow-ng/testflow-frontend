function StatCards({ stats }) {
  const items = [
    { label: 'Exams taken', value: stats.totalExams },
    { label: 'Average score', value: `${stats.averageScore}%` },
    { label: 'Best score', value: `${stats.bestScore}%` },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex flex-col items-center rounded-2xl border border-border bg-surface py-4"
        >
          <p className="font-heading text-xl font-extrabold tabular-nums text-foreground-strong">
            {item.value}
          </p>
          <p className="mt-0.5 text-[10px] font-medium text-muted">
            {item.label}
          </p>
        </div>
      ))}
    </div>
  );
}

export default StatCards;

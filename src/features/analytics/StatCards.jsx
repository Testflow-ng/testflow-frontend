import { cardClasses } from '../../components/ui/surfaces.js';

function StatCards({ stats }) {
  const items = [
    { label: 'Exams taken', value: stats.totalExams },
    { label: 'Average score', value: `${stats.averageScore}%` },
    { label: 'Best score', value: `${stats.bestScore}%` },
  ];

  return (
    <div className="grid grid-cols-3 gap-2.5">
      {items.map((item) => (
        <div
          key={item.label}
          className={cardClasses({
            padding: 'none',
            className: 'flex flex-col items-center justify-center px-2 py-4 text-center',
          })}
        >
          <p className="font-heading text-xl font-extrabold leading-none tabular-nums text-foreground-strong">
            {item.value}
          </p>
          <p className="mt-1.5 text-[11px] font-medium leading-tight text-muted">{item.label}</p>
        </div>
      ))}
    </div>
  );
}

export default StatCards;

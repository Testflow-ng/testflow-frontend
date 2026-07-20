import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import ChartCard from './ChartCard.jsx';
import { useChartColors } from './useChartColors.js';

function SessionsDonut({ total = 0, completed = 0 }) {
  const colors = useChartColors();
  const inProgress = Math.max(0, total - completed);
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const data = [
    { name: 'Completed', value: completed, color: colors.success },
    { name: 'In progress', value: inProgress, color: colors.warning },
  ];
  const hasData = total > 0;

  return (
    <ChartCard title="Exam completion" subtitle="Submitted vs in progress">
      <div className="relative">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={hasData ? data : [{ name: 'None', value: 1, color: colors.border }]}
              dataKey="value"
              innerRadius={64}
              outerRadius={92}
              paddingAngle={hasData ? 3 : 0}
              stroke="none"
              startAngle={90}
              endAngle={-270}
            >
              {(hasData ? data : [{ color: colors.border }]).map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-heading text-3xl font-extrabold text-foreground-strong">
            {rate}%
          </span>
          <span className="text-xs text-muted">completed</span>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-center gap-5 text-xs">
        <Legend color={colors.success} label={`Completed ${completed}`} />
        <Legend color={colors.warning} label={`In progress ${inProgress}`} />
      </div>
    </ChartCard>
  );
}

function Legend({ color, label }) {
  return (
    <span className="flex items-center gap-2 text-muted">
      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

export default SessionsDonut;

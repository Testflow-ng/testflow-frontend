import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts';

function SubjectChart({ perSubject }) {
  if (!perSubject.length) {
    return null;
  }
  const data = perSubject.map((entry) => ({ code: entry.subjectCode, avg: entry.averageScore }));

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <p className="mb-3 text-sm font-semibold text-foreground-strong">Average score by subject</p>
      <ResponsiveContainer width="100%" height={210}>
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -18 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
          <XAxis
            dataKey="code"
            interval={0}
            height={48}
            angle={-35}
            textAnchor="end"
            tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }}
            tickLine={false}
            axisLine={{ stroke: 'var(--color-border)' }}
          />
          <YAxis
            domain={[0, 100]}
            width={30}
            tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }}
            tickLine={false}
            axisLine={false}
          />
          <Bar dataKey="avg" fill="var(--color-primary)" radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default SubjectChart;

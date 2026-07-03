import { useEffect, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { subscribe } from '../../theme.js';

const readColors = () => {
  const styles = getComputedStyle(document.documentElement);
  const get = (name, fallback) => styles.getPropertyValue(name).trim() || fallback;
  return {
    primary: get('--color-primary', '#2563eb'),
    muted: get('--color-text-muted', '#64748b'),
    border: get('--color-border', '#e2e8f0'),
  };
};

/** Area chart of score over successive attempts. Hidden until there are 2+. */
function HistoryChart({ sessions }) {
  const [colors, setColors] = useState(readColors);
  useEffect(() => subscribe(() => setColors(readColors())), []);

  const submitted = sessions.filter((session) => session.status === 'submitted');
  if (submitted.length < 2) {
    return null;
  }

  const data = [...submitted]
    .reverse()
    .map((session, index) => ({ n: index + 1, score: session.score }));
  const summary = data.map((point) => `${point.score} percent`).join(', ');

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <p className="mb-3 text-sm font-semibold text-foreground-strong">Score trend</p>
      <div role="img" aria-label={`Score over your last ${data.length} exams: ${summary}`}>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -6 }}>
            <defs>
              <linearGradient id="tf-score-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colors.primary} stopOpacity={0.25} />
                <stop offset="100%" stopColor={colors.primary} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.border} vertical={false} />
            <XAxis
              dataKey="n"
              tick={{ fontSize: 10, fill: colors.muted }}
              tickLine={false}
              axisLine={{ stroke: colors.border }}
            />
            <YAxis
              domain={[0, 100]}
              width={34}
              tick={{ fontSize: 10, fill: colors.muted }}
              tickLine={false}
              axisLine={false}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke={colors.primary}
              strokeWidth={2}
              fill="url(#tf-score-fill)"
              dot={{ r: 3, fill: colors.primary, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default HistoryChart;

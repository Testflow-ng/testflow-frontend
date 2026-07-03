import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { subscribe } from '../../theme.js';

// Recharts writes fill/stroke as SVG presentation attributes, where CSS var()
// support is inconsistent (notably Safari). Read the resolved token values in
// JS instead, and refresh them whenever the theme changes.
const readColors = () => {
  const styles = getComputedStyle(document.documentElement);
  const get = (name, fallback) => styles.getPropertyValue(name).trim() || fallback;
  return {
    primary: get('--color-primary', '#2563eb'),
    muted: get('--color-text-muted', '#64748b'),
    border: get('--color-border', '#e2e8f0'),
  };
};

function SubjectChart({ perSubject = [] }) {
  const [colors, setColors] = useState(readColors);

  useEffect(() => subscribe(() => setColors(readColors())), []);

  if (!perSubject.length) {
    return null;
  }

  const data = perSubject.map((entry) => ({ code: entry.subjectCode, avg: entry.averageScore }));
  const summary = data.map((entry) => `${entry.code} ${entry.avg} percent`).join(', ');

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <p className="mb-3 text-sm font-semibold text-foreground-strong">Average score by subject</p>
      <div role="img" aria-label={`Average score by subject: ${summary}`}>
        <ResponsiveContainer width="100%" height={210}>
          <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -18 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.border} vertical={false} />
            <XAxis
              dataKey="code"
              interval={0}
              height={48}
              angle={-35}
              textAnchor="end"
              tick={{ fontSize: 10, fill: colors.muted }}
              tickLine={false}
              axisLine={{ stroke: colors.border }}
            />
            <YAxis
              domain={[0, 100]}
              width={30}
              tick={{ fontSize: 10, fill: colors.muted }}
              tickLine={false}
              axisLine={false}
            />
            <Bar dataKey="avg" fill={colors.primary} radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default SubjectChart;

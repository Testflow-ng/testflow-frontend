import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import ChartCard from './ChartCard.jsx';
import { useChartColors } from './useChartColors.js';

const LEVEL_ORDER = ['100', '200', '300', '400', '500', 'Unleveled'];

function LevelBarChart({ levels }) {
  const colors = useChartColors();
  const entries = Object.entries(levels ?? {});
  const data = entries
    .sort((a, b) => LEVEL_ORDER.indexOf(a[0]) - LEVEL_ORDER.indexOf(b[0]))
    .map(([level, count]) => ({
      level: level === 'Unleveled' ? 'Other' : `${level}L`,
      count,
    }));

  return (
    <ChartCard title="Subjects by level" subtitle="How the catalog is spread">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -14 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.border} vertical={false} />
          <XAxis
            dataKey="level"
            tick={{ fontSize: 12, fill: colors.muted }}
            tickLine={false}
            axisLine={{ stroke: colors.border }}
          />
          <YAxis
            allowDecimals={false}
            width={40}
            tick={{ fontSize: 11, fill: colors.muted }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ fill: colors.muted, fillOpacity: 0.06 }}
            contentStyle={{
              borderRadius: 12,
              border: `1px solid ${colors.border}`,
              background: colors.surface,
              fontSize: 12,
            }}
          />
          <Bar dataKey="count" name="Subjects" fill={colors.secondary} radius={[6, 6, 0, 0]} maxBarSize={48} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export default LevelBarChart;

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

function ActiveUsersChart({ activity }) {
  const colors = useChartColors();
  const data = [
    { label: 'Daily', value: activity?.daily ?? 0 },
    { label: 'Weekly', value: activity?.weekly ?? 0 },
    { label: 'Monthly', value: activity?.monthly ?? 0 },
  ];

  return (
    <ChartCard title="Active students" subtitle="Unique students by recency">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -14 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.border} vertical={false} />
          <XAxis
            dataKey="label"
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
          <Bar dataKey="value" name="Students" fill={colors.primary} radius={[6, 6, 0, 0]} maxBarSize={64} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export default ActiveUsersChart;

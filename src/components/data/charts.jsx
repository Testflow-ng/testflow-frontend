import {
  Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, PolarAngleAxis, PolarGrid, Radar, RadarChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { useBrandColors } from './useBrandColors.js';

const tooltipStyle = { borderRadius: 14, border: '1px solid #e3e1d8', boxShadow: '0 8px 24px -12px rgba(27,67,50,.25)', fontSize: 13 };

/** Wrapper that gives every chart a labelled, fixed-height box (screen readers get `label`). */
function Frame({ label, height = 240, children }) {
  return (
    <div role="img" aria-label={label} style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}

/** data: [{ name, value }] */
export function BrandBarChart({ data, label, height, highlightLast = true, animate = false }) {
  const c = useBrandColors();
  return (
    <Frame label={label} height={height}>
      <BarChart data={data} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={c.grid} />
        <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: c.muted, fontSize: 12 }} />
        <YAxis tickLine={false} axisLine={false} tick={{ fill: c.muted, fontSize: 12 }} />
        <Tooltip cursor={{ fill: c.lavender, opacity: 0.5 }} contentStyle={tooltipStyle} />
        <Bar dataKey="value" radius={[8, 8, 0, 0]} isAnimationActive={animate} animationDuration={900} animationEasing="ease-out">
          {data.map((d, i) => (
            <Cell key={d.name} fill={highlightLast && i === data.length - 1 ? c.indigo : '#b9b0f0'} />
          ))}
        </Bar>
      </BarChart>
    </Frame>
  );
}

/** data: [{ name, value }] */
export function BrandLineChart({ data, label, height, animate = false }) {
  const c = useBrandColors();
  return (
    <Frame label={label} height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={c.grid} />
        <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: c.muted, fontSize: 12 }} />
        <YAxis tickLine={false} axisLine={false} tick={{ fill: c.muted, fontSize: 12 }} />
        <Tooltip contentStyle={tooltipStyle} />
        <Line type="monotone" isAnimationActive={animate} animationDuration={900} animationEasing="ease-out" dataKey="value" stroke={c.indigo} strokeWidth={3} dot={{ r: 4, fill: '#fff', stroke: c.indigo, strokeWidth: 2 }} activeDot={{ r: 6, fill: c.lime, stroke: c.ink }} />
      </LineChart>
    </Frame>
  );
}

/** data: [{ name, value }]; centre shows `centerLabel`. */
export function BrandDonutChart({ data, label, height = 220, centerLabel, animate = false }) {
  const c = useBrandColors();
  const palette = [c.indigo, c.lime, c.ink, '#b9b0f0', c.sage];
  return (
    <div className="relative">
      <Frame label={label} height={height}>
        <PieChart>
          <Tooltip contentStyle={tooltipStyle} />
          <Pie isAnimationActive={animate} animationDuration={900} animationEasing="ease-out" data={data} dataKey="value" nameKey="name" innerRadius="62%" outerRadius="88%" paddingAngle={3} cornerRadius={6} stroke="none">
            {data.map((d, i) => (
              <Cell key={d.name} fill={palette[i % palette.length]} />
            ))}
          </Pie>
        </PieChart>
      </Frame>
      {centerLabel && (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center font-heading text-2xl font-extrabold text-foreground-strong">
          {centerLabel}
        </span>
      )}
    </div>
  );
}

/** data: [{ name, value }] (0-100) */
export function BrandRadarChart({ data, label, height = 260, animate = false }) {
  const c = useBrandColors();
  return (
    <Frame label={label} height={height}>
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid stroke={c.grid} />
        <PolarAngleAxis dataKey="name" tick={{ fill: c.muted, fontSize: 12 }} />
        <Tooltip contentStyle={tooltipStyle} />
        <Radar isAnimationActive={animate} animationDuration={900} animationEasing="ease-out" dataKey="value" stroke={c.indigo} strokeWidth={2.5} fill={c.indigo} fillOpacity={0.18} />
      </RadarChart>
    </Frame>
  );
}

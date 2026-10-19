import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Eye, MessageCircle, MousePointerClick, Users } from 'lucide-react';
import StatCard from '../data/StatCard.jsx';
import { DateRangePicker } from '../ui/DatePicker.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import { useBrandColors } from '../data/useBrandColors.js';
import { cn } from '../../utils/cn.js';

const n = (v) => (v ?? 0).toLocaleString();

/** Tiny trend line for a stat. `data` is a number[]; decorative (the value is printed next to it). */
export function Sparkline({ data, width = 96, height = 32 }) {
  const c = useBrandColors();
  const rows = data.map((v, i) => ({ i, v }));
  return (
    <div aria-hidden="true" style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={rows} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="spark" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={c.indigo} stopOpacity={0.25} />
              <stop offset="100%" stopColor={c.indigo} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="v" stroke={c.indigo} strokeWidth={2} fill="url(#spark)" isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Impressions to clicks to WhatsApp clicks, as three narrowing bars with the drop-off percentages. */
export function Funnel({ steps, className }) {
  const top = steps[0]?.value || 1;
  return (
    <ol className={cn('space-y-3', className)} aria-label="Conversion funnel">
      {steps.map((s, i) => {
        const pct = Math.max(2, (s.value / top) * 100);
        const prev = steps[i - 1]?.value;
        return (
          <li key={s.label}>
            <div className="mb-1 flex items-baseline justify-between text-sm">
              <span className="font-medium text-foreground-strong">{s.label}</span>
              <span className="tabular-nums text-muted">
                <b className="text-foreground-strong">{n(s.value)}</b>
                {prev ? ` · ${prev ? ((s.value / prev) * 100).toFixed(1) : 0}% of previous` : ''}
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-surface-strong" role="img" aria-label={`${s.label}: ${n(s.value)}`}>
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: s.color ?? 'var(--brand-indigo)' }} />
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * Campaign analytics. `totals` = { eligibleRequests, impressions, uniqueViewers, clicks, whatsappClicks, ctr, whatsappCtr }
 * and `daily` = [{ date, impressions, clicks, whatsappClicks }] from the Ads API. Advertisers only ever see these
 * aggregates, never student identities. The range is controlled by the parent (`range` / `onRangeChange`).
 */
function AnalyticsPanel({ totals, daily = [], range, onRangeChange, className }) {
  const c = useBrandColors();
  if (!totals) return <EmptyState mood="thinking" title="No data yet" description="Numbers appear once your ad has been shown to students." />;
  const series = (key) => daily.map((d) => d[key] ?? 0);
  const chart = daily.map((d) => ({ name: d.date?.slice(5) ?? '', Impressions: d.impressions, Clicks: d.clicks, WhatsApp: d.whatsappClicks }));
  return (
    <section aria-label="Campaign analytics" className={cn('space-y-6', className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-lg font-bold text-foreground-strong">Performance</h2>
        {onRangeChange && <DateRangePicker value={range} onChange={onRangeChange} className="w-full sm:w-72" placeholder="Choose dates" />}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Impressions', value: totals.impressions, icon: Eye, key: 'impressions' },
          { label: 'Unique viewers', value: totals.uniqueViewers, icon: Users, tone: 'sage' },
          { label: 'Clicks', value: totals.clicks, icon: MousePointerClick, key: 'clicks', tone: 'accent' },
          { label: 'WhatsApp clicks', value: totals.whatsappClicks, icon: MessageCircle, key: 'whatsappClicks', tone: 'success' },
        ].map(({ key, ...stat }) => (
          <div key={stat.label} className="relative">
            <StatCard {...stat} />
            {key && daily.length > 1 && <div className="absolute right-4 top-[4.4rem]"><Sparkline data={series(key)} /></div>}
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="rounded-[20px] border border-border bg-surface p-5">
          <h3 className="mb-4 font-heading text-base font-bold text-foreground-strong">Funnel</h3>
          <Funnel steps={[{ label: 'Impressions', value: totals.impressions }, { label: 'Clicks', value: totals.clicks, color: c.lime }, { label: 'WhatsApp clicks', value: totals.whatsappClicks, color: '#25d366' }]} />
          <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-4 text-sm">
            <div><dt className="text-muted">CTR</dt><dd className="font-heading text-xl font-extrabold text-foreground-strong">{totals.ctr}%</dd></div>
            <div><dt className="text-muted">WhatsApp CTR</dt><dd className="font-heading text-xl font-extrabold text-foreground-strong">{totals.whatsappCtr}%</dd></div>
          </dl>
        </div>
        <div className="rounded-[20px] border border-border bg-surface p-5">
          <h3 className="mb-4 font-heading text-base font-bold text-foreground-strong">Daily trend</h3>
          <div role="img" aria-label="Daily impressions, clicks and WhatsApp clicks" style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chart} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={c.grid} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: c.muted, fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: c.muted, fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 14, border: '1px solid #e3e1d8', fontSize: 13 }} />
                <Line type="monotone" dataKey="Impressions" stroke={c.indigo} strokeWidth={3} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="Clicks" stroke={c.ink} strokeWidth={2.5} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="WhatsApp" stroke="#25d366" strokeWidth={2.5} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-3 flex flex-wrap gap-4 text-xs text-muted" aria-hidden="true">
            <li className="flex items-center gap-1.5"><span className="size-2.5 rounded-full" style={{ background: c.indigo }} />Impressions</li>
            <li className="flex items-center gap-1.5"><span className="size-2.5 rounded-full" style={{ background: c.ink }} />Clicks</li>
            <li className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-[#25d366]" />WhatsApp</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export default AnalyticsPanel;

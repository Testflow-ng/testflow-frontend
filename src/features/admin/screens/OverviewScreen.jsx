import { Link } from 'react-router-dom';
import { Activity, ArrowRight, BookOpenCheck, ClipboardList, Download, FileQuestion, Flag, Megaphone, MessageSquare, ShieldCheck, TrendingUp, Users } from 'lucide-react';
import { Badge, Button, Card, Reveal, SkeletonCard, useToast } from '../../../components/ui/index.js';
import StatCard from '../../../components/data/StatCard.jsx';
import { BrandBarChart, BrandDonutChart } from '../../../components/data/charts.jsx';
import Screen, { PageHeader } from '../../../components/layout/Screen.jsx';
import Avatar from '../../../components/ui/Avatar.jsx';
import { adminApi } from '../api.js';
import { useActivity, useAdminStats, useAdsOverview, useFeedback, useFlags, useVerifications } from '../useAdmin.js';
import { LoadError } from './shared.jsx';
import { timeAgo } from './format.js';

const ACTIONS = {
  CREATE_SUBJECT: 'created a subject', UPDATE_SUBJECT: 'edited a subject', DELETE_SUBJECT: 'deleted a subject',
  BULK_IMPORT: 'imported questions', BULK_DELETE_QUESTIONS: 'deleted questions', BULK_TOGGLE_QUESTIONS: 'changed question visibility',
  APPROVE_VERIFICATION: 'approved a verification', REJECT_VERIFICATION: 'rejected a verification', CREATE_STUDENT: 'added a student',
  UPDATE_SETTINGS: 'changed settings', ENTITLEMENT_GRANT: 'granted a pass', ENTITLEMENT_REVOKE: 'revoked a pass',
};
const describe = (action) => ACTIONS[action] ?? action.toLowerCase().replaceAll('_', ' ');

function OverviewScreen() {
  const toast = useToast();
  const stats = useAdminStats();
  const activity = useActivity(8);
  const feedback = useFeedback({ limit: 1 });
  const flags = useFlags();
  const verifications = useVerifications('pending');
  const ads = useAdsOverview();

  const exportCsv = async () => {
    try {
      const blob = await adminApi.exportResults();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'testflow-results.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Could not export results', 'Please try again.');
    }
  };

  const s = stats.data?.stats;
  const attention = [
    { to: '/admin/reports', icon: Flag, label: 'Reported questions', count: flags.data?.counts?.open },
    { to: '/admin/feedback', icon: MessageSquare, label: 'Feedback to answer', count: feedback.data?.counts?.open },
    { to: '/admin/verifications', icon: ShieldCheck, label: 'Verifications waiting', count: verifications.data?.length },
    { to: '/admin/ads', icon: Megaphone, label: 'Ads awaiting review', count: ads.data?.campaignsByStatus?.pending_review },
  ];

  return (
    <Screen width="full">
      <PageHeader title="Overview" subtitle="How Testflow is doing right now." action={<Button variant="outline" size="sm" onClick={exportCsv} leadingIcon={<Download size={15} />}>Export results</Button>} />

      {stats.isLoading ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i} className="h-32" />)}</div>
      ) : stats.error ? (
        <div className="mt-8"><LoadError error={stats.error} what="the overview" /></div>
      ) : (
        <div className="mt-8 space-y-8">
          <Reveal>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <StatCard label="Students" value={s.users.students} icon={Users} tone="primary" trend={s.users.growth?.weekPercent} trendLabel="new this week vs last" />
              <StatCard label="Active now" value={s.usage.activeNow} icon={Activity} tone="sage" trendLabel="exams started in the last hour" />
              <StatCard label="Exams taken" value={s.usage.completedSessions} icon={ClipboardList} tone="accent" trendLabel={`${s.usage.totalSessions} started in total`} />
              <StatCard label="Platform average" value={`${s.usage.averageScore}%`} icon={TrendingUp} tone="primary" trendLabel={`Most practised: ${s.usage.topSubject}`} />
              <StatCard label="Questions" value={s.content.questions} icon={FileQuestion} tone="sage" />
              <StatCard label="Subjects" value={s.content.subjects} icon={BookOpenCheck} tone="accent" />
            </div>
          </Reveal>

          <Reveal delay={0.06}>
            <section aria-labelledby="attention">
              <h2 id="attention" className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-muted">Needs attention</h2>
              <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {attention.map(({ to, icon: Icon, label, count }) => (
                  <li key={to}>
                    <Link to={to} className="tf-pressable flex items-center gap-3 rounded-[20px] border border-border bg-surface p-4 hover:border-border-strong hover:bg-surface-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-lavender)] text-primary"><Icon size={18} strokeWidth={1.5} aria-hidden="true" /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-heading text-2xl font-extrabold leading-none tabular-nums text-foreground-strong">{count ?? '-'}</span>
                        <span className="mt-1 block text-sm text-muted">{label}</span>
                      </span>
                      <ArrowRight size={16} className="shrink-0 text-muted" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="grid gap-6 lg:grid-cols-3">
              <Card padding="lg">
                <h2 className="font-heading text-base font-bold text-foreground-strong">Active students</h2>
                <p className="mb-4 text-sm text-muted">Signed in during the last day, week and month.</p>
                <BrandBarChart label="Active students" height={220} highlightLast={false} animate data={[{ name: 'Day', value: s.users.activity?.daily ?? 0 }, { name: 'Week', value: s.users.activity?.weekly ?? 0 }, { name: 'Month', value: s.users.activity?.monthly ?? 0 }]} />
              </Card>
              <Card padding="lg">
                <h2 className="font-heading text-base font-bold text-foreground-strong">Subjects by level</h2>
                <p className="mb-4 text-sm text-muted">How the bank is spread.</p>
                <BrandBarChart label="Subjects by level" height={220} highlightLast={false} animate data={Object.entries(s.content.levels).map(([name, value]) => ({ name, value }))} />
              </Card>
              <Card padding="lg">
                <h2 className="font-heading text-base font-bold text-foreground-strong">Papers finished</h2>
                <p className="mb-2 text-sm text-muted">Submitted against abandoned.</p>
                <BrandDonutChart label="Papers finished" height={190} animate centerLabel={`${s.usage.totalSessions ? Math.round((s.usage.completedSessions / s.usage.totalSessions) * 100) : 0}%`} data={[{ name: 'Submitted', value: s.usage.completedSessions }, { name: 'Not finished', value: Math.max(0, s.usage.totalSessions - s.usage.completedSessions) }]} />
              </Card>
            </div>
          </Reveal>

          <Reveal delay={0.18}>
            <div className="grid gap-6 lg:grid-cols-2">
              <Card padding="lg">
                <div className="mb-4 flex items-center justify-between"><h2 className="font-heading text-base font-bold text-foreground-strong">New students</h2><Link to="/admin/users" className="text-sm font-semibold text-primary hover:underline">All users</Link></div>
                <ul className="divide-y divide-border">
                  {(stats.data.recentUsers ?? []).map((u) => (
                    <li key={u.id ?? u._id} className="flex items-center gap-3 py-3">
                      <Avatar name={u.fullName} size="sm" />
                      <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-foreground-strong">{u.fullName}</p><p className="truncate text-xs text-muted">{u.email}</p></div>
                      <span className="shrink-0 text-xs text-muted">{timeAgo(u.createdAt)}</span>
                    </li>
                  ))}
                </ul>
              </Card>
              <Card padding="lg">
                <div className="mb-4 flex items-center justify-between"><h2 className="font-heading text-base font-bold text-foreground-strong">Recent activity</h2><Link to="/admin/activity" className="text-sm font-semibold text-primary hover:underline">Audit log</Link></div>
                {activity.data?.logs?.length ? (
                  <ul className="divide-y divide-border">
                    {activity.data.logs.map((l) => (
                      <li key={l._id ?? l.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                        <span className="min-w-0 truncate text-foreground-strong"><span className="font-semibold">{l.actor?.fullName ?? 'System'}</span> {describe(l.action)}</span>
                        <Badge variant="outline" className="shrink-0">{timeAgo(l.createdAt)}</Badge>
                      </li>
                    ))}
                  </ul>
                ) : <p className="py-6 text-center text-sm text-muted">No activity yet.</p>}
              </Card>
            </div>
          </Reveal>
        </div>
      )}
    </Screen>
  );
}

export default OverviewScreen;

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, BookOpen, ChevronRight, ClipboardList, Target, TrendingUp } from 'lucide-react';
import { Badge, Banner, Button, Card, EmptyState, ProgressBar, Reveal, SegmentedControl, SkeletonCard } from '../../components/ui/index.js';
import StatCard from '../../components/data/StatCard.jsx';
import FilterableList from '../../components/data/FilterableList.jsx';
import { StreakBadge } from '../../components/data/Badges.jsx';
import { BrandBarChart, BrandDonutChart, BrandLineChart } from '../../components/data/charts.jsx';
import Mascot from '../../components/brand/Mascot.jsx';
import Screen, { PageHeader } from '../../components/layout/Screen.jsx';
import { scorePill } from '../../utils/score.js';
import { cn } from '../../utils/cn.js';
import { subjectMeta } from '../subjects/subjectMeta.js';
import { useHistory } from '../exam/useHistory.js';
import { useStats } from './useStats.js';

const RANGES = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: 'all', label: 'All time' },
];

const dayKey = (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

/** Consecutive days with a submitted paper, counting back from today (or yesterday, so the day is not lost before you practise). */
function practiceStreak(submitted) {
  const days = new Set(submitted.map((s) => dayKey(new Date(s.submittedAt))));
  const cursor = new Date();
  if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let count = 0;
  while (days.has(dayKey(cursor))) {
    count += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : null;

const FILTERS = [
  { value: 'all', label: 'All', test: () => true },
  { value: 'passed', label: 'Passed', test: (s) => s.status === 'submitted' && s.score >= 70 },
  { value: 'below', label: 'Below 70', test: (s) => s.status === 'submitted' && s.score < 70 },
  { value: 'open', label: 'In progress', test: (s) => s.status !== 'submitted' },
];

/** One page: performance up top, every past paper below. (/history redirects here.) */
function ProgressPage() {
  const stats = useStats();
  const history = useHistory();

  const isLoading = stats.isLoading || history.isLoading;
  const error = stats.error ?? history.error;

  return (
    <Screen width="full">
      <PageHeader
        title="Progress"
        subtitle="How you are doing and every paper you have sat."
        action={
          <Link to="/achievements">
            <Button variant="outline" size="sm" leadingIcon={<Award size={15} />}>Achievements</Button>
          </Link>
        }
      />

      <div className="mt-6">
        {isLoading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {Array.from({ length: 4 }, (_, i) => <SkeletonCard key={i} className="h-32" />)}
            </div>
            <SkeletonCard className="h-72" />
          </div>
        ) : error ? (
          <Banner variant="danger">{error?.message ?? 'Could not load your progress.'}</Banner>
        ) : !stats.data?.totalExams && !history.data?.length ? (
          <EmptyState
            mood="thinking"
            title="No papers yet"
            description="Finish your first exam and your progress and history show up here."
            action={<Link to="/dashboard"><Button>Start practising</Button></Link>}
          />
        ) : (
          <div className="space-y-10">
            <Overview stats={stats.data} sessions={history.data ?? []} />
            <Reveal delay={0.32}>
            <section aria-labelledby="history-title">
              <h2 id="history-title" className="mb-4 font-heading text-xl font-extrabold tracking-tight text-foreground-strong">
                History
              </h2>
              <History sessions={history.data ?? []} />
            </section>
            </Reveal>
          </div>
        )}
      </div>
    </Screen>
  );
}

function Overview({ stats, sessions }) {
  const [range, setRange] = useState('all');
  const [now] = useState(() => Date.now());
  const submitted = useMemo(() => sessions.filter((s) => s.status === 'submitted'), [sessions]);
  const trend = useMemo(() => {
    const cutoff = range === 'all' ? 0 : now - Number(range) * 24 * 60 * 60 * 1000;
    return submitted
      .filter((s) => new Date(s.submittedAt).getTime() >= cutoff)
      .reverse()
      .map((s) => ({
        name: new Date(s.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        value: s.score,
      }));
  }, [submitted, range, now]);
  const mix = useMemo(
    () => [
      { name: 'Passed (70+)', value: submitted.filter((s) => s.score >= 70).length },
      { name: 'Borderline (50-69)', value: submitted.filter((s) => s.score >= 50 && s.score < 70).length },
      { name: 'Below 50', value: submitted.filter((s) => s.score < 50).length },
    ].filter((d) => d.value > 0),
    [submitted],
  );
  const streak = useMemo(() => practiceStreak(submitted), [submitted]);

  if (!stats || stats.totalExams === 0) {
    return (
      <EmptyState
        mood="thinking"
        title="No stats yet"
        description="Finish your first exam and your progress shows up here."
        action={<Link to="/dashboard"><Button>Start practising</Button></Link>}
      />
    );
  }

  const ranked = [...stats.perSubject].sort((a, b) => b.averageScore - a.averageScore);
  const strongest = ranked[0];
  const weakest = ranked.length > 1 ? ranked[ranked.length - 1] : null;
  const latestDelta = submitted.length >= 2 ? submitted[0].score - submitted[1].score : null;

  return (
    <div className="space-y-6">
      <Reveal delay={0}>
<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Exams taken" value={stats.totalExams} icon={ClipboardList} tone="primary" />
        <StatCard label="Average score" value={`${stats.averageScore}%`} icon={TrendingUp} tone="sage" trend={latestDelta} trendLabel={latestDelta != null ? 'Latest vs previous' : undefined} />
        <StatCard label="Best score" value={`${stats.bestScore}%`} icon={Target} tone="accent" />
        <StatCard label="Subjects practised" value={stats.perSubject.length} icon={BookOpen} tone="primary" />
      </div>
      </Reveal>

      <Reveal delay={0.08}>
<Card padding="lg" className="flex flex-col items-center gap-5 bg-[var(--brand-lavender)] sm:flex-row">
        <Mascot mood={stats.averageScore >= 70 ? 'confident' : 'encouraging'} animation="float" size={96} />
        <div className="text-center sm:text-left">
          {streak > 0 && <StreakBadge days={streak} className="mb-2" />}
          <p className="font-heading text-lg font-bold text-foreground-strong">
            {stats.averageScore >= 70 ? 'You are on track.' : 'Keep going. It adds up.'}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-foreground">
            {strongest && <>Strongest: <strong>{strongest.subjectCode}</strong> at {strongest.averageScore}%. </>}
            {weakest && <>Most room to grow: <strong>{weakest.subjectCode}</strong> at {weakest.averageScore}%.</>}
          </p>
        </div>
      </Card>
      </Reveal>

      <Reveal delay={0.16}>
<div className="grid gap-6 lg:grid-cols-2">
        <Card padding="lg">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-heading text-base font-bold text-foreground-strong">Score trend</h2>
              <p className="text-sm text-muted">Each paper you submitted, by date.</p>
            </div>
            <SegmentedControl label="Range" size="sm" value={range} onValueChange={setRange} options={RANGES} />
          </div>
          {trend.length >= 2 ? (
            <BrandLineChart key={range} animate data={trend} label={`Scores over your last ${trend.length} exams`} height={240} />
          ) : (
            <p className="py-16 text-center text-sm text-muted">
              {range === 'all' ? 'Sit one more paper to see a trend.' : 'Fewer than two papers in this period. Try a longer range.'}
            </p>
          )}
        </Card>

        <Card padding="lg">
          <h2 className="font-heading text-base font-bold text-foreground-strong">By subject</h2>
          <p className="mb-4 text-sm text-muted">Average score for each subject.</p>
          <BrandBarChart
            animate
            data={ranked.map((s) => ({ name: s.subjectCode, value: s.averageScore }))}
            label="Average score by subject"
            height={240}
            highlightLast={false}
          />
        </Card>
      </div>
      </Reveal>

      <Reveal delay={0.24}>
<div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <Card padding="lg">
        <h2 className="mb-4 font-heading text-base font-bold text-foreground-strong">Subject breakdown</h2>
        <ul className="space-y-4">
          {ranked.map((s) => {
            const { Icon, accent } = subjectMeta(s.subjectCode);
            return (
              <li key={s.subjectCode} className="flex items-center gap-3">
                <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-xl', accent)}>
                  <Icon size={18} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                    <span className="font-semibold text-foreground-strong">{s.subjectCode}</span>
                    <span className="tabular-nums text-muted">{s.averageScore}%{s.exams ? ` · ${s.exams} exams` : ''}</span>
                  </div>
                  <ProgressBar value={s.averageScore} tone={s.averageScore >= 70 ? 'success' : s.averageScore >= 50 ? 'warning' : 'danger'} label={undefined} />
                </div>
              </li>
            );
          })}
        </ul>
      </Card>

      <Card padding="lg">
        <h2 className="font-heading text-base font-bold text-foreground-strong">How your papers went</h2>
        <p className="mb-2 text-sm text-muted">Passed, borderline and below 50.</p>
        <BrandDonutChart animate data={mix} label="Papers by result" height={200} centerLabel={String(submitted.length)} />
        <ul className="mt-3 space-y-1.5 text-sm">
          {mix.map((m) => (
            <li key={m.name} className="flex justify-between gap-3 text-muted">
              <span>{m.name}</span>
              <span className="font-semibold tabular-nums text-foreground-strong">{m.value}</span>
            </li>
          ))}
        </ul>
      </Card>
      </div>
      </Reveal>
    </div>
  );
}

function History({ sessions }) {
  if (!sessions.length) {
    return (
      <EmptyState
        mood="thinking"
        title="No papers yet"
        description="Sit one and it lands here, with the score and how long you took."
        action={<Link to="/dashboard"><Button>Start practising</Button></Link>}
      />
    );
  }

  return (
    <FilterableList
      items={sessions}
      searchKeys={['subjectCode']}
      pageSize={6}
      filters={FILTERS}
      placeholder="Search by subject code"
      emptyTitle="No papers match"
      renderItem={(item) => <HistoryRow item={item} />}
    />
  );
}

function HistoryRow({ item }) {
  const { Icon, accent } = subjectMeta(item.subjectCode);
  const submitted = item.status === 'submitted';
  return (
    <Link
      to={submitted ? `/exam/${item.id}/result` : `/exam/${item.id}`}
      className="tf-pressable flex min-h-16 items-center gap-3 rounded-[20px] border border-border bg-surface p-3.5 hover:border-border-strong hover:bg-surface-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-xl', accent)}>
        <Icon size={18} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold text-foreground-strong">{item.subjectCode}</p>
        <p className="mt-0.5 text-[13px] text-muted">
          {submitted ? `${formatDate(item.submittedAt)} · ${item.correctCount}/${item.totalQuestions} correct` : 'Not finished'}
        </p>
      </div>
      {submitted ? (
        <span className={cn('shrink-0 rounded-full px-2.5 py-1 text-[15px] font-bold tabular-nums', scorePill(item.score))}>
          {item.score}%
        </span>
      ) : (
        <Badge variant="warning">Resume</Badge>
      )}
      <ChevronRight size={16} className="shrink-0 text-muted" aria-hidden="true" />
    </Link>
  );
}

export default ProgressPage;

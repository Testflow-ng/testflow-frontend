import { useMemo, useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { Crown, Trophy } from 'lucide-react';
import { Banner, Card, EmptyState, Reveal, Select, SkeletonCard } from '../../components/ui/index.js';
import Mascot from '../../components/brand/Mascot.jsx';
import LeaderboardRow from '../../components/data/LeaderboardRow.jsx';
import Screen, { PageHeader } from '../../components/layout/Screen.jsx';
import { cn } from '../../utils/cn.js';
import { useAuth } from '../auth/useAuth.js';
import { subjectsApi } from '../subjects/api.js';
import { useSubjects } from '../subjects/useSubjects.js';

const OVERALL = 'overall';
const PODIUM = ['bg-accent text-accent-foreground', 'bg-[var(--brand-lavender)] text-primary', 'bg-[var(--brand-sage)] text-secondary'];
const mmss = (s) => (s == null ? null : `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, '0')}s`);

/** Rank rows from the per-subject boards. Overall adds each student's best score in every subject they appear in. */
function buildOverall(boards) {
  const byUser = new Map();
  boards.forEach((rows = []) =>
    rows.forEach((r) => {
      const key = r.username ?? r.fullName;
      const cur = byUser.get(key) ?? { username: r.username, fullName: r.fullName, score: 0, subjects: 0 };
      cur.score += r.score;
      cur.subjects += 1;
      byUser.set(key, cur);
    }),
  );
  return [...byUser.values()].sort((a, b) => b.score - a.score || b.subjects - a.subjects);
}

function HallOfFamePage() {
  const { user } = useAuth();
  const { data: subjects, isLoading: loadingSubjects } = useSubjects();
  const [choice, setChoice] = useState(OVERALL);

  const withQuestions = useMemo(() => (subjects ?? []).filter((s) => (s.questionCount ?? 0) > 0), [subjects]);
  const wanted = choice === OVERALL ? withQuestions : withQuestions.filter((s) => s.id === choice);

  const boards = useQueries({
    queries: wanted.map((s) => ({ queryKey: ['leaderboard', s.id], queryFn: () => subjectsApi.leaderboard(s.id), staleTime: 5 * 60 * 1000 })),
  });
  const loading = loadingSubjects || boards.some((b) => b.isLoading);
  const failed = boards.find((b) => b.isError);

  const data = boards.map((b) => b.data);
  const rows =
    choice === OVERALL
      ? buildOverall(data).map((r) => ({ ...r, detail: `${r.subjects} subject${r.subjects === 1 ? '' : 's'}` }))
      : (data[0] ?? []).map((r) => ({ ...r, detail: [`${r.totalQuestions} questions`, mmss(r.timeTakenSeconds)].filter(Boolean).join(' · ') }));

  const options = [{ value: OVERALL, label: 'Overall' }, ...withQuestions.map((s) => ({ value: s.id, label: `${s.code} · ${s.title}` }))];
  const isYou = (r) => Boolean(user?.username) && r.username === user.username;
  const mine = rows.findIndex(isYou);
  const top = rows.slice(0, 3);
  const rest = rows.slice(3);
  const label = (r) => r.username ?? r.fullName;
  const unit = choice === OVERALL ? 'pts' : '%';

  return (
    <Screen width="xl">
      <PageHeader title="Hall of Fame" subtitle="The best scores across Testflow. Top 10 per subject." />

      <div className="mt-6 grid gap-6">
        <Reveal>
          <Card padding="lg" className="grid items-center gap-5 bg-[var(--brand-lavender)] sm:grid-cols-[auto_1fr_16rem]">
            <Mascot mood={mine === 0 ? 'excited' : mine > 0 ? 'happy' : 'encouraging'} animation="float" size={96} className="mx-auto" />
            <div className="text-center sm:text-left">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">{choice === OVERALL ? 'All subjects' : 'Subject board'}</p>
              <h2 className="mt-1 font-heading text-2xl font-extrabold tracking-tight text-foreground-strong">
                {mine >= 0 ? <>You are <em className="tf-accent font-normal">#{mine + 1}</em></> : <>Climb the <em className="tf-accent font-normal">board</em></>}
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-foreground">
                {mine >= 0 ? 'Keep your best score on top.' : user?.username ? 'Score high and fast to get into the top 10.' : 'Set a username in your profile to appear here.'}
              </p>
            </div>
            <Select aria-label="Board" value={choice} onValueChange={setChoice} options={options} />
          </Card>
        </Reveal>

        {loading ? (
          <div className="space-y-3"><SkeletonCard className="h-40" /><SkeletonCard className="h-64" /></div>
        ) : failed ? (
          <Banner variant="danger">{failed.error?.message ?? 'Could not load the board.'}</Banner>
        ) : rows.length === 0 ? (
          <EmptyState mood="thinking" title="Nobody here yet" description="Finish an exam in this subject and your name goes up first." />
        ) : (
          <>
            <Reveal delay={0.08}>
              <ol className="grid gap-3 sm:grid-cols-3">
                {top.map((r, i) => (
                  <li key={label(r)}>
                    <Card className={cn('flex h-full flex-col items-center gap-2 text-center', isYou(r) && 'ring-2 ring-primary/30')}>
                      <span className={cn('flex size-11 items-center justify-center rounded-full', PODIUM[i])}>
                        {i === 0 ? <Crown size={20} strokeWidth={1.5} aria-label="First place" /> : <Trophy size={18} strokeWidth={1.5} aria-label={`Place ${i + 1}`} />}
                      </span>
                      <p className="font-heading text-lg font-bold text-foreground-strong">#{i + 1}</p>
                      <p className="max-w-full truncate text-[15px] font-semibold text-foreground-strong">{label(r)}{isYou(r) && <span className="ml-1.5 text-xs font-bold text-primary">You</span>}</p>
                      <p className="font-heading text-2xl font-extrabold tabular-nums text-foreground-strong">{Math.round(r.score)}<span className="text-sm font-bold text-muted"> {unit}</span></p>
                      <p className="text-xs text-muted">{r.detail}</p>
                    </Card>
                  </li>
                ))}
              </ol>
            </Reveal>
            {rest.length > 0 && (
              <Reveal delay={0.16}>
                <div className="space-y-2">
                  {rest.map((r, i) => (
                    <LeaderboardRow key={label(r)} rank={i + 4} name={label(r)} score={`${Math.round(r.score)}${unit === '%' ? '%' : ''}`} detail={r.detail} isYou={isYou(r)} />
                  ))}
                </div>
              </Reveal>
            )}
          </>
        )}
      </div>
    </Screen>
  );
}

export default HallOfFamePage;

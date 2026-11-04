import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Award, CalendarClock, ClipboardList, Percent, UserX } from 'lucide-react';
import { Badge, Card, EmptyState, Reveal, SkeletonCard } from '../../../components/ui/index.js';
import DataTable from '../../../components/data/DataTable.jsx';
import StatCard from '../../../components/data/StatCard.jsx';
import { BrandBarChart, BrandLineChart } from '../../../components/data/charts.jsx';
import Screen, { PageHeader } from '../../../components/layout/Screen.jsx';
import { useStudent } from '../useWorkspace.js';
import { fmtDate } from '../../admin/screens/format.js';

const tone = (n) => (n >= 70 ? 'success' : n >= 50 ? 'warning' : 'danger');
const initials = (name = '') => name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

/** One student: who they are, every exam they took, and how their scores move over time. */
function StudentDetailScreen() {
  const { studentId } = useParams();
  const { data, isLoading, error } = useStudent(studentId);
  const student = data?.student;
  const attempts = useMemo(() => [...(data?.attempts ?? [])].sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt)), [data]);
  const perExam = useExamAverages(attempts);

  if (isLoading) return <Screen width="full"><PageHeader back="/workspace/students" title="Student" /><div className="mt-8 space-y-4"><SkeletonCard className="h-28" /><SkeletonCard className="h-64" /></div></Screen>;
  if (error || !student) return <Screen width="full"><PageHeader back="/workspace/students" title="Student" /><EmptyState icon={UserX} className="mt-8" title="Student not found" description="They may have been removed from your students." /></Screen>;

  const scores = attempts.map((a) => a.scorePercent);
  const avg = scores.length ? Math.round(scores.reduce((x, y) => x + y, 0) / scores.length) : null;
  const best = scores.length ? Math.max(...scores) : null;
  const last = attempts.at(-1);
  const trend = scores.length > 1 ? scores.at(-1) - scores[0] : undefined;
  const line = attempts.map((a) => ({ name: fmtDate(a.submittedAt), value: a.scorePercent }));

  const columns = [
    { key: 'examTitle', header: 'Exam', render: (a) => <span className="font-semibold text-foreground-strong">{a.examTitle}</span> },
    { key: 'scorePercent', header: 'Score', align: 'right', render: (a) => <Badge variant={tone(a.scorePercent)}>{a.scorePercent}%</Badge> },
    { key: 'correct', header: 'Correct', align: 'right', render: (a) => `${a.correct}/${a.total}` },
    { key: 'timeMinutes', header: 'Time', align: 'right', render: (a) => (a.timeMinutes != null ? `${a.timeMinutes} min` : '-') },
    { key: 'submittedAt', header: 'Taken', render: (a) => fmtDate(a.submittedAt) },
  ];

  return (
    <Screen width="full">
      <PageHeader back="/workspace/students" title={student.fullName} subtitle={student.email} action={<Badge variant={student.status === 'active' ? 'success' : 'warning'}>{student.status === 'active' ? 'Joined' : 'Invited'}</Badge>} />
      <div className="mt-8 space-y-8">
        <Reveal>
          <div className="flex items-center gap-4">
            <span className="flex size-14 items-center justify-center rounded-full bg-[var(--brand-lavender)] font-heading text-lg font-extrabold text-primary" aria-hidden="true">{initials(student.fullName)}</span>
            <p className="text-sm text-muted">Joined {fmtDate(student.joinedAt)}{last ? ` · Last exam ${fmtDate(last.submittedAt)}` : ''}</p>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Exams taken" value={attempts.length} icon={ClipboardList} />
            <StatCard label="Average score" value={avg ?? 0} icon={Percent} tone="success" trend={trend} trendLabel="since first exam" />
            <StatCard label="Best score" value={best ?? 0} icon={Award} tone="accent" />
            <StatCard label="Last exam" value={last ? last.scorePercent : 0} icon={CalendarClock} tone="sage" />
          </div>
        </Reveal>

        {attempts.length === 0 ? (
          <EmptyState mood="encouraging" title="No exams yet" description="Once this student takes an exam, their scores and chart show here." />
        ) : (
          <>
            <Reveal delay={0.05}>
              <div className="grid gap-5 lg:grid-cols-2">
                <Card padding="lg"><h2 className="mb-1 font-heading text-lg font-extrabold text-foreground-strong">Score over time</h2><p className="mb-4 text-sm text-muted">Each point is one exam.</p><BrandLineChart label="Score over time" data={line} height={240} /></Card>
                <Card padding="lg"><h2 className="mb-1 font-heading text-lg font-extrabold text-foreground-strong">Average by exam</h2><p className="mb-4 text-sm text-muted">Where they do best.</p><BrandBarChart label="Average score by exam" data={perExam} height={240} /></Card>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <section aria-labelledby="exams"><h2 id="exams" className="mb-3 font-heading text-lg font-extrabold text-foreground-strong">Every exam</h2><DataTable caption="Exams taken" columns={[...columns]} rows={[...attempts].reverse()} emptyMessage="No exams yet." /></section>
            </Reveal>
          </>
        )}
      </div>
    </Screen>
  );
}

function useExamAverages(attempts) {
  return useMemo(() => {
    const map = new Map();
    attempts.forEach((a) => { const r = map.get(a.examTitle) ?? []; r.push(a.scorePercent); map.set(a.examTitle, r); });
    return [...map.entries()].map(([name, v]) => ({ name: name.length > 12 ? `${name.slice(0, 11)}…` : name, value: Math.round(v.reduce((x, y) => x + y, 0) / v.length) }));
  }, [attempts]);
}

export default StudentDetailScreen;

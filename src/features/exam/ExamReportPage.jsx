import { useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, MinusCircle, Printer, Sparkles, XCircle } from 'lucide-react';
import { Alert, Button, KeyValueList, ProgressBar } from '../../components/ui/index.js';
import StatCard from '../../components/data/StatCard.jsx';
import Logo from '../../components/Logo.jsx';
import Mascot from '../../components/brand/Mascot.jsx';
import { moodForScore } from '../../components/brand/mascotMood.js';
import PageLoader from '../../components/PageLoader.jsx';
import MathText from '../../components/MathText.jsx';
import { scoreLabel, scorePill, scoreTone } from '../../utils/score.js';
import { formatTime } from './formatTime.js';
import { useExamResult } from './useExamResult.js';
import { useAuth } from '../auth/useAuth.js';

const letter = (index) => String.fromCharCode(65 + index);
const toneFor = (score) => (score >= 70 ? 'success' : score >= 50 ? 'warning' : 'danger');

const dateLabel = (value) =>
  (value ? new Date(value) : new Date()).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

/**
 * The performance report sheet.
 *
 * This page exists to be printed (or saved as a PDF) rather than browsed: it
 * puts the score, the paper, what Flo made of it, the topic breakdown and every
 * question that was missed on one sheet a student can keep, pin to a wall or
 * take to a lecturer.
 *
 * It reads the same `GET /api/exam-sessions/:id/result` payload the result page
 * does, so nothing here can disagree with the screen it came from. The toolbar
 * is `print:hidden`, and the sheet carries `tf-print-sheet` (see global.css) so
 * the paper copy is the report, not a screenshot of the app.
 */
function ExamReportPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isPostUtme = searchParams.get('type') === 'post-utme';
  const { user } = useAuth();

  const {
    data: result,
    isLoading,
    isError,
    error,
  } = useExamResult(id, isPostUtme);

  const questions = useMemo(() => result?.questions ?? [], [result]);

  const topics = useMemo(() => {
    if (!result?.questions) return [];
    const map = new Map();
    result.questions.forEach((question) => {
      const key = question.topic ?? result.subjectCode;
      if (!map.has(key)) map.set(key, { topic: key, total: 0, correct: 0 });
      const row = map.get(key);
      row.total += 1;
      if (question.isCorrect) row.correct += 1;
    });
    return [...map.values()]
      .map((row) => ({ ...row, percent: Math.round((row.correct / row.total) * 100) }))
      .sort((a, b) => a.percent - b.percent);
  }, [result]);

  const missed = useMemo(() => questions.filter((q) => !q.isCorrect), [questions]);

  /* Same 50:40:10 formula the result page shows, so the printed sheet and the
     screen it came from cannot print two different aggregates. */
  const aggregate = useMemo(() => {
    if (!isPostUtme || !result || !user) return null;
    const jamb = (user.utmeData?.jambScore || 0) / 8;
    const oLevel = user.utmeData?.oLevelPoints || 0;
    const postUtme = result.totalScore || 0;
    return (jamb + oLevel + postUtme).toFixed(2);
  }, [isPostUtme, result, user]);

  if (isLoading) return <PageLoader label="Building your report" />;

  if (isError || !result) {
    return (
      <div className="mx-auto w-full max-w-xl px-5 py-20">
        <Alert variant="danger">{error?.message ?? 'This report could not be built.'}</Alert>
        <Button variant="outline" className="mt-6 w-full" onClick={() => navigate('/dashboard')}>
          Back to dashboard
        </Button>
      </div>
    );
  }

  const reaction = moodForScore(result.score);
  const wrongCount = result.totalQuestions - result.correctCount;
  const skippedCount = questions.filter((q) => q.selectedOption === null).length;
  const wrongOnly = Math.max(0, wrongCount - skippedCount);
  const band = scoreLabel(result.score);

  return (
    <div className="min-h-svh bg-background">
      {/* Not part of the sheet: never printed. */}
      <div className="print:hidden sticky top-0 z-10 border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-5 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/exam/${id}/result${isPostUtme ? '?type=post-utme' : ''}`)}
            leadingIcon={<ArrowLeft size={16} aria-hidden="true" />}
          >
            Result
          </Button>
          <Button
            size="sm"
            onClick={() => window.print()}
            leadingIcon={<Printer size={16} aria-hidden="true" />}
          >
            Save as PDF
          </Button>
        </div>
      </div>

      <div className="tf-print-sheet mx-auto w-full max-w-3xl px-5 py-8 sm:rounded-[24px] sm:border sm:border-border sm:bg-surface sm:px-10 sm:py-10 sm:shadow-[0_1px_2px_rgba(27,67,50,0.04),0_8px_24px_-12px_rgba(27,67,50,0.12)]">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
          <Logo size={34} />
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted">
              Performance report
            </p>
            <p className="mt-0.5 text-sm font-semibold text-foreground-strong">
              {dateLabel(result.submittedAt)}
            </p>
          </div>
        </header>

        {/* Score and Flo. He reads the number before the student finishes scrolling to it. */}
        <section
          className={`tf-print-flat mt-6 flex flex-col items-center gap-5 rounded-[20px] p-6 sm:flex-row sm:items-center sm:gap-8 ${scorePill(result.score)}`}
        >
          <Mascot mood={reaction.mood} size={112} className="shrink-0" />
          <div className="text-center sm:text-left">
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-muted">
              {result.subjectCode}
            </p>
            <p
              className={`mt-1 font-heading text-6xl font-extrabold leading-none tabular-nums tracking-tight ${scoreTone(result.score)}`}
            >
              {result.score}%
            </p>
            <p className="mt-2 text-sm font-medium text-muted">
              {result.correctCount} of {result.totalQuestions} correct · {band}
            </p>
            <p className="mt-2 text-[15px] font-semibold">{reaction.line}</p>
          </div>
        </section>

        {/*
          The counts are passed as strings on purpose: `StatCard` counts a number
          up on mount, and a figure that is still animating when `window.print()`
          fires would put a half-counted number on the paper. A report is a
          document, so its numbers are static from the first frame.
        */}
        <section className="mt-6 grid grid-cols-3 gap-3">
          <StatCard label="Correct" value={String(result.correctCount)} tone="success" icon={CheckCircle2} />
          <StatCard label="Wrong" value={String(wrongOnly)} tone="warning" icon={XCircle} />
          <StatCard label="Skipped" value={String(skippedCount)} tone="sage" icon={MinusCircle} />
        </section>

        <section className="mt-6">
          <h2 className="mb-3 text-xs font-black uppercase tracking-widest text-muted">The paper</h2>
          <KeyValueList
            className="tf-print-flat"
            items={[
              { label: 'Candidate', value: user?.fullName ?? 'TestFlow student' },
              ...(user?.matricNumber ? [{ label: 'Matric number', value: user.matricNumber }] : []),
              { label: 'Subject', value: result.subjectCode },
              { label: 'Questions', value: result.totalQuestions },
              ...(result.timeTakenSeconds
                ? [{ label: 'Time taken', value: formatTime(result.timeTakenSeconds) }]
                : []),
              { label: 'Submitted', value: dateLabel(result.submittedAt) },
              ...(aggregate
                ? [{ label: 'Admission aggregate', value: `${aggregate} / 100.00` }]
                : []),
            ]}
          />
        </section>

        {topics.length > 0 && (
          <section className="mt-6">
            <h2 className="mb-3 text-xs font-black uppercase tracking-widest text-muted">
              Topic breakdown
            </h2>
            <ul className="flex flex-col gap-3">
              {topics.map((row) => (
                <li key={row.topic}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-sm font-semibold text-foreground-strong">{row.topic}</span>
                    <span className="text-xs font-bold tabular-nums text-muted">
                      {row.correct}/{row.total} · {row.percent}%
                    </span>
                  </div>
                  <ProgressBar
                    className="mt-1.5"
                    value={row.percent}
                    tone={toneFor(row.percent)}
                    label={`${row.topic}: ${row.percent} percent`}
                    labelHidden
                    size="sm"
                  />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-6">
          <h2 className="mb-3 text-xs font-black uppercase tracking-widest text-muted">
            What to revise
          </h2>
          {missed.length === 0 ? (
            <p className="rounded-[20px] border border-success/30 bg-success/5 p-4 text-sm font-semibold text-score-good">
              Nothing missed. There is nothing on this paper to revise.
            </p>
          ) : (
            <ol className="flex flex-col gap-3">
              {missed.map((question) => (
                <li key={question.index} className="border-t border-border pt-3">
                  <div className="flex items-start gap-2 text-[15px] leading-snug text-foreground-strong">
                    <span className="shrink-0 font-bold tabular-nums text-muted">
                      {question.index + 1}.
                    </span>
                    <MathText className="min-w-0 flex-1">{question.stem}</MathText>
                  </div>
                  <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 pl-6 text-[13px]">
                    <span className="font-semibold text-score-low">
                      {question.selectedOption === null
                        ? 'Left blank'
                        : `You chose ${letter(question.selectedOption)}`}
                    </span>
                    <span className="text-muted">·</span>
                    <span className="font-semibold text-score-good">
                      Answer: {letter(question.correctOption)}. {question.options[question.correctOption]}
                    </span>
                  </p>
                </li>
              ))}
            </ol>
          )}
        </section>

        <footer className="mt-8 flex items-start gap-2 border-t border-border pt-4 text-xs leading-relaxed text-muted">
          <Sparkles size={14} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
          <span>
            Generated by TestFlow from this attempt&rsquo;s answers. Practice marks are a guide to
            where you stand, not a prediction of the hall. Keep going, {user?.fullName?.split(' ')[0] ?? 'scholar'}.
          </span>
        </footer>
      </div>
    </div>
  );
}

export default ExamReportPage;

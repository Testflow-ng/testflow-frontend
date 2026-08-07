import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Flag,
  LayoutGrid,
  Check,
  X,
  AlertTriangle,
  Keyboard,
} from 'lucide-react';
import { Alert, Button, Modal } from '../../components/ui/index.js';
import PageLoader from '../../components/PageLoader.jsx';
import MathText from '../../components/MathText.jsx';
import { cn } from '../../utils/cn.js';
import { examApi } from './api.js';
import { useCountdown } from './useCountdown.js';
import SubmitSuspense from './SubmitSuspense.jsx';
import { formatTime } from './formatTime.js';

const letter = (index) => String.fromCharCode(65 + index);

const STATE_ANSWERED = 'answered';
const STATE_MARKED = 'marked';
const STATE_EMPTY = 'empty';

/** Answered still counts when a question is also flagged, so the two can stack. */
const stateOf = (answer) => {
  if (!answer) return STATE_EMPTY;
  if (answer.markedForReview) return STATE_MARKED;
  return answer.selectedOption !== null ? STATE_ANSWERED : STATE_EMPTY;
};

function QuestionGrid({ questions, answers, current, onJump, className }) {
  return (
    <div className={cn('grid grid-cols-6 gap-2 sm:grid-cols-8 lg:grid-cols-5', className)}>
      {questions.map((_, index) => {
        const answer = answers[index];
        const state = stateOf(answer);
        const isCurrent = index === current;
        return (
          <button
            key={index}
            type="button"
            onClick={() => onJump(index)}
            aria-label={`Question ${index + 1}, ${state === STATE_MARKED ? 'flagged' : state === STATE_ANSWERED ? 'answered' : 'not answered'}`}
            aria-current={isCurrent ? 'true' : undefined}
            className={cn(
              'relative flex h-10 items-center justify-center rounded-lg border text-sm font-bold tabular-nums transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              isCurrent && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
              state === STATE_ANSWERED && 'border-primary bg-primary text-primary-foreground',
              state === STATE_MARKED && 'border-warning bg-warning/15 text-warning',
              state === STATE_EMPTY && 'border-border bg-surface text-muted',
            )}
          >
            {index + 1}
            {state === STATE_MARKED && answer?.selectedOption !== null && (
              <span className="absolute right-1 top-1 size-1.5 rounded-full bg-primary" />
            )}
          </button>
        );
      })}
    </div>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted">
      <span className="flex items-center gap-1.5">
        <span className="size-2.5 rounded-sm bg-primary" /> Answered
      </span>
      <span className="flex items-center gap-1.5">
        <span className="size-2.5 rounded-sm bg-warning/60" /> Flagged
      </span>
      <span className="flex items-center gap-1.5">
        <span className="size-2.5 rounded-sm border border-border bg-surface" /> Not answered
      </span>
    </div>
  );
}

function ExamRuntime({ session }) {
  const navigate = useNavigate();
  const id = session.id;
  const questions = useMemo(() => session.questions || [], [session.questions]);
  const total = questions.length;

  const [answers, setAnswers] = useState(() =>
    questions.map((question) => ({
      selectedOption: question.selectedOption ?? null,
      markedForReview: Boolean(question.markedForReview),
    })),
  );
  const [current, setCurrent] = useState(0);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitPhase, setSubmitPhase] = useState('marking');
  const [exitOpen, setExitOpen] = useState(false);
  const [notice, setNotice] = useState(null);
  const submittingRef = useRef(false);
  const scrollRef = useRef(null);
  const pendingStrikeRef = useRef(null);
  const noticeTimerRef = useRef(null);

  const persist = useCallback(
    (index, patch) => {
      setAnswers((prev) => {
        const next = [...prev];
        if (next[index]) next[index] = { ...next[index], ...patch };
        return next;
      });
      examApi.saveAnswer(id, { questionIndex: index, ...patch }).catch(() => {});
    },
    [id],
  );

  /*
    Submit, then hold the suspense overlay for a floor of ~1.7s.

    Marking is a single fast request, so without a floor the overlay would
    flash and vanish — worse than no overlay at all. The floor runs *in
    parallel* with the request via Promise.all, so a slow network is never
    penalised twice: the wait is max(request, floor), never the sum.

    The phase steps on a timer so the screen reads as progress rather than a
    stall, and the submit itself still completes even if the user's connection
    makes the request outlast the animation.
  */
  const submit = useCallback(async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    setSubmitPhase('marking');

    const stepA = setTimeout(() => setSubmitPhase('tallying'), 700);
    const stepB = setTimeout(() => setSubmitPhase('ready'), 1300);
    const floor = new Promise((resolve) => setTimeout(resolve, 1700));

    try {
      await Promise.all([examApi.submit(id), floor]);
    } catch (err) {
      console.error('Submission Error:', err);
    } finally {
      clearTimeout(stepA);
      clearTimeout(stepB);
    }

    navigate(`/exam/${id}/result`, { replace: true });
  }, [id, navigate]);

  const remaining = useCountdown(session.expiresAt, submit);

  const answeredCount = answers.filter((a) => a.selectedOption !== null).length;
  const flaggedCount = answers.filter((a) => a.markedForReview).length;
  const unanswered = answers
    .map((a, i) => (a.selectedOption === null ? i : null))
    .filter((i) => i !== null);

  const question = questions[current];
  const answer = answers[current];

  // Escalate quietly: a nudge at five minutes, real urgency inside one.
  const urgency = remaining <= 60 ? 'critical' : remaining <= 300 ? 'warning' : 'normal';

  const goTo = useCallback(
    (index) => {
      setCurrent(index);
      setPaletteOpen(false);
      // A new question should start at its stem, not wherever the last one was scrolled to.
      scrollRef.current?.scrollTo({ top: 0, behavior: 'auto' });
    },
    [],
  );

  const next = useCallback(() => {
    if (current < total - 1) goTo(current + 1);
    else setReviewOpen(true);
  }, [current, total, goTo]);

  const prev = useCallback(() => {
    if (current > 0) goTo(current - 1);
  }, [current, goTo]);

  // Non-blocking notices: a modal alert() during a timed exam steals focus and burns seconds.
  const flash = useCallback((message, tone = 'warning') => {
    setNotice({ message, tone });
    window.clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = window.setTimeout(() => setNotice(null), 5000);
  }, []);

  useEffect(() => () => window.clearTimeout(noticeTimerRef.current), []);

  useEffect(() => {
    // Record the moment they leave (so a student who never returns is still counted),
    // but hold the message until they are back and can actually read it.
    const onVisibility = async () => {
      if (document.visibilityState === 'visible') {
        if (pendingStrikeRef.current) {
          const held = pendingStrikeRef.current;
          pendingStrikeRef.current = null;
          if (held.submitted) navigate(`/exam/${id}/result`, { replace: true });
          else flash(held.message, 'danger');
        }
        return;
      }
      if (submittingRef.current) return;
      try {
        const result = await examApi.recordStrike(id);
        if (result.status === 'submitted') {
          pendingStrikeRef.current = { submitted: true };
        } else if (result.strikes) {
          pendingStrikeRef.current = {
            message: `Stay on this tab. Strike ${result.strikes} of 3.`,
          };
        }
        // Already back? Drain it now, since the visible-branch has been and gone.
        if (document.visibilityState === 'visible' && pendingStrikeRef.current) {
          const held = pendingStrikeRef.current;
          pendingStrikeRef.current = null;
          if (held.submitted) navigate(`/exam/${id}/result`, { replace: true });
          else flash(held.message, 'danger');
        }
      } catch (err) {
        console.error('Strike Error:', err);
      }
    };

    const onReturn = onVisibility;
    const handleContextMenu = (e) => e.preventDefault();
    const handleCopy = (e) => {
      e.preventDefault();
      flash('Copying is disabled during exams.');
    };
    const handleBeforeUnload = (e) => {
      if (submittingRef.current) return;
      e.preventDefault();
      e.returnValue = '';
    };

    document.addEventListener('visibilitychange', onReturn);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopy);
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      document.removeEventListener('visibilitychange', onReturn);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopy);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [id, navigate, flash]);

  // JAMB keys, so practice muscle memory transfers to the real hall:
  // A-F pick, N next, P previous, R clears, M flags, S submits.
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (reviewOpen || paletteOpen || submitting) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target;
      if (target instanceof HTMLElement && target.closest('input, textarea, [contenteditable]')) {
        return;
      }
      const key = e.key.toLowerCase();
      const q = questions[current];
      if (!q) return;

      if (key >= 'a' && key <= 'f') {
        const index = key.charCodeAt(0) - 97;
        if (index < q.options.length) persist(current, { selectedOption: index });
        return;
      }
      if (key === 'n' || key === 'arrowright') return next();
      if (key === 'p' || key === 'arrowleft') return prev();
      if (key === 'r') return persist(current, { selectedOption: null });
      if (key === 'm') return persist(current, { markedForReview: !answers[current]?.markedForReview });
      if (key === 's') return setReviewOpen(true);
      if (key === 'enter') return next();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [current, questions, answers, reviewOpen, paletteOpen, submitting, persist, next, prev]);

  if (!question) return null;

  const progressPct = total ? (answeredCount / total) * 100 : 0;

  const timer = (
    <div
      role="timer"
      aria-live="off"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-bold tabular-nums',
        urgency === 'critical' && 'border-danger/40 bg-danger/10 text-danger',
        urgency === 'warning' && 'border-warning/40 bg-warning/10 text-warning',
        urgency === 'normal' && 'border-border bg-surface text-foreground-strong',
      )}
    >
      <Clock size={15} aria-hidden="true" />
      <span className="sr-only">Time remaining </span>
      {formatTime(remaining)}
    </div>
  );

  return (
    // Fixed rather than 100svh: the exam is a full-screen takeover, and this keeps it
    // immune to whatever height the surrounding layout chain contributes.
    <div className="fixed inset-0 z-40 flex flex-col bg-background">
      {/* Fixed top: the timer and progress must never scroll out of reach. */}
      <header className="shrink-0 border-b border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          {/*
            Leave. The exam was a trap without this: the only exits were
            submitting (which scores every unanswered question wrong) or the
            browser's back gesture, which is not discoverable and on iOS is an
            edge swipe a student may never try.
          */}
          <button
            type="button"
            onClick={() => setExitOpen(true)}
            aria-label="Leave this paper"
            className="tf-pressable -ml-2 flex size-10 shrink-0 items-center justify-center rounded-full text-muted active:bg-surface-strong active:text-foreground-strong"
          >
            <ChevronLeft size={20} aria-hidden="true" />
          </button>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
              {session.subjectCode}
            </p>
            <p className="text-sm font-bold text-foreground-strong">
              Question {current + 1}
              <span className="text-muted"> / {total}</span>
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {timer}
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-surface px-3 text-sm font-bold tabular-nums text-foreground-strong transition-colors hover:bg-surface-strong lg:hidden"
            >
              <LayoutGrid size={15} aria-hidden="true" />
              {answeredCount}/{total}
            </button>
          </div>
        </div>
        <div
          className="h-1 w-full bg-surface-strong"
          role="progressbar"
          aria-valuenow={answeredCount}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-label="Questions answered"
        >
          <div
            className="h-full bg-primary transition-[width] duration-300 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </header>

      {notice && (
        <div
          role="status"
          className={cn(
            'shrink-0 px-4 py-2 text-center text-xs font-semibold sm:px-6',
            notice.tone === 'danger' ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning',
          )}
        >
          <AlertTriangle size={13} className="mr-1.5 inline" aria-hidden="true" />
          {notice.message}
        </div>
      )}

      {submitting && <SubmitSuspense phase={submitPhase} />}

      {/*
        Leave confirmation.

        Leaving does NOT submit. Answers are already persisted per-question, the
        session stays open, and it reappears under "Unfinished" on the dashboard.

        The one thing this must not do is imply the exam is paused. The deadline
        lives on the server as `expiresAt` and keeps running whether the app is
        open or not, so the sheet says so plainly. A student who came back to a
        submitted paper because we let them assume the clock stopped would have
        every right to be furious.
      */}
      <Modal
        open={exitOpen}
        onOpenChange={setExitOpen}
        title="Leave this paper?"
        description="Your answers so far are saved. You can pick it up from the dashboard."
        footer={
          <>
            <Button variant="ghost" size="lg" onClick={() => setExitOpen(false)}>
              Keep going
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-danger"
              onClick={() => navigate('/dashboard')}
            >
              Leave
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-3 rounded-xl border border-warning/20 bg-warning/5 p-3.5">
          <Clock size={16} className="mt-0.5 shrink-0 text-score-mid" aria-hidden="true" />
          <p className="text-[13px] leading-relaxed text-foreground/80">
            The timer keeps running while you are away. {formatTime(remaining)} left, and the
            paper submits itself when it reaches zero.
          </p>
        </div>
      </Modal>

      {/* Only this middle band scrolls. */}
      <div className="flex min-h-0 flex-1">
        <main ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:grid lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-10 lg:py-8">
            <div className="min-w-0">
              <MathText className="font-display text-lg font-bold leading-relaxed tracking-tight text-foreground-strong sm:text-xl lg:text-2xl">
                {question.stem}
              </MathText>

              <fieldset className="mt-6 flex flex-col gap-2.5">
                <legend className="sr-only">Select your answer</legend>
                {question.options.map((option, index) => {
                  const selected = answer?.selectedOption === index;
                  return (
                    <label
                      key={index}
                      className={cn(
                        'group flex cursor-pointer items-start gap-3 rounded-2xl border p-3.5 transition-colors sm:p-4',
                        'focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-background',
                        selected
                          ? 'border-primary bg-primary/5'
                          : 'border-border bg-surface hover:border-border-strong hover:bg-surface-strong',
                      )}
                    >
                      <input
                        type="radio"
                        name={`question-${current}`}
                        className="sr-only"
                        checked={selected}
                        onChange={() => persist(current, { selectedOption: index })}
                      />
                      <span
                        className={cn(
                          'mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg border text-xs font-black transition-colors',
                          selected
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border text-muted group-hover:border-border-strong',
                        )}
                        aria-hidden="true"
                      >
                        {letter(index)}
                      </span>
                      <MathText
                        className={cn(
                          'min-w-0 flex-1 text-base leading-relaxed',
                          selected ? 'font-semibold text-foreground-strong' : 'text-foreground',
                        )}
                      >
                        {option}
                      </MathText>
                      {selected && (
                        <Check size={18} className="mt-1 shrink-0 text-primary" aria-hidden="true" />
                      )}
                    </label>
                  );
                })}
              </fieldset>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => persist(current, { markedForReview: !answer?.markedForReview })}
                  aria-pressed={Boolean(answer?.markedForReview)}
                  className={cn(
                    'inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-bold transition-colors',
                    answer?.markedForReview
                      ? 'bg-warning/15 text-warning'
                      : 'text-muted hover:bg-surface-strong hover:text-foreground',
                  )}
                >
                  <Flag
                    size={15}
                    className={answer?.markedForReview ? 'fill-current' : ''}
                    aria-hidden="true"
                  />
                  {answer?.markedForReview ? 'Flagged' : 'Flag for review'}
                </button>

                {answer?.selectedOption !== null && (
                  <button
                    type="button"
                    onClick={() => persist(current, { selectedOption: null })}
                    className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-muted transition-colors hover:bg-surface-strong hover:text-foreground"
                  >
                    <X size={15} aria-hidden="true" />
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Desktop navigator, in-flow so it scrolls with the question. */}
            <aside className="hidden lg:block">
              <div className="rounded-2xl border border-border bg-surface p-5">
                <div className="mb-4 flex items-baseline justify-between">
                  <h2 className="text-xs font-black uppercase tracking-widest text-muted">
                    Navigator
                  </h2>
                  <span className="text-xs font-bold tabular-nums text-primary">
                    {answeredCount}/{total}
                  </span>
                </div>
                <QuestionGrid
                  questions={questions}
                  answers={answers}
                  current={current}
                  onJump={goTo}
                />
                <div className="mt-5 border-t border-border pt-4">
                  <Legend />
                </div>
                <Button className="mt-5 w-full" onClick={() => setReviewOpen(true)}>
                  Review &amp; submit
                </Button>
              </div>

              <p className="mt-4 flex items-start gap-2 px-1 text-xs leading-relaxed text-muted">
                <Keyboard size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
                <span>
                  <b className="text-foreground">A–F</b> answer · <b className="text-foreground">N</b>/
                  <b className="text-foreground">P</b> move · <b className="text-foreground">M</b> flag ·{' '}
                  <b className="text-foreground">R</b> clear · <b className="text-foreground">S</b> submit
                </span>
              </p>
            </aside>
          </div>
        </main>
      </div>

      {/* Fixed bottom, clear of the iOS home indicator. */}
      <footer className="shrink-0 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-end gap-2.5 px-4 py-3 sm:px-6">
          <Button
            variant="outline"
            onClick={prev}
            disabled={current === 0}
            className="h-12 w-12 shrink-0 rounded-xl p-0 lg:mr-auto"
            aria-label="Previous question"
          >
            <ChevronLeft size={20} aria-hidden="true" />
          </Button>

          {current === total - 1 ? (
            <Button onClick={() => setReviewOpen(true)} className="h-12 flex-1 rounded-xl text-base lg:flex-none lg:px-10">
              Review &amp; submit
            </Button>
          ) : (
            <Button onClick={next} className="h-12 flex-1 rounded-xl text-base lg:flex-none lg:px-12">
              Next
              <ChevronRight size={18} className="ml-1" aria-hidden="true" />
            </Button>
          )}
        </div>
      </footer>

      <Modal
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        title="Questions"
        description={`${answeredCount} answered · ${flaggedCount} flagged · ${unanswered.length} left`}
      >
        <div className="space-y-4 pt-1">
          <QuestionGrid
            questions={questions}
            answers={answers}
            current={current}
            onJump={goTo}
          />
          <Legend />
        </div>
      </Modal>

      <Modal
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        title="Before you submit"
        description={
          unanswered.length
            ? `${unanswered.length} question${unanswered.length === 1 ? '' : 's'} still unanswered.`
            : 'Every question has an answer.'
        }
        footer={
          <>
            <Button variant="ghost" onClick={() => setReviewOpen(false)}>
              Keep working
            </Button>
            <Button loading={submitting} onClick={submit} className="px-6">
              Submit
            </Button>
          </>
        }
      >
        <div className="space-y-4 pt-1">
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { label: 'Answered', value: answeredCount, tone: 'text-primary' },
              { label: 'Flagged', value: flaggedCount, tone: 'text-warning' },
              { label: 'Blank', value: unanswered.length, tone: 'text-muted' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-border bg-surface px-2 py-3">
                <p className={cn('text-2xl font-extrabold tabular-nums', stat.tone)}>{stat.value}</p>
                <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Jumping straight to a gap is the whole point of a review step. */}
          {unanswered.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">
                Jump to a blank question
              </p>
              <div className="flex flex-wrap gap-2">
                {unanswered.map((index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      setReviewOpen(false);
                      goTo(index);
                    }}
                    className="h-9 min-w-9 rounded-lg border border-border bg-surface px-2.5 text-sm font-bold tabular-nums text-foreground-strong transition-colors hover:border-primary hover:text-primary"
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className="rounded-xl bg-danger/5 p-3 text-xs leading-relaxed text-danger">
            Submitting is final. Unanswered questions are scored as incorrect.
          </p>
        </div>
      </Modal>
    </div>
  );
}

function ExamRuntimePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    data: session,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['examSession', id],
    queryFn: () => examApi.get(id),
    staleTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (session?.status === 'submitted') {
      navigate(`/exam/${id}/result`, { replace: true });
    }
  }, [session?.status, id, navigate]);

  if (isLoading) return <PageLoader label="Preparing your exam" />;

  if (isError) {
    return (
      <div className="mx-auto w-full max-w-xl px-5 py-20">
        <Alert variant="danger" className="rounded-2xl">
          {error?.message ?? 'This exam could not be loaded.'}
        </Alert>
        <Button variant="outline" className="mt-6 w-full" onClick={() => navigate('/dashboard')}>
          Back to dashboard
        </Button>
      </div>
    );
  }

  if (!session || session.status !== 'in_progress') return <PageLoader />;

  if (!session.questions?.length) {
    return (
      <div className="mx-auto w-full max-w-xl px-5 py-20 text-center">
        <h1 className="text-xl font-bold text-foreground-strong">No questions yet</h1>
        <p className="mt-2 text-sm text-muted">This subject bank is currently empty.</p>
        <Button className="mt-8 w-full" onClick={() => navigate('/dashboard')}>
          Back to dashboard
        </Button>
      </div>
    );
  }

  return <ExamRuntime key={session.id || id} session={session} />;
}

export default ExamRuntimePage;

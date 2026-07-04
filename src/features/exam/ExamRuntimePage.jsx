import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Clock, Flag, LayoutGrid, CheckCircle2 } from 'lucide-react';
import { Alert, Button, Modal, Card } from '../../components/ui/index.js';
import PageLoader from '../../components/PageLoader.jsx';
import { cn } from '../../utils/cn.js';
import { examApi } from './api.js';
import { useCountdown } from './useCountdown.js';
import { formatTime } from './formatTime.js';

const letter = (index) => String.fromCharCode(65 + index);

function ExamRuntime({ session }) {
  const navigate = useNavigate();
  const id = session.id;
  const questions = session.questions;
  const total = questions.length;

  const [answers, setAnswers] = useState(() =>
    questions.map((question) => ({
      selectedOption: question.selectedOption ?? null,
      markedForReview: Boolean(question.markedForReview),
    })),
  );
  const [current, setCurrent] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);

  const submit = async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    try {
      await examApi.submit(id);
    } catch {
      // The result view finalizes/reads authoritatively, so navigate regardless.
    }
    navigate(`/exam/${id}/result`, { replace: true });
  };

  const remaining = useCountdown(session.expiresAt, submit);

  // Anti-Cheating & Integrity Protection
  useEffect(() => {
    // 1. Focus Detection
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'hidden') {
        try {
          const result = await examApi.recordStrike(id);
          if (result.status === 'submitted') {
            alert('Integrity Violation: Exam auto-submitted due to multiple tab switches.');
            navigate(`/exam/${id}/result`, { replace: true });
          } else {
            alert(`Integrity Warning: Please stay on this tab. Strike ${result.strikes}/3`);
          }
        } catch (err) {
          console.error('Strike Error:', err);
        }
      }
    };

    // 2. Prevent Right-Click
    const handleContextMenu = (e) => e.preventDefault();

    // 3. Prevent Copy-Paste
    const handleCopy = (e) => {
      e.preventDefault();
      alert('Content protection enabled: copying is disabled during exams.');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopy);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopy);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (confirmOpen || paletteOpen || submitting) return;
      const key = e.key.toLowerCase();
      if (key >= 'a' && key <= 'f') {
        const index = key.charCodeAt(0) - 97;
        if (index < question.options.length) persist(current, { selectedOption: index });
      }
      if (key === 'arrowright') if (current < total - 1) setCurrent(c => c + 1);
      if (key === 'arrowleft') if (current > 0) setCurrent(c => c - 1);
      if (key === 'm') persist(current, { markedForReview: !answer.markedForReview });
      if (key === 'enter') {
        if (current === total - 1) setConfirmOpen(true);
        else setCurrent(c => c + 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [current, questions.length, confirmOpen, paletteOpen, submitting]);

  const persist = (index, patch) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
    examApi.saveAnswer(id, { questionIndex: index, ...patch }).catch(() => {});
  };

  const answeredCount = answers.filter((answer) => answer.selectedOption !== null).length;
  const question = questions[current];
  const answer = answers[current];
  const lowTime = remaining <= 60;

  const jumpTo = (index) => {
    setCurrent(index);
    setPaletteOpen(false);
  };

  const paletteGrid = (
    <div className="grid grid-cols-5 gap-2.5">
      {questions.map((_, index) => {
        const state = answers[index].markedForReview
          ? 'marked'
          : answers[index].selectedOption !== null
            ? 'answered'
            : 'unanswered';
        return (
          <button
            key={index}
            type="button"
            onClick={() => jumpTo(index)}
            className={cn(
              'flex h-11 items-center justify-center rounded-xl border text-sm font-bold tabular-nums transition-all',
              index === current && 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-105',
              state === 'answered' && 'border-primary bg-primary/10 text-primary shadow-sm shadow-primary/5',
              state === 'marked' && 'border-warning bg-warning/10 text-warning',
              state === 'unanswered' && 'border-border bg-surface text-muted hover:border-border-strong',
            )}
          >
            {index + 1}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="mx-auto flex w-full max-w-xl lg:max-w-6xl flex-1 flex-col px-5 py-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex flex-col">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted leading-none mb-1">
            {session.subjectCode} &bull; Attempt Mode
          </span>
          <h2 className="text-sm font-bold text-foreground-strong">Question {current + 1} of {total}</h2>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={cn(
              'inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-black tabular-nums transition-colors',
              lowTime
                ? 'border-danger/30 bg-danger/10 text-danger animate-pulse'
                : 'border-border bg-surface text-foreground-strong shadow-sm',
            )}
          >
            <Clock size={16} className={lowTime ? "text-danger" : "text-primary"} />
            <span aria-label={`Time remaining: ${formatTime(remaining)}`}>
              {formatTime(remaining)}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPaletteOpen(true)}
            leadingIcon={<LayoutGrid size={16} />}
            className="lg:hidden rounded-xl h-10"
          >
            {answeredCount}/{total}
          </Button>
        </div>
      </div>

      {/* Progress Line */}
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-surface-strong mb-10"
        role="progressbar"
        aria-valuenow={answeredCount}
        aria-valuemin={0}
        aria-valuemax={total}
      >
        <div
          className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${total ? (answeredCount / total) * 100 : 0}%` }}
        />
      </div>

      {/* Main Content Area */}
      <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-16 lg:items-start flex-1">
        <div className="flex flex-col min-h-[400px]">
          <h1 className="text-xl font-bold leading-relaxed text-foreground-strong lg:text-2xl tracking-tight">
            {question.stem}
          </h1>

          <fieldset className="mt-8 flex flex-col gap-3">
            <legend className="sr-only">Select your answer</legend>
            {question.options.map((option, index) => {
              const selected = answer.selectedOption === index;
              return (
                <label
                  key={index}
                  className={cn(
                    'group flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition-all duration-200',
                    selected
                      ? 'border-primary bg-primary/5 shadow-sm shadow-primary/5'
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
                      'flex size-8 shrink-0 items-center justify-center rounded-xl border text-xs font-black transition-colors',
                      selected
                        ? 'border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                        : 'border-border text-muted group-hover:border-border-strong group-hover:text-foreground-strong',
                    )}
                  >
                    {letter(index)}
                  </span>
                  <span className={cn(
                    "text-sm lg:text-base font-medium transition-colors",
                    selected ? "text-foreground-strong font-bold" : "text-foreground"
                  )}>
                    {option}
                  </span>
                  {selected && <CheckCircle2 size={18} className="ml-auto text-primary" />}
                </label>
              );
            })}
          </fieldset>

          <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
             <button
              type="button"
              onClick={() => persist(current, { markedForReview: !answer.markedForReview })}
              aria-pressed={answer.markedForReview}
              className={cn(
                'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all',
                answer.markedForReview
                  ? 'bg-warning/10 text-warning'
                  : 'text-muted hover:text-foreground hover:bg-surface-strong',
              )}
            >
              <Flag size={16} className={answer.markedForReview ? "fill-warning" : ""} />
              {answer.markedForReview ? 'Marked for Review' : 'Mark for Review'}
            </button>

            <div className="hidden lg:flex items-center gap-3">
              <Button
                variant="ghost"
                disabled={current === 0}
                onClick={() => setCurrent(c => c - 1)}
                className="rounded-xl"
              >
                Previous
              </Button>
              {current === total - 1 ? (
                <Button onClick={() => setConfirmOpen(true)} className="rounded-xl px-8 shadow-lg shadow-primary/20">
                  Submit Exam
                </Button>
              ) : (
                <Button onClick={() => setCurrent(c => c + 1)} className="rounded-xl px-8 shadow-lg shadow-primary/10">
                  Next Question
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Sidebar */}
        <aside className="hidden lg:block sticky top-24">
          <Card raised className="p-6 border-primary/10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-muted">Question Navigator</h3>
              <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                {answeredCount}/{total} Complete
              </span>
            </div>
            {paletteGrid}
            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-2 text-[10px] font-bold text-muted uppercase tracking-tighter">
                <div className="size-2 rounded-full bg-primary" /> Answered
                <div className="size-2 rounded-full bg-warning ml-2" /> Marked
                <div className="size-2 rounded-full bg-border ml-2" /> Unvisited
              </div>
              <Button
                className="w-full mt-4 rounded-xl py-6 text-base shadow-xl shadow-primary/15"
                onClick={() => setConfirmOpen(true)}
              >
                Finish Exam
              </Button>
            </div>
          </Card>

          <div className="mt-6 px-4 py-3 rounded-2xl bg-surface-strong border border-border flex items-center gap-3">
             <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <LayoutGrid size={14} />
             </div>
             <div>
                <p className="text-[10px] font-bold text-muted uppercase tracking-tighter leading-tight">Keyboard Enabled</p>
                <p className="text-[9px] text-muted leading-tight">Use A-D keys to answer faster.</p>
             </div>
          </div>
        </aside>
      </div>

      {/* Mobile Footer Navigation */}
      <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4 lg:hidden">
        <Button
          variant="outline"
          size="md"
          disabled={current === 0}
          onClick={() => setCurrent((value) => Math.max(0, value - 1))}
          className="rounded-xl"
        >
          <ChevronLeft size={20} />
        </Button>
        {current === total - 1 ? (
          <Button size="md" onClick={() => setConfirmOpen(true)} className="flex-1 rounded-xl font-bold shadow-lg shadow-primary/20">
            Submit
          </Button>
        ) : (
          <Button
            variant="secondary"
            size="md"
            onClick={() => setCurrent((value) => Math.min(total - 1, value + 1))}
            className="flex-1 rounded-xl font-bold"
          >
            Next Question
            <ChevronRight size={20} className="ml-1" />
          </Button>
        )}
      </div>

      <Modal
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        title="Navigator"
        description={`${answeredCount} of ${total} questions answered`}
      >
        <div className="pt-2">{paletteGrid}</div>
      </Modal>

      <Modal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Finalize Attempt?"
        description={
          answeredCount < total
            ? `You've left ${total - answeredCount} questions unanswered. These will be marked as incorrect.`
            : "You've completed all questions. Would you like to submit now?"
        }
        footer={
          <>
            <Button variant="ghost" size="md" onClick={() => setConfirmOpen(false)}>
              Back to Exam
            </Button>
            <Button size="md" loading={submitting} onClick={submit} className="px-8 shadow-lg shadow-primary/20">
              Submit & Grade
            </Button>
          </>
        }
      >
        <div className="rounded-xl bg-danger/5 p-4 border border-danger/10">
           <p className="text-xs font-medium text-danger leading-relaxed">
             Warning: This action is permanent. You will not be able to return to this attempt once you submit.
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

  if (isLoading) {
    return <PageLoader label="Preparing Exam Environment" />;
  }
  if (isError) {
    return (
      <div className="mx-auto w-full max-w-xl px-5 py-20">
        <Alert variant="danger" className="rounded-2xl">{error?.message ?? 'This exam could not be loaded.'}</Alert>
        <Button variant="outline" className="mt-6 w-full rounded-xl" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }
  if (!session || session.status !== 'in_progress') {
    return <PageLoader />;
  }

  if (!session.questions?.length) {
    return (
      <div className="mx-auto w-full max-w-xl px-5 py-20 text-center">
        <h3 className="text-xl font-bold text-foreground-strong">No Questions Found</h3>
        <p className="mt-2 text-muted text-sm">This subject bank is currently empty.</p>
        <Button variant="primary" className="mt-8 w-full rounded-xl" onClick={() => navigate('/dashboard')}>
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return <ExamRuntime key={session.id || id} session={session} />;
}

export default ExamRuntimePage;

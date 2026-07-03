import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Clock, Flag, LayoutGrid } from 'lucide-react';
import { Alert, Button, Modal } from '../../components/ui/index.js';
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
    <div className="grid grid-cols-5 gap-2">
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
              'flex h-10 items-center justify-center rounded-md border text-sm font-medium tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              index === current && 'ring-2 ring-primary ring-offset-1 ring-offset-background',
              state === 'answered' && 'border-primary bg-primary/10 text-primary',
              state === 'marked' && 'border-warning bg-warning/10 text-warning',
              state === 'unanswered' && 'border-border bg-surface text-muted',
            )}
          >
            {index + 1}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="mx-auto flex w-full max-w-xl lg:max-w-5xl flex-1 flex-col px-5 py-6">
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-sm font-medium text-muted">{session.subjectCode}</span>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold tabular-nums',
              lowTime
                ? 'border-danger/30 bg-danger/10 text-danger'
                : 'border-border bg-surface text-foreground-strong',
            )}
          >
            <Clock size={15} aria-hidden="true" />
            <span aria-label={`Time remaining: ${formatTime(remaining)}`}>
              {formatTime(remaining)}
            </span>
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPaletteOpen(true)}
            leadingIcon={<LayoutGrid size={16} aria-hidden="true" />}
            className="lg:hidden"
          >
            {answeredCount}/{total}
          </Button>
        </div>
      </div>

      <div
        className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-surface-strong"
        role="progressbar"
        aria-valuenow={answeredCount}
        aria-valuemin={0}
        aria-valuemax={total}
      >
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${total ? (answeredCount / total) * 100 : 0}%` }}
        />
      </div>

      <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-12 lg:items-start mt-6 flex-1">
        <div className="flex flex-col h-full">
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-muted">
            Question {current + 1} of {total}
          </p>
          <h1 className="mt-2 text-lg font-semibold leading-relaxed text-foreground-strong lg:text-xl">
            {question.stem}
          </h1>

          <fieldset className="mt-5 flex flex-col gap-2.5">
            <legend className="sr-only">Select your answer</legend>
            {question.options.map((option, index) => {
              const selected = answer.selectedOption === index;
              return (
                <label
                  key={index}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-lg border p-3.5 transition-colors',
                    selected
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-surface hover:border-border-strong',
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
                      'flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold',
                      selected
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border-strong text-muted',
                    )}
                  >
                    {letter(index)}
                  </span>
                  <span className="text-sm text-foreground-strong lg:text-base">{option}</span>
                </label>
              );
            })}
          </fieldset>

          <button
            type="button"
            onClick={() => persist(current, { markedForReview: !answer.markedForReview })}
            aria-pressed={answer.markedForReview}
            className={cn(
              'mt-4 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              answer.markedForReview ? 'text-warning' : 'text-muted hover:text-foreground',
            )}
          >
            <Flag size={15} aria-hidden="true" />
            {answer.markedForReview ? 'Marked for review' : 'Mark for review'}
          </button>
        </div>

        <aside className="hidden lg:flex flex-col gap-4 sticky top-24">
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-foreground-strong uppercase tracking-wider">Questions</h2>
              <span className="text-xs font-medium text-muted">{answeredCount} of {total}</span>
            </div>
            {paletteGrid}
            <Button
              className="w-full mt-6"
              onClick={() => setConfirmOpen(true)}
            >
              Submit Exam
            </Button>
          </div>
        </aside>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-4 lg:w-full lg:max-w-xl">
        <Button
          variant="outline"
          size="sm"
          disabled={current === 0}
          onClick={() => setCurrent((value) => Math.max(0, value - 1))}
          leadingIcon={<ChevronLeft size={16} aria-hidden="true" />}
        >
          Prev
        </Button>
        {current === total - 1 ? (
          <Button size="sm" onClick={() => setConfirmOpen(true)} className="lg:hidden">
            Submit exam
          </Button>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCurrent((value) => Math.min(total - 1, value + 1))}
            trailingIcon={<ChevronRight size={16} aria-hidden="true" />}
          >
            Next
          </Button>
        )}
      </div>

      <Modal
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        title="Questions"
        description={`${answeredCount} of ${total} answered`}
      >
        {paletteGrid}
      </Modal>

      <Modal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Submit exam?"
        description={
          answeredCount < total
            ? `You have answered ${answeredCount} of ${total}. Unanswered questions are marked wrong.`
            : 'You have answered every question.'
        }
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setConfirmOpen(false)}>
              Keep going
            </Button>
            <Button size="sm" loading={submitting} onClick={submit}>
              Submit
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted">Once you submit, you cannot change your answers.</p>
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
    return <PageLoader label="Loading your exam" />;
  }
  if (isError) {
    return (
      <div className="mx-auto w-full max-w-xl px-5 py-10">
        <Alert variant="danger">{error?.message ?? 'This exam could not be loaded.'}</Alert>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/dashboard')}>
          Back to dashboard
        </Button>
      </div>
    );
  }
  if (!session || session.status !== 'in_progress') {
    return <PageLoader />;
  }

  if (!session.questions?.length) {
    return (
      <div className="mx-auto w-full max-w-xl px-5 py-10">
        <Alert variant="danger">This exam session has no questions. Please try starting a new one.</Alert>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/dashboard')}>
          Back to dashboard
        </Button>
      </div>
    );
  }

  return <ExamRuntime key={session.id || id} session={session} />;
}

export default ExamRuntimePage;

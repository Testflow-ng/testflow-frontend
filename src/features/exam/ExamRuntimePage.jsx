import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Calculator as CalcIcon,
  ChevronLeft,
  ChevronRight,
  Keyboard,
  LayoutGrid,
  ShieldAlert,
  X,
} from 'lucide-react';
import {
  Alert,
  Badge,
  Button,
  Card,
  ConfirmDialog,
  IconButton,
  KeyValueList,
  Modal,
  ProgressBar,
  Tabs,
  TabPanel,
} from '../../components/ui/index.js';
import ExamTimer from '../../components/exam/ExamTimer.jsx';
import OptionRow from '../../components/exam/OptionRow.jsx';
import QuestionCard from '../../components/exam/QuestionCard.jsx';
import QuestionNavigator from '../../components/exam/QuestionNavigator.jsx';
import PageLoader from '../../components/PageLoader.jsx';
import { examApi } from './api.js';
import ReportQuestionDialog from './ReportQuestionDialog.jsx';
import { useBookmarkedIds, useToggleBookmark } from '../bookmarks/useBookmarks.js';
import { useCountdown } from './useCountdown.js';
import SubmitSuspense from './SubmitSuspense.jsx';
import { formatTime } from './formatTime.js';
import Calculator from '../post-utme/components/Calculator.jsx';
import apiClient from '../../api/client.js';

const letter = (index) => String.fromCharCode(65 + index);

/**
 * The paper itself.
 *
 * This is the one screen in the app that owns real state a student is betting
 * marks on, so it stays deliberately conservative: every answer is persisted the
 * moment it is chosen, the deadline on `session.expiresAt` is the authority (the
 * client clock is only a courtesy), and the loudest thing on the screen is the
 * question.
 *
 * The interface is assembled from the shared exam components (`QuestionCard`,
 * `OptionRow`, `QuestionNavigator`, `ExamTimer`) and the UI kit. Those are
 * presentational by design: nothing about answers, timing or scoring lives
 * inside them, and none of it moved here.
 */
function ExamRuntime({ session }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isPostUtme = searchParams.get('type') === 'post-utme';

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
  const [calcOpen, setCalcOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitPhase, setSubmitPhase] = useState('marking');
  const [exitOpen, setExitOpen] = useState(false);
  const [notice, setNotice] = useState(null);
  const [strikes, setStrikes] = useState(session.strikes || 0);
  const [reportFor, setReportFor] = useState(null);
  const reportOpen = Boolean(reportFor);

  const saveUrl = isPostUtme ? `/api/post-utme/${id}/answer` : null;

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

      if (isPostUtme) {
        apiClient.patch(saveUrl, { questionIndex: index, ...patch }).catch(() => {});
      } else {
        examApi.saveAnswer(id, { questionIndex: index, ...patch }).catch(() => {});
      }
    },
    [id, isPostUtme, saveUrl],
  );

  const submit = useCallback(async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    setSubmitPhase('marking');

    const stepA = setTimeout(() => setSubmitPhase('tallying'), 700);
    const stepB = setTimeout(() => setSubmitPhase('ready'), 1300);
    const floor = new Promise((resolve) => setTimeout(resolve, 1700));

    try {
      if (isPostUtme) {
        await Promise.all([apiClient.post(`/api/post-utme/${id}/submit`), floor]);
      } else {
        await Promise.all([examApi.submit(id), floor]);
      }
    } catch (err) {
      console.error('Submission Error:', err);
    } finally {
      clearTimeout(stepA);
      clearTimeout(stepB);
    }

    navigate(`/exam/${id}/result${isPostUtme ? '?type=post-utme' : ''}`, { replace: true });
  }, [id, navigate, isPostUtme]);

  const remaining = useCountdown(session.expiresAt, submit);

  const answeredCount = answers.filter((a) => a.selectedOption !== null).length;
  const flaggedCount = answers.filter((a) => a.markedForReview).length;
  const unanswered = answers
    .map((a, i) => (a.selectedOption === null ? i : null))
    .filter((i) => i !== null);

  /* The navigator speaks in 1-based question numbers; the runtime indexes from zero. */
  const answeredSet = useMemo(
    () => new Set(answers.flatMap((a, i) => (a.selectedOption !== null ? [i + 1] : []))),
    [answers],
  );
  const flaggedSet = useMemo(
    () => new Set(answers.flatMap((a, i) => (a.markedForReview ? [i + 1] : []))),
    [answers],
  );

  const question = questions[current];
  const answer = answers[current];

  // Post-UTME runs several subjects in one paper, so it needs its own strip.
  const subjects = useMemo(() => {
    if (!isPostUtme) return [];
    const map = new Map();
    questions.forEach((q, i) => {
      if (!map.has(q.subject)) map.set(q.subject, { id: q.subject, questions: [] });
      map.get(q.subject).questions.push(i);
    });
    return Array.from(map.values());
  }, [isPostUtme, questions]);

  const currentSubject = subjects.find((s) => s.questions.includes(current))?.id ?? subjects[0]?.id;

  /* The paper needs a calculator and a ruler as much as a hall does. A subject can opt
     out (a mental-arithmetic paper does), but the default is that one is available. */
  const showCalculator = session.allowCalculator !== false;

  /*
    Saving a question and reporting one are about the *question*, not the sitting: both are
    read from their own queries, and neither travels in the session payload. The bookmark set
    is shared with the profile page, so a question saved here is already there.
  */
  const bookmarkedIds = useBookmarkedIds();
  const toggleBookmark = useToggleBookmark();

  /** What the bookmarks list needs to draw a row before the server answers. */
  const bookmarkPayload = (q) => ({
    id: q.id,
    subjectCode: session.subjectCode,
    stem: q.stem,
    /* Copied, not aliased: this object goes into the react-query cache, and it has no
       business holding a reference into the session the exam is still editing. */
    options: [...q.options],
    topic: q.topic ?? null,
  });

  const goTo = useCallback((index) => {
    setCurrent(index);
    setPaletteOpen(false);
    // A new question should start at its stem, not wherever the last one was scrolled to.
    scrollRef.current?.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

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
        const result = isPostUtme
          ? (await apiClient.post(`/api/post-utme/${id}/strike`)).data
          : await examApi.recordStrike(id);

        if (result.status === 'submitted') {
          pendingStrikeRef.current = { submitted: true };
        } else if (result.strikes) {
          setStrikes(result.strikes);
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
  }, [id, navigate, flash, isPostUtme]);

  // JAMB keys, so practice muscle memory transfers to the real hall:
  // A-F pick, N next, P previous, R clears, M flags, S submits.
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (reviewOpen || paletteOpen || reportOpen || submitting) return;
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
  }, [current, questions, answers, reviewOpen, paletteOpen, reportOpen, submitting, persist, next, prev]);

  if (!question) return null;

  const jumpTo = (number) => goTo(number - 1);

  const questionArea = (
    <>
      <QuestionCard
        number={current + 1}
        total={total}
        stem={question.stem}
        topic={question.topic}
        flagged={Boolean(answer?.markedForReview)}
        onFlag={() => persist(current, { markedForReview: !answer?.markedForReview })}
        /* Both need a question id to point at; a paper served without them simply has no
           bookmark or report affordance rather than a button that fails. */
        bookmarked={question.id ? bookmarkedIds.has(question.id) : false}
        onBookmark={
          question.id
            ? () =>
                toggleBookmark.mutate({
                  questionId: question.id,
                  question: bookmarkPayload(question),
                })
            : undefined
        }
        onReport={question.id ? () => setReportFor(question) : undefined}
      >
        {question.options.map((option, index) => (
          <OptionRow
            key={index}
            label={letter(index)}
            name={`question-${current}`}
            state={answer?.selectedOption === index ? 'selected' : 'idle'}
            onSelect={() => persist(current, { selectedOption: index })}
          >
            {option}
          </OptionRow>
        ))}
      </QuestionCard>

      {answer?.selectedOption !== null && (
        <div className="mt-3 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => persist(current, { selectedOption: null })}
            leadingIcon={<X size={15} aria-hidden="true" />}
          >
            Clear answer
          </Button>
        </div>
      )}
    </>
  );

  return (
    // Fixed rather than 100svh: the exam is a full-screen takeover, and this keeps it
    // immune to whatever height the surrounding layout chain contributes.
    <div className="fixed inset-0 z-40 flex flex-col bg-background">
      {/* Fixed top: the clock and the progress must never scroll out of reach. */}
      <header className="shrink-0 border-b border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
        <div className="mx-auto flex w-full max-w-5xl items-center gap-3 px-4 py-3 sm:px-6">
          {/*
            Leave. The exam was a trap without this: the only exits were
            submitting (which scores every unanswered question wrong) or the
            browser's back gesture, which is not discoverable and on iOS is an
            edge swipe a student may never try.
          */}
          <IconButton
            variant="ghost"
            onClick={() => setExitOpen(true)}
            aria-label="Leave this paper"
            className="-ml-2 shrink-0"
          >
            <ChevronLeft size={20} aria-hidden="true" />
          </IconButton>

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
            {isPostUtme && (
              <Badge
                variant="danger"
                className="hidden gap-1.5 py-1.5 text-[10px] font-black uppercase tracking-widest md:inline-flex"
              >
                <ShieldAlert size={12} aria-hidden="true" />
                Strict mode {strikes}/3
              </Badge>
            )}
            {showCalculator && (
              <Button
                variant={calcOpen ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setCalcOpen((open) => !open)}
                aria-pressed={calcOpen}
                leadingIcon={<CalcIcon size={15} aria-hidden="true" />}
              >
                <span className="hidden sm:inline">Calculator</span>
              </Button>
            )}
            <ExamTimer secondsLeft={remaining} totalSeconds={session.timeLimitSeconds} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPaletteOpen(true)}
              className="tabular-nums lg:hidden"
              leadingIcon={<LayoutGrid size={15} aria-hidden="true" />}
            >
              {answeredCount}/{total}
            </Button>
          </div>
        </div>

        {subjects.length > 1 && (
          <div className="no-scrollbar overflow-x-auto border-t border-border bg-surface-strong/30 px-4 py-2 sm:px-6">
            <div className="mx-auto w-full max-w-5xl">
              <Tabs
                idPrefix="paper"
                label="Paper sections"
                value={currentSubject}
                onValueChange={(value) => goTo(subjects.find((s) => s.id === value)?.questions[0] ?? 0)}
                items={subjects.map((sub, idx) => ({
                  value: sub.id,
                  label: session.subjectCodes?.[idx] || `Section ${idx + 1}`,
                  count: sub.questions.length,
                }))}
              />
            </div>
          </div>
        )}

        <div className="mx-auto w-full max-w-5xl px-4 pb-3 sm:px-6">
          <ProgressBar
            value={answeredCount}
            max={total}
            size="sm"
            label="Questions answered"
            labelHidden
          />
        </div>
      </header>

      {notice && (
        <div className="shrink-0 px-4 pb-3 sm:px-6">
          <Alert
            variant={notice.tone === 'danger' ? 'danger' : 'warning'}
            className="mx-auto max-w-5xl py-2 text-xs font-semibold"
          >
            {notice.message}
          </Alert>
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
      <ConfirmDialog
        open={exitOpen}
        onOpenChange={setExitOpen}
        title="Leave this paper?"
        description={`Your answers so far are saved and you can pick it up from the dashboard. The timer keeps running while you are away: ${formatTime(remaining)} left, and the paper submits itself at zero.`}
        confirmLabel="Leave"
        cancelLabel="Keep going"
        tone="danger"
        onConfirm={() => navigate('/dashboard')}
      />

      {/* Only this middle band scrolls. */}
      <div className="flex min-h-0 flex-1">
        <main ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:grid lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-10 lg:py-8">
            <div className="min-w-0">
              {subjects.length > 1 ? (
                <TabPanel idPrefix="paper" value={currentSubject} active={currentSubject}>
                  {questionArea}
                </TabPanel>
              ) : (
                questionArea
              )}
            </div>

            {/* Desktop navigator, in-flow so it scrolls with the question. */}
            <aside className="mt-6 hidden lg:mt-0 lg:block">
              <Card padding="md">
                <div className="mb-4 flex items-baseline justify-between">
                  <h2 className="text-xs font-black uppercase tracking-widest text-muted">Navigator</h2>
                  <span className="text-xs font-bold tabular-nums text-primary">
                    {answeredCount}/{total}
                  </span>
                </div>
                <QuestionNavigator
                  total={total}
                  current={current + 1}
                  answered={answeredSet}
                  flagged={flaggedSet}
                  onJump={jumpTo}
                />
                <Button className="mt-5 w-full" onClick={() => setReviewOpen(true)}>
                  Review &amp; submit
                </Button>
              </Card>

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
          <IconButton
            variant="outline"
            size="lg"
            onClick={prev}
            disabled={current === 0}
            aria-label="Previous question"
            className="lg:mr-auto"
          >
            <ChevronLeft size={20} aria-hidden="true" />
          </IconButton>

          {current === total - 1 ? (
            <Button size="lg" onClick={() => setReviewOpen(true)} className="flex-1 lg:flex-none lg:px-10">
              Review &amp; submit
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={next}
              trailingIcon={<ChevronRight size={18} aria-hidden="true" />}
              className="flex-1 lg:flex-none lg:px-12"
            >
              Next
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
        <div className="pb-2 pt-1">
          <QuestionNavigator
            total={total}
            current={current + 1}
            answered={answeredSet}
            flagged={flaggedSet}
            onJump={jumpTo}
          />
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
        <div className="space-y-4 pb-2 pt-1">
          <KeyValueList
            items={[
              { label: 'Answered', value: <span className="font-bold tabular-nums text-primary">{answeredCount}</span> },
              { label: 'Flagged', value: <span className="font-bold tabular-nums text-score-mid">{flaggedCount}</span> },
              { label: 'Left blank', value: <span className="font-bold tabular-nums text-muted">{unanswered.length}</span> },
            ]}
          />

          {/* Jumping straight to a gap is the whole point of a review step. */}
          {unanswered.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">
                Jump to a blank question
              </p>
              <div className="flex flex-wrap gap-2">
                {unanswered.map((index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="min-w-9 tabular-nums"
                    onClick={() => {
                      setReviewOpen(false);
                      goTo(index);
                    }}
                  >
                    {index + 1}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <Alert variant="danger" className="py-2.5 text-xs">
            Submitting is final. Unanswered questions are scored as incorrect.
          </Alert>
        </div>
      </Modal>

      {calcOpen && <Calculator onClose={() => setCalcOpen(false)} />}

      {/*
        Reporting is about the question on screen, so the dialog carries that question and
        the runtime does not care what happens inside it.
      */}
      <ReportQuestionDialog
        open={Boolean(reportFor)}
        onOpenChange={(open) => {
          if (!open) setReportFor(null);
        }}
        question={reportFor}
      />
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

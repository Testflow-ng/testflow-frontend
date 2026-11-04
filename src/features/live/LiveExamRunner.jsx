import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, ChevronLeft, ChevronRight, CloudOff, Loader2, Send } from 'lucide-react';
import { Banner, Button, ConfirmDialog, SkeletonCard, useToast } from '../../components/ui/index.js';
import QuestionCard from '../../components/exam/QuestionCard.jsx';
import OptionRow from '../../components/exam/OptionRow.jsx';
import QuestionNavigator from '../../components/exam/QuestionNavigator.jsx';
import ExamTimer from '../../components/exam/ExamTimer.jsx';
import Screen from '../../components/layout/Screen.jsx';
import { ICON } from '../../components/ui/iconProps.js';
import { liveApi } from './api.js';
import { useRemaining } from './useLive.js';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

/** How often un-synced answers, and a submit that could not get through, are retried. */
const RETRY_MS = 5000;

/*
 * The paper is handed out once, at start, and the answers live on this device first. A connection
 * that comes and goes can therefore slow the server down but never take the sitting away: each
 * choice stays in state (mirrored here so a reload does not lose it), the per-answer save is best
 * effort, and anything still un-synced rides along with the submit at the end.
 */
const storageKey = (code) => `live-cbt:${code}:answers`;

const readLocal = (code) => {
  try {
    const raw = JSON.parse(localStorage.getItem(storageKey(code)) ?? '{}');
    return raw && typeof raw === 'object' ? raw : {};
  } catch {
    return {};
  }
};

const writeLocal = (code, answers) => {
  try {
    localStorage.setItem(storageKey(code), JSON.stringify(answers));
  } catch {
    // Private mode or a full quota: the in-memory answers still carry the sitting.
  }
};

const clearLocal = (code) => {
  try {
    localStorage.removeItem(storageKey(code));
  } catch {
    // Nothing to clean up.
  }
};

/** The paper a participant sits. The server owns the clock and the scoring; this only shows and sends. */
function LiveExamRunner({ code }) {
  const qc = useQueryClient();
  const toast = useToast();
  const { data: exam, isLoading, error, refetch } = useQuery({
    queryKey: ['live', code, 'questions'],
    queryFn: () => liveApi.questions(code),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState(() => readLocal(code));
  const [flagged, setFlagged] = useState(() => new Set());
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [offline, setOffline] = useState(false);
  const [unsynced, setUnsynced] = useState(0);

  const answersRef = useRef(answers);
  const pendingRef = useRef(new Map()); // questionIndex -> option that has not reached the server
  const flushingRef = useRef(false);
  const submittedRef = useRef(false);
  const warnedRef = useRef(false);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const store = useCallback(
    (next) => {
      answersRef.current = next;
      writeLocal(code, next);
      return next;
    },
    [code],
  );

  /** Push whatever is un-synced. Best effort by design: a failure leaves the work in `pendingRef`. */
  const flush = useCallback(async () => {
    if (flushingRef.current || pendingRef.current.size === 0) return;
    flushingRef.current = true;
    setSyncing(true);
    try {
      for (const [questionIndex, selectedOption] of [...pendingRef.current]) {
        await liveApi.saveAnswer(code, { questionIndex, selectedOption });
        // Only clear the entry if it was not re-answered while this request was in flight.
        if (pendingRef.current.get(questionIndex) === selectedOption) pendingRef.current.delete(questionIndex);
      }
      setOffline(false);
    } catch {
      setOffline(true);
    } finally {
      flushingRef.current = false;
      setSyncing(false);
      setUnsynced(pendingRef.current.size);
    }
  }, [code]);

  const handleSubmit = useCallback(async () => {
    if (submittedRef.current) return;
    const payload = Object.entries(answersRef.current).map(([questionIndex, selectedOption]) => ({
      questionIndex: Number(questionIndex),
      selectedOption,
    }));
    setSyncing(true);
    try {
      const result = await liveApi.submit(code, payload);
      submittedRef.current = true;
      pendingRef.current.clear();
      setUnsynced(0);
      clearLocal(code);
      setOffline(false);
      setSubmitted(true);
      setConfirmSubmit(false);
      if (result?.answersRejected) {
        toast.error('The paper had already closed when your last answers arrived.');
      }
      qc.invalidateQueries({ queryKey: ['live', code] });
    } catch (e) {
      // Stay on the paper. The answers are still here, and the retry loop keeps trying.
      setOffline(true);
      if (!warnedRef.current) {
        warnedRef.current = true;
        toast.error(e?.message ?? 'Could not reach the server. We will keep trying; your answers are safe on this device.');
      }
    } finally {
      setSyncing(false);
    }
  }, [code, qc, toast]);

  const submitRef = useRef(handleSubmit);
  useEffect(() => {
    submitRef.current = handleSubmit;
  }, [handleSubmit]);

  const remaining = useRemaining(exam?.endsAt, exam?.serverTime);
  const merged = useMemo(() => {
    const base = {};
    exam?.questions.forEach((q) => {
      if (q.selectedOption != null) base[q.index] = q.selectedOption;
    });
    return { ...base, ...answers };
  }, [exam, answers]);

  // Retry anything the server has not acknowledged yet, and everything at once when the network
  // comes back. Lives for as long as the paper is on screen.
  useEffect(() => {
    const retry = () => {
      if (pendingRef.current.size > 0) flush();
    };
    const id = setInterval(retry, RETRY_MS);
    window.addEventListener('online', retry);
    return () => {
      clearInterval(id);
      window.removeEventListener('online', retry);
    };
  }, [flush]);

  // When the server clock runs out, hand the paper in, and keep handing it in until it lands. The
  // server also closes the attempt on its own, so this only exists for the case where the client
  // was offline at the deadline and its answers still need to arrive.
  useEffect(() => {
    if (remaining !== 0 || !exam) return undefined;
    submitRef.current();
    const id = setInterval(() => {
      if (!submittedRef.current) submitRef.current();
    }, RETRY_MS);
    return () => clearInterval(id);
  }, [remaining, exam]);

  if (isLoading) return <Screen width="xl"><SkeletonCard className="h-72" /></Screen>;
  if (error) {
    return (
      <Screen width="md">
        <Banner
          variant="danger"
          title="Could not load the paper."
          action={<Button size="sm" onClick={() => refetch()}>Try again</Button>}
        >
          {error.message ?? 'Check your connection, then try again. Your exam time keeps running.'}
        </Banner>
      </Screen>
    );
  }

  if (submitted) {
    return (
      <Screen width="md">
        <Banner variant="success" title="Paper submitted.">You can close this page.</Banner>
      </Screen>
    );
  }

  const total = exam.questions.length;
  const q = exam.questions[index];
  const answeredSet = new Set(Object.keys(merged).map((i) => Number(i) + 1));
  const flaggedSet = new Set([...flagged].map((i) => i + 1));

  const choose = (optionIndex) => {
    // Answer first, save second. A failed save never takes the choice back.
    setAnswers((prev) => store({ ...prev, [q.index]: optionIndex }));
    pendingRef.current.set(q.index, optionIndex);
    setUnsynced(pendingRef.current.size);
    flush();
  };

  const toggleFlag = () =>
    setFlagged((s) => {
      const next = new Set(s);
      if (next.has(q.index)) next.delete(q.index);
      else next.add(q.index);
      return next;
    });

  const syncNote = offline
    ? { Icon: CloudOff, text: 'Offline. Your answers are kept on this device and sent when you submit.' }
    : syncing
      ? { Icon: Loader2, text: 'Saving your answer.' }
      : unsynced === 0 && Object.keys(merged).length > 0
        ? { Icon: Check, text: 'Every answer saved.' }
        : null;

  return (
    <Screen width="full">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">Live exam</p>
          <h1 className="font-heading text-xl font-extrabold tracking-tight text-foreground-strong">{exam.title}</h1>
        </div>
        {remaining != null && <ExamTimer secondsLeft={remaining} totalSeconds={exam.durationMinutes * 60} />}
      </div>

      {syncNote && (
        <p className={`mt-3 inline-flex items-center gap-2 text-xs font-semibold ${offline ? 'text-warning' : 'text-muted'}`} role="status">
          <syncNote.Icon size={14} className={syncNote.Icon === Loader2 ? 'animate-spin' : undefined} aria-hidden="true" />
          {syncNote.text}
        </p>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="space-y-4">
          <QuestionCard number={index + 1} total={total} stem={q.stem} flagged={flagged.has(q.index)} onFlag={toggleFlag}>
            {q.options.map((opt, i) => (
              <OptionRow key={i} name={`q-${q.index}`} label={LETTERS[i]} state={merged[q.index] === i ? 'selected' : 'idle'} onSelect={() => choose(i)}>
                {opt}
              </OptionRow>
            ))}
          </QuestionCard>

          <div className="flex items-center justify-between gap-3">
            <Button variant="outline" onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0} leadingIcon={<ChevronLeft {...ICON} />}>Previous</Button>
            {index < total - 1 ? (
              <Button onClick={() => setIndex((i) => i + 1)}>Next<ChevronRight {...ICON} className="ml-1" /></Button>
            ) : (
              <Button onClick={() => setConfirmSubmit(true)} leadingIcon={<Send {...ICON} />}>Submit</Button>
            )}
          </div>
        </div>

        <aside className="space-y-4 rounded-[20px] border border-border bg-surface p-4 lg:sticky lg:top-6 lg:self-start">
          <p className="text-sm font-semibold text-foreground-strong">{answeredSet.size} of {total} answered</p>
          <QuestionNavigator total={total} current={index + 1} answered={answeredSet} flagged={flaggedSet} onJump={(n) => setIndex(n - 1)} />
          <Button className="w-full" onClick={() => setConfirmSubmit(true)} leadingIcon={<Send {...ICON} />}>Submit paper</Button>
        </aside>
      </div>

      <ConfirmDialog
        open={confirmSubmit}
        onOpenChange={setConfirmSubmit}
        title="Submit your paper?"
        description={total - answeredSet.size > 0 ? `${total - answeredSet.size} questions are unanswered. You cannot change anything after submitting.` : 'You cannot change anything after submitting.'}
        confirmLabel={syncing ? 'Submitting' : 'Submit'}
        onConfirm={handleSubmit}
      />
    </Screen>
  );
}

export default LiveExamRunner;

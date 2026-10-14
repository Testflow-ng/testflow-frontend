import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Send } from 'lucide-react';
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

/** The paper a participant sits. The server owns the clock, the answers and the score; this only shows and sends. */
function LiveExamRunner({ code }) {
  const qc = useQueryClient();
  const toast = useToast();
  const { data: exam, isLoading, error } = useQuery({
    queryKey: ['live', code, 'questions'],
    queryFn: () => liveApi.questions(code),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState(() => new Set());
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const autoSubmitted = useRef(false);

  const remaining = useRemaining(exam?.endsAt, exam?.serverTime);
  const merged = useMemo(() => {
    const base = {};
    exam?.questions.forEach((q) => { if (q.selectedOption != null) base[q.index] = q.selectedOption; });
    return { ...base, ...answers };
  }, [exam, answers]);

  const submit = async () => {
    setSubmitting(true);
    try {
      await liveApi.submit(code);
      qc.invalidateQueries({ queryKey: ['live', code] });
    } catch (e) {
      toast.error(e?.message ?? 'Could not submit. Try again.');
      setSubmitting(false);
    }
  };

  // When the server clock runs out, submit once. The server also closes the attempt on its own.
  useEffect(() => {
    if (remaining === 0 && exam && !autoSubmitted.current) {
      autoSubmitted.current = true;
      liveApi.submit(code).finally(() => qc.invalidateQueries({ queryKey: ['live', code] }));
    }
  }, [remaining, exam, code, qc]);

  if (isLoading) return <Screen width="xl"><SkeletonCard className="h-72" /></Screen>;
  if (error) return <Screen width="md"><Banner variant="danger">{error.message ?? 'Could not load the paper.'}</Banner></Screen>;

  const total = exam.questions.length;
  const q = exam.questions[index];
  const answeredSet = new Set(Object.keys(merged).map((i) => Number(i) + 1));
  const flaggedSet = new Set([...flagged].map((i) => i + 1));

  const choose = async (optionIndex) => {
    const previous = merged[q.index];
    setAnswers((a) => ({ ...a, [q.index]: optionIndex }));
    try {
      await liveApi.saveAnswer(code, { questionIndex: q.index, selectedOption: optionIndex });
    } catch (e) {
      setAnswers((a) => ({ ...a, [q.index]: previous ?? undefined }));
      toast.error(e?.message ?? 'Answer not saved. Check your connection.');
    }
  };

  const toggleFlag = () =>
    setFlagged((s) => {
      const next = new Set(s);
      if (next.has(q.index)) next.delete(q.index);
      else next.add(q.index);
      return next;
    });

  return (
    <Screen width="full">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">Live exam</p>
          <h1 className="font-heading text-xl font-extrabold tracking-tight text-foreground-strong">{exam.title}</h1>
        </div>
        {remaining != null && <ExamTimer secondsLeft={remaining} totalSeconds={exam.durationMinutes * 60} />}
      </div>

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
        confirmLabel={submitting ? 'Submitting' : 'Submit'}
        onConfirm={submit}
      />
    </Screen>
  );
}

export default LiveExamRunner;

import { useState } from 'react';
import { Button, Modal } from '../../components/ui/index.js';
import { cn } from '../../utils/cn.js';
import { Check, Info } from 'lucide-react';

const DURATIONS = [5, 10, 15, 30, 45, 60, 90, 120];

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'relative rounded-xl border-2 px-4 py-2 text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        active
          ? 'border-primary bg-primary/5 text-primary shadow-sm shadow-primary/10 scale-[1.02]'
          : 'border-border text-muted hover:border-border-strong hover:bg-surface-strong hover:text-foreground',
      )}
    >
      {children}
      {active && (
        <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[8px] text-white">
          <Check size={10} />
        </span>
      )}
    </button>
  );
}

/** Configure and start a practice exam for a subject (question count + time). */
function ExamStartDialog({ subject, onClose, onConfirm, isStarting }) {
  const maxQuestions = subject.questionCount ?? 0;
  const isLargeBank = maxQuestions >= 20;

  const questionChoices = [
    ...new Set([5, 10, 20, 40, 60, 100, maxQuestions].filter((n) => n > 0 && n <= maxQuestions)),
  ].sort((a, b) => a - b);

  const [count, setCount] = useState(() =>
    questionChoices.includes(10) ? 10 : questionChoices[questionChoices.length - 1],
  );
  const [duration, setDuration] = useState(15);

  return (
    <Modal
      open
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      title={`Practice ${subject.code}`}
      description={subject.title}
      footer={
        <>
          <Button variant="ghost" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="md"
            loading={isStarting}
            onClick={() => onConfirm({
              questionCount: count,
              durationMinutes: duration
            })}
            className="px-8"
          >
            Start Exam
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-6 pt-2">
        <div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-foreground-strong uppercase tracking-wider">Number of Questions</p>
            <span className="text-[10px] font-bold text-muted bg-surface-strong px-2 py-0.5 rounded uppercase tracking-tighter tabular-nums">
              {isLargeBank ? `${maxQuestions} Total Available` : 'Growing Bank'}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {questionChoices.map((n) => (
              <Chip key={n} active={count === n} onClick={() => setCount(n)}>
                {n === maxQuestions ? `Full Bank (${n})` : n}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-bold text-foreground-strong uppercase tracking-wider">Time Limit</p>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {DURATIONS.map((minutes) => (
              <Chip key={minutes} active={duration === minutes} onClick={() => setDuration(minutes)}>
                {minutes} min
              </Chip>
            ))}
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl bg-surface-strong p-4 border border-border">
          <Info size={18} className="shrink-0 text-primary mt-0.5" />
          <p className="text-[11px] leading-relaxed text-muted font-medium">
            TestFlow will shuffle the questions and options for this session.
            Once started, you can skip questions and return to them later. Good luck!
          </p>
        </div>
      </div>
    </Modal>
  );
}

export default ExamStartDialog;

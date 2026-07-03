import { useState } from 'react';
import { Button, Modal } from '../../components/ui/index.js';
import { cn } from '../../utils/cn.js';

const DURATIONS = [5, 10, 15, 30, 45, 60];

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        active
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-border text-foreground hover:bg-surface-strong',
      )}
    >
      {children}
    </button>
  );
}

/** Configure and start a practice exam for a subject (question count + time). */
function ExamStartDialog({ subject, onClose, onConfirm, isStarting }) {
  const maxQuestions = subject.questionCount ?? 0;
  const questionChoices = [...new Set([5, 10, 20, maxQuestions].filter((n) => n > 0 && n <= maxQuestions))].sort(
    (a, b) => a - b,
  );

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
      title={`Start ${subject.code}`}
      description={subject.title}
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            loading={isStarting}
            onClick={() => onConfirm({ questionCount: count, durationMinutes: duration })}
          >
            Start exam
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <div>
          <p className="text-sm font-medium text-foreground-strong">Questions</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {questionChoices.map((n) => (
              <Chip key={n} active={count === n} onClick={() => setCount(n)}>
                {n === maxQuestions ? `All (${n})` : n}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-foreground-strong">Time limit</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {DURATIONS.map((minutes) => (
              <Chip key={minutes} active={duration === minutes} onClick={() => setDuration(minutes)}>
                {minutes} min
              </Chip>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default ExamStartDialog;

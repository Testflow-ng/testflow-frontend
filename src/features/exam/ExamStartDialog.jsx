import { useState } from 'react';
import { Button, Modal, Spinner, Alert } from '../../components/ui/index.js';
import { cn } from '../../utils/cn.js';
import { Check, Info, Trophy, Settings2, Clock, Hash, Calendar, Layers } from 'lucide-react';
import { useLeaderboard, useSubjectTopics } from '../subjects/useSubjects.js';

const DURATIONS = [5, 10, 15, 30, 45, 60, 90, 120];

/** Quiet caps label above each group of controls. */
function SectionLabel({ children }) {
  return (
    <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
      {children}
    </p>
  );
}

/** Selectable option chip. `min-w-14 h-11` keeps every chip a legitimate touch
 *  target even when its label is a single digit. */
function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'tf-pressable relative inline-flex h-11 min-w-14 items-center justify-center rounded-full border-2 px-4 text-sm font-bold',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        active
          ? 'border-primary bg-primary/5 text-primary'
          : 'border-border text-muted active:bg-surface-strong',
      )}
    >
      {children}
      {active && (
        <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary text-white">
          <Check size={10} aria-hidden="true" />
        </span>
      )}
    </button>
  );
}

function LeaderboardTab({ subjectId }) {
  const { data: leaderboard, isLoading, isError } = useLeaderboard(subjectId);

  if (isLoading) return <div className="py-12 flex justify-center"><Spinner size="md" /></div>;
  if (isError) return <Alert variant="danger">Failed to load leaderboard.</Alert>;
  if (!leaderboard?.length) {
    return (
      <div className="py-12 text-center text-muted">
        <Trophy size={44} className="mx-auto mb-4 opacity-10" aria-hidden="true" />
        <p className="text-[15px] font-semibold text-foreground-strong">No rankings yet</p>
        <p className="mt-1 text-[13px]">Be the first to reach the top.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 py-1">
      {leaderboard.map((entry, i) => (
        <div
          key={i}
          className={cn(
            'flex items-center justify-between gap-3 rounded-xl border p-3',
            i === 0 ? 'border-amber-500/20 bg-amber-500/5' : 'border-border bg-surface',
          )}
        >
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={cn(
                'flex size-9 shrink-0 items-center justify-center rounded-lg text-[13px] font-bold',
                i === 0
                  ? 'bg-amber-500 text-white'
                  : 'border border-border bg-surface-strong text-muted',
              )}
            >
              {i + 1}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold text-foreground-strong">
                {entry.username ? `@${entry.username}` : entry.fullName}
              </p>
              <div className="mt-0.5 flex items-center gap-2.5 overflow-hidden text-[12px] font-medium text-muted">
                <span className="flex shrink-0 items-center gap-1">
                  <Hash size={11} aria-hidden="true" /> {entry.totalQuestions} Qs
                </span>
                <span className="flex items-center gap-1 truncate">
                  <Clock size={11} aria-hidden="true" />
                  {entry.timeTakenSeconds
                    ? entry.timeTakenSeconds < 60
                      ? `${entry.timeTakenSeconds}s`
                      : `${Math.floor(entry.timeTakenSeconds / 60)}m`
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-lg font-extrabold leading-none tabular-nums text-primary">
              {entry.score}%
            </p>
            <p className="mt-1 flex items-center justify-end gap-1 text-[11px] font-medium text-muted">
              <Calendar size={11} aria-hidden="true" />
              {new Date(entry.date).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Configure and start a practice exam for a subject (question count + time). */
function ExamStartDialog({ subject, onClose, onConfirm, isStarting }) {
  const [activeTab, setActiveTab] = useState('setup'); // setup | leaderboard
  const { data: topics, isLoading: isLoadingTopics } = useSubjectTopics(subject.id);
  const [selectedTopicId, setSelectedTopicId] = useState('all');

  const currentTopic = topics?.find(t => t.id === selectedTopicId);

  const maxQuestions = selectedTopicId === 'all'
    ? (subject.questionCount ?? 0)
    : (currentTopic?.totalQuestions ?? 0);

  const PRESETS = [5, 10, 20, 40, 60, 100];
  let questionChoices = [...new Set(PRESETS.filter((n) => n > 0 && n <= maxQuestions))].sort(
    (a, b) => a - b,
  );

  if (questionChoices.length === 0 && maxQuestions > 0) {
    questionChoices = [maxQuestions];
  }

  const [count, setCount] = useState(() =>
    questionChoices.includes(10) ? 10 : questionChoices[questionChoices.length - 1],
  );

  // Adjust the count during render when topic selection changes the available
  // maximum. Guarded so it converges in a single extra render.
  if (maxQuestions > 0 && count > maxQuestions) {
    setCount(maxQuestions);
  } else if (maxQuestions > 0 && count === 0) {
    setCount(Math.min(10, maxQuestions));
  }

  const [duration, setDuration] = useState(15);

  const handleStart = () => {
    onConfirm({
      questionCount: count,
      durationMinutes: duration,
      topicId: selectedTopicId === 'all' ? undefined : selectedTopicId
    });
  };

  return (
    <Modal
      open
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      title={`Practice ${subject.code}`}
      description={subject.title}
      size="lg"
      footer={
        activeTab === 'setup' ? (
          <>
            <Button variant="ghost" size="lg" onClick={onClose}>
              Cancel
            </Button>
            <Button
              size="lg"
              loading={isStarting}
              onClick={handleStart}
              className="sm:px-8"
              disabled={maxQuestions === 0}
            >
              Start exam
            </Button>
          </>
        ) : (
          <Button variant="ghost" size="lg" onClick={() => setActiveTab('setup')}>
            Back to setup
          </Button>
        )
      }
    >
      <div className="flex flex-col gap-5 py-1">
        {/* Segmented control. 40px tall track, 36px thumbs. */}
        <div
          role="tablist"
          aria-label="Exam setup sections"
          className="flex rounded-full border border-border bg-surface-strong p-1"
        >
          {[
            { id: 'setup', label: 'Setup', Icon: Settings2, tone: 'text-primary' },
            { id: 'leaderboard', label: 'Hall of fame', Icon: Trophy, tone: 'text-amber-500' },
          ].map(({ id, label, Icon, tone }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={activeTab === id}
              onClick={() => setActiveTab(id)}
              className={cn(
                'flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full px-2 text-[13px] font-semibold transition-colors duration-[var(--duration-sm)]',
                activeTab === id ? `border border-border bg-surface ${tone}` : 'text-muted',
              )}
            >
              <Icon size={14} aria-hidden="true" /> {label}
            </button>
          ))}
        </div>

        {activeTab === 'setup' ? (
          <div className="space-y-5">
            {/* Topic selection. Scrolling is delegated to the sheet. */}
            <section>
              <SectionLabel>Targeted practice</SectionLabel>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setSelectedTopicId('all')}
                  aria-pressed={selectedTopicId === 'all'}
                  className={cn(
                    'tf-pressable flex min-h-12 items-center justify-between gap-3 rounded-xl border p-3 text-left',
                    selectedTopicId === 'all'
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-surface',
                  )}
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <Layers
                      size={16}
                      aria-hidden="true"
                      className={selectedTopicId === 'all' ? 'text-primary' : 'text-muted'}
                    />
                    <span className="text-[14px] font-semibold text-foreground-strong">
                      All topics
                    </span>
                  </span>
                  <span className="shrink-0 rounded bg-primary/10 px-1.5 py-0.5 text-[12px] font-bold text-primary">
                    {subject.questionCount || 0}
                  </span>
                </button>

                {isLoadingTopics ? (
                  <div className="col-span-full flex justify-center py-4">
                    <Spinner size="sm" />
                  </div>
                ) : (
                  topics?.map((topic) => (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => setSelectedTopicId(topic.id)}
                      aria-pressed={selectedTopicId === topic.id}
                      className={cn(
                        'tf-pressable flex min-h-12 items-center justify-between gap-3 rounded-xl border p-3 text-left',
                        selectedTopicId === topic.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border bg-surface',
                      )}
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-[14px] font-semibold text-foreground-strong">
                          {topic.name}
                        </span>
                        <span className="mt-0.5 block truncate text-[11px] font-medium text-muted">
                          {topic.id}
                        </span>
                      </span>
                      <span className="shrink-0 self-center rounded bg-surface-strong px-1.5 py-0.5 text-[12px] font-bold text-muted">
                        {topic.totalQuestions}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </section>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <section>
                <SectionLabel>Questions</SectionLabel>
                <div className="flex flex-wrap gap-2">
                  {questionChoices.map((n) => (
                    <Chip key={n} active={count === n} onClick={() => setCount(n)}>
                      {n}
                    </Chip>
                  ))}
                </div>
              </section>

              <section>
                <SectionLabel>Time limit</SectionLabel>
                <div className="flex flex-wrap gap-2">
                  {DURATIONS.map((minutes) => (
                    <Chip
                      key={minutes}
                      active={duration === minutes}
                      onClick={() => setDuration(minutes)}
                    >
                      {minutes}m
                    </Chip>
                  ))}
                </div>
              </section>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-primary/10 bg-primary/5 p-3.5">
              <Info size={16} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
              <p className="text-[13px] font-medium leading-relaxed text-foreground/80">
                {selectedTopicId === 'all'
                  ? 'Random mix from all modules.'
                  : `Focusing on: ${currentTopic?.name}.`}{' '}
                Questions and options will be shuffled.
              </p>
            </div>
          </div>
        ) : (
          <LeaderboardTab subjectId={subject.id} />
        )}
      </div>
    </Modal>
  );
}

export default ExamStartDialog;

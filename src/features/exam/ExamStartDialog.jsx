import { useState } from 'react';
import { Button, Modal, Spinner, Alert } from '../../components/ui/index.js';
import { cn } from '../../utils/cn.js';
import { Check, Info, Trophy, Settings2, Clock, Hash, Calendar, Layers } from 'lucide-react';
import { useLeaderboard, useSubjectTopics } from '../subjects/useSubjects.js';

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

function LeaderboardTab({ subjectId }) {
  const { data: leaderboard, isLoading, isError } = useLeaderboard(subjectId);

  if (isLoading) return <div className="py-12 flex justify-center"><Spinner size="md" /></div>;
  if (isError) return <Alert variant="danger">Failed to load leaderboard.</Alert>;
  if (!leaderboard?.length) {
    return (
      <div className="py-12 text-center text-muted">
        <Trophy size={48} className="mx-auto mb-4 opacity-10" />
        <p className="text-sm font-bold uppercase tracking-widest">No rankings yet</p>
        <p className="text-xs mt-1 italic">Be the first to reach the top!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 py-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
      {leaderboard.map((entry, i) => (
        <div
          key={i}
          className={cn(
            "flex items-center justify-between p-3 sm:p-4 rounded-xl border transition-all",
            i === 0 ? "bg-amber-500/5 border-amber-500/20" : "bg-surface border-border"
          )}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className={cn(
              "shrink-0 size-8 sm:size-10 flex items-center justify-center rounded-lg font-black text-xs sm:text-sm",
              i === 0 ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" : "bg-surface-strong text-muted border border-border"
            )}>
              {i + 1}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground-strong truncate">
                {entry.username ? `@${entry.username}` : entry.fullName}
              </p>
              <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted font-bold uppercase tracking-tighter overflow-hidden">
                <span className="flex items-center gap-1 shrink-0"><Hash size={10} /> {entry.totalQuestions} Qs</span>
                <span className="flex items-center gap-1 truncate">
                  <Clock size={10} />
                  {entry.timeTakenSeconds ? (
                    entry.timeTakenSeconds < 60 ? `${entry.timeTakenSeconds}s` : `${Math.floor(entry.timeTakenSeconds / 60)}m`
                  ) : 'N/A'}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right shrink-0 ml-2">
            <p className="text-lg sm:text-xl font-black text-primary leading-none">{entry.score}%</p>
            <p className="text-[9px] text-muted font-bold uppercase tracking-tighter mt-1 flex items-center justify-end gap-1">
               <Calendar size={10} /> {new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
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
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:justify-end">
            <Button variant="ghost" size="md" onClick={onClose} className="order-2 sm:order-1">
              Cancel
            </Button>
            <Button
              size="md"
              loading={isStarting}
              onClick={handleStart}
              className="px-8 order-1 sm:order-2"
              disabled={maxQuestions === 0}
            >
              Start Exam
            </Button>
          </div>
        ) : (
          <Button variant="ghost" size="md" onClick={() => setActiveTab('setup')} className="w-full">
            Back to Setup
          </Button>
        )
      }
    >
      <div className="flex flex-col gap-4 sm:gap-6 pt-2">
        {/* Tab Switcher - More compact on mobile */}
        <div className="flex p-1 bg-surface-strong rounded-xl border border-border">
          <button
            onClick={() => setActiveTab('setup')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 px-2 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all",
              activeTab === 'setup' ? "bg-surface text-primary shadow-sm border border-border" : "text-muted hover:text-foreground"
            )}
          >
            <Settings2 size={14} /> Setup
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 px-2 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all",
              activeTab === 'leaderboard' ? "bg-surface text-amber-500 shadow-sm border border-border" : "text-muted hover:text-foreground"
            )}
          >
            <Trophy size={14} /> Hall of Fame
          </button>
        </div>

        {activeTab === 'setup' ? (
          <div className="space-y-5 sm:space-y-6">
            {/* Topic Selection - Improved Responsiveness and Grouping */}
            <div>
              <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-3">Targeted Practice</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[220px] sm:max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
                <button
                  onClick={() => setSelectedTopicId('all')}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl border transition-all text-left",
                    selectedTopicId === 'all' ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border bg-surface hover:bg-surface-strong"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Layers size={16} className={selectedTopicId === 'all' ? "text-primary" : "text-muted"} />
                    <span className="text-xs font-bold text-foreground-strong">All Topics</span>
                  </div>
                  <span className="text-[10px] font-black text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                    {subject.questionCount || 0}
                  </span>
                </button>

                {isLoadingTopics ? (
                   <div className="col-span-full py-4 flex justify-center"><Spinner size="sm" /></div>
                ) : topics?.map(topic => (
                  <button
                    key={topic.id}
                    onClick={() => setSelectedTopicId(topic.id)}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl border transition-all text-left group",
                      selectedTopicId === topic.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border bg-surface hover:border-muted-foreground/30"
                    )}
                  >
                    <div className="flex flex-col gap-0.5 min-w-0 pr-2">
                       <span className="text-xs font-bold text-foreground-strong truncate">{topic.name}</span>
                       <span className="text-[9px] text-muted font-bold truncate opacity-60 group-hover:opacity-100">{topic.id}</span>
                    </div>
                    <span className="shrink-0 text-[10px] font-black text-muted bg-surface-strong px-1.5 py-0.5 rounded self-center">
                      {topic.totalQuestions}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              <div>
                <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-3">Questions</p>
                <div className="flex flex-wrap gap-2">
                  {questionChoices.map((n) => (
                    <Chip key={n} active={count === n} onClick={() => setCount(n)}>
                      {n}
                    </Chip>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-3">Time Limit</p>
                <div className="flex flex-wrap gap-2">
                  {DURATIONS.map((minutes) => (
                    <Chip key={minutes} active={duration === minutes} onClick={() => setDuration(minutes)}>
                      {minutes}m
                    </Chip>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl bg-primary/5 p-3 sm:p-4 border border-primary/10">
              <Info size={16} className="shrink-0 text-primary mt-0.5" />
              <p className="text-[10px] sm:text-[11px] leading-relaxed text-foreground/80 font-medium">
                {selectedTopicId === 'all'
                  ? "Random mix from all modules."
                  : `Focusing on: ${currentTopic?.name}.`}
                {" "}Questions and options will be shuffled.
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

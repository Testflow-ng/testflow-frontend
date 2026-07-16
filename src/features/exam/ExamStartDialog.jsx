import { useState } from 'react';
import { Button, Modal, Spinner, Alert } from '../../components/ui/index.js';
import { cn } from '../../utils/cn.js';
import { Check, Info, Trophy, Settings2, Clock, Hash, Calendar, BookOpen } from 'lucide-react';
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
            "flex items-center justify-between p-3 rounded-xl border transition-all",
            i === 0 ? "bg-amber-500/5 border-amber-500/20" : "bg-surface border-border"
          )}
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              "size-8 flex items-center justify-center rounded-lg font-black text-xs",
              i === 0 ? "bg-amber-500 text-white" : "bg-surface-strong text-muted"
            )}>
              {i + 1}
            </div>
            <div>
              <p className="text-sm font-bold text-foreground-strong">
                {entry.username ? `@${entry.username}` : entry.fullName}
              </p>
              <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted font-bold uppercase tracking-tighter">
                <span className="flex items-center gap-1"><Hash size={10} /> {entry.totalQuestions} Qs</span>
                <span className="flex items-center gap-1"><Clock size={10} /> {entry.timeTaken}m</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-black text-primary leading-none">{entry.score}%</p>
            <p className="text-[9px] text-muted font-bold uppercase tracking-tighter mt-1 flex items-center justify-end gap-1">
               <Calendar size={10} /> {new Date(entry.date).toLocaleDateString()}
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
  const [selectedTopic, setSelectedTopic] = useState('all');

  const maxQuestions = subject.questionCount ?? 0;
  const isLargeBank = maxQuestions >= 20;

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
        activeTab === 'setup' ? (
          <>
            <Button variant="ghost" size="md" onClick={onClose}>
              Cancel
            </Button>
            <Button
              size="md"
              loading={isStarting}
              onClick={() => onConfirm({
                questionCount: count,
                durationMinutes: duration,
                topicId: selectedTopic === 'all' ? undefined : selectedTopic
              })}
              className="px-8"
            >
              Start Exam
            </Button>
          </>
        ) : (
          <Button variant="ghost" size="md" onClick={() => setActiveTab('setup')} className="w-full">
            Back to Setup
          </Button>
        )
      }
    >
      <div className="flex flex-col gap-6 pt-2">
        {/* Tab Switcher */}
        <div className="flex p-1 bg-surface-strong rounded-xl border border-border">
          <button
            onClick={() => setActiveTab('setup')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
              activeTab === 'setup' ? "bg-surface text-primary shadow-sm border border-border" : "text-muted hover:text-foreground"
            )}
          >
            <Settings2 size={14} /> Exam Setup
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
              activeTab === 'leaderboard' ? "bg-surface text-amber-500 shadow-sm border border-border" : "text-muted hover:text-foreground"
            )}
          >
            <Trophy size={14} /> Hall of Fame
          </button>
        </div>

        {activeTab === 'setup' ? (
          <>
            {topics && topics.length > 0 && (
              <div>
                <p className="text-sm font-bold text-foreground-strong uppercase tracking-wider mb-3 flex items-center gap-2">
                   <BookOpen size={16} className="text-primary" /> Select Topic
                </p>
                <div className="flex flex-wrap gap-2.5">
                  <Chip active={selectedTopic === 'all'} onClick={() => setSelectedTopic('all')}>
                    All Topics (Mixed)
                  </Chip>
                  {topics.map((t) => (
                    <Chip key={t.id} active={selectedTopic === t.id} onClick={() => setSelectedTopic(t.id)}>
                      {t.name}
                    </Chip>
                  ))}
                </div>
              </div>
            )}

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
                    {n}
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
          </>
        ) : (
          <LeaderboardTab subjectId={subject.id} />
        )}
      </div>
    </Modal>
  );
}

export default ExamStartDialog;

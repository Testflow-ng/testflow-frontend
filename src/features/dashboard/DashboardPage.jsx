import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import OnboardingFlow from '../onboarding/OnboardingFlow.jsx';
import {
  BookOpen,
  ChevronRight,
  Flame,
  GraduationCap,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { useAuth } from '../auth/useAuth.js';
import { useStats } from '../analytics/useStats.js';
import { useHistory } from '../exam/useHistory.js';
import Avatar from '../../components/ui/Avatar.jsx';
import UsernameSetupModal from '../auth/components/UsernameSetupModal.jsx';
import { cn } from '../../utils/cn.js';
import { subjectMeta } from '../subjects/subjectMeta.js';

const scoreTone = (score) => {
  if (score >= 70) return 'text-success';
  if (score >= 50) return 'text-warning';
  return 'text-danger';
};

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      })
    : null;

const WEEK_DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function DashboardPage() {
  const { user } = useAuth();
  const { data: stats } = useStats();
  const { data: sessions } = useHistory();
  const [setupDismissed, setSetupDismissed] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(
    () => !localStorage.getItem('tf_onboarded'),
  );
  const dismissOnboarding = useCallback(() => setShowOnboarding(false), []);

  const showSetup = Boolean(user && !user.username) && !setupDismissed;

  const inProgress = sessions?.filter((s) => s.status !== 'submitted') || [];
  const recentCompleted =
    sessions
      ?.filter((s) => s.status === 'submitted')
      .slice(0, 3) || [];

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const streakCount = user?.streakCount ?? 0;
  const streakDays = user?.streakDays ?? [];

  if (showOnboarding) {
    return <OnboardingFlow onComplete={dismissOnboarding} />;
  }

  return (
    <section className="mx-auto w-full max-w-2xl flex-1 px-5 pb-28 pt-6 lg:max-w-5xl lg:pb-8">
      <UsernameSetupModal
        open={showSetup}
        onComplete={() => setSetupDismissed(true)}
      />

      {/* Welcome */}
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted">
            {greeting()},{' '}
            {user.username ? `@${user.username}` : user.fullName.split(' ')[0]}
          </p>
          <h1 className="font-heading text-2xl font-extrabold tracking-tight text-foreground-strong">
            {user.fullName.split(' ')[0]}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {streakCount > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-warning/10 px-3 py-1.5 text-xs font-bold tabular-nums text-warning">
              <Flame size={14} className="fill-warning" />
              {streakCount}
            </span>
          )}
          <Link to="/profile">
            <Avatar name={user.fullName} size="sm" />
          </Link>
        </div>
      </div>

      {/* Streak card */}
      <div className="mt-5 rounded-2xl border border-border bg-surface p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-warning/10">
            <Flame size={24} className="text-warning fill-warning" />
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-black tabular-nums leading-none text-foreground-strong">
              {streakCount}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted">
              day streak
            </p>
          </div>
        </div>
        <div className="mt-4 flex justify-between gap-1">
          {WEEK_DAYS.map((day, i) => {
            const active = streakDays.includes(i);
            return (
              <div
                key={i}
                className={cn(
                  'flex h-9 flex-1 items-center justify-center rounded-full text-[11px] font-bold transition-colors',
                  active
                    ? 'bg-warning text-white'
                    : 'bg-surface-strong text-muted',
                )}
              >
                {active ? <Flame size={13} className="fill-current" /> : day}
              </div>
            );
          })}
        </div>
        {streakCount === 0 && (
          <p className="mt-3 text-xs text-muted">
            Complete a practice test today to start your streak
          </p>
        )}
      </div>

      {/* Stats strip */}
      {stats && stats.totalExams > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-3">
          <StatPill label="Average" value={`${stats.averageScore}%`} />
          <StatPill label="Exams" value={stats.totalExams} />
          <StatPill label="Best" value={`${stats.bestScore}%`} />
        </div>
      )}

      {/* Quick actions */}
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <QuickAction
          icon={<GraduationCap size={18} />}
          label="Courses"
          sublabel="Browse subjects"
          to="/courses"
          accent="bg-primary/8 text-primary"
        />
        <QuickAction
          icon={<Users size={18} />}
          label="Live CBT"
          sublabel="Coming soon"
          to="/live"
          accent="bg-success/8 text-success"
          badge="New"
        />
        <QuickAction
          icon={<Sparkles size={18} />}
          label="AI Study"
          sublabel="Coming soon"
          to="/ai-study"
          accent="bg-info/8 text-info"
          badge="New"
        />
        <QuickAction
          icon={<TrendingUp size={18} />}
          label="Progress"
          sublabel="View analytics"
          to="/progress"
          accent="bg-warning/8 text-warning"
        />
      </div>

      {/* In-progress exams */}
      {inProgress.length > 0 && (
        <div className="mt-8">
          <SectionHeader title="Continue where you left off" />
          <div className="mt-3 flex flex-col gap-2">
            {inProgress.map((item) => {
              const { Icon, accent } = subjectMeta(item.subjectCode);
              return (
                <Link
                  key={item.id}
                  to={`/exam/${item.id}`}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 transition-colors hover:bg-surface-strong"
                >
                  <span
                    className={cn(
                      'flex size-10 shrink-0 items-center justify-center rounded-xl',
                      accent,
                    )}
                  >
                    <Icon size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-foreground-strong">
                      {item.subjectCode}
                    </p>
                    <p className="text-xs text-muted">
                      {item.answeredCount || 0}/{item.totalQuestions} answered
                    </p>
                  </div>
                  <span className="rounded-full bg-warning/10 px-3 py-1 text-xs font-bold text-warning">
                    Resume
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* AI Study Recommendations (UI shell) */}
      <div className="mt-8">
        <SectionHeader title="Study recommendations" icon={<Sparkles size={14} />} />
        <div className="mt-3 rounded-2xl border border-dashed border-primary/20 bg-primary/3 p-5">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Zap size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground-strong">
                AI-powered study insights
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                Personalized recommendations based on your performance patterns
                will appear here. Complete a few exams to activate this feature.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      {recentCompleted.length > 0 && (
        <div className="mt-8">
          <SectionHeader
            title="Recent activity"
            action={
              <Link
                to="/history"
                className="flex items-center gap-1 text-xs font-semibold text-primary"
              >
                View all <ChevronRight size={14} />
              </Link>
            }
          />
          <div className="mt-3 flex flex-col gap-2">
            {recentCompleted.map((item) => {
              const { Icon, accent } = subjectMeta(item.subjectCode);
              return (
                <Link
                  key={item.id}
                  to={`/exam/${item.id}/result`}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3.5 transition-colors hover:bg-surface-strong"
                >
                  <span
                    className={cn(
                      'flex size-9 shrink-0 items-center justify-center rounded-lg',
                      accent,
                    )}
                  >
                    <Icon size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground-strong">
                      {item.subjectCode}
                    </p>
                    <p className="text-xs text-muted">
                      {formatDate(item.submittedAt)} --{' '}
                      {item.correctCount}/{item.totalQuestions} correct
                    </p>
                  </div>
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-1 text-sm font-bold tabular-nums',
                      scoreTone(item.score),
                    )}
                  >
                    {item.score}%
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

function StatPill({ label, value }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-border bg-surface py-3">
      <span className="font-heading text-xl font-extrabold tabular-nums text-foreground-strong">
        {value}
      </span>
      <span className="mt-0.5 text-[10px] font-medium text-muted">{label}</span>
    </div>
  );
}

function SectionHeader({ title, icon, action }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="flex items-center gap-1.5 text-sm font-bold text-foreground-strong">
        {icon}
        {title}
      </h2>
      {action}
    </div>
  );
}

function QuickAction({ icon, label, sublabel, to, onClick, accent, badge }) {
  const classes = cn(
    'relative flex flex-col gap-2 rounded-2xl border border-border bg-surface p-4 text-left transition-all hover:bg-surface-strong',
  );

  const content = (
    <>
      <div className={cn('flex size-10 items-center justify-center rounded-xl', accent)}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-bold text-foreground-strong">{label}</p>
        <p className="text-[10px] text-muted">{sublabel}</p>
      </div>
      {badge && (
        <span className="absolute right-3 top-3 rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold text-primary-foreground">
          {badge}
        </span>
      )}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={classes}>
      {content}
    </button>
  );
}

export default DashboardPage;

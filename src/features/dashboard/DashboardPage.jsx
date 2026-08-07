import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, ChevronRight, Flame } from 'lucide-react';
import OnboardingFlow from '../onboarding/OnboardingFlow.jsx';
import { useAuth } from '../auth/useAuth.js';
import { useStats } from '../analytics/useStats.js';
import { useHistory } from '../exam/useHistory.js';
import { useSubjects } from '../subjects/useSubjects.js';
import Avatar from '../../components/ui/Avatar.jsx';
import Screen from '../../components/layout/Screen.jsx';
import Mascot from '../../components/brand/Mascot.jsx';
import { lastActivityFrom, moodForDashboard } from '../../components/brand/mascotMood.js';
import { buttonClasses, sheetClasses, sheetRowClasses } from '../../components/ui/index.js';
import UsernameSetupModal from '../auth/components/UsernameSetupModal.jsx';
import { cn } from '../../utils/cn.js';
import { subjectMeta } from '../subjects/subjectMeta.js';
import { deriveReadiness, deriveSubjectEdges } from './readiness.js';
import { scoreFill, scoreLabel, scoreTone } from '../../utils/score.js';

/*
  Visual thesis: the dashboard is a readiness ledger. One dominant, honest
  figure on a ruled sheet, every other fact ranked beneath it in a single
  column, no decoration.

  What this replaced, and why:
  - A 2x2 grid of four identical icon-above-heading cards, two of which linked
    to unbuilt features. All four destinations already exist in the tab bar or
    below, so the grid was duplicated navigation occupying the best real estate
    on the screen.
  - A dashed "AI-powered study insights" panel advertising a feature that does
    not exist.
  - A streak card as the hero. Streak measures attendance, not readiness, and
    reads 0 for every new user, so the first thing a student saw was a zero.

  No entrance animation anywhere on this screen. It is opened several times a
  day; at that frequency motion is a tax, not delight. Motion here is limited
  to press feedback and the score bar's own width transition.
*/

const WEEK_DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const formatDay = (value) =>
  value ? new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : null;

const todayLabel = () =>
  new Date()
    .toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })
    .toUpperCase();

function DashboardPage() {
  const { user } = useAuth();
  const { data: stats } = useStats();
  const { data: sessions } = useHistory();
  const { data: subjects } = useSubjects();
  const [setupDismissed, setSetupDismissed] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(
    () => !localStorage.getItem('tf_onboarded'),
  );
  const dismissOnboarding = useCallback(() => setShowOnboarding(false), []);

  const showSetup = Boolean(user && !user.username) && !setupDismissed;

  const inProgress = sessions?.filter((s) => s.status !== 'submitted') ?? [];
  const recent = sessions?.filter((s) => s.status === 'submitted').slice(0, 3) ?? [];

  const readiness = deriveReadiness(stats, sessions);
  const { weakest, strongest } = deriveSubjectEdges(stats);

  /*
    Flo's resting expression, from real state: overall readiness, streak, and
    how long it has been since the last attempt. Inactivity wins over score, so
    someone back after two weeks gets a mascot that noticed they were gone
    rather than a verdict on a fortnight-old paper.
  */
  const flo = moodForDashboard({
    hasData: readiness.hasData,
    score: readiness.score,
    streakCount: user?.streakCount ?? 0,
    lastActiveAt: lastActivityFrom(sessions),
  });

  const firstName = user.fullName.split(' ')[0];
  const streakCount = user?.streakCount ?? 0;
  const streakDays = user?.streakDays ?? [];

  if (showOnboarding) {
    return <OnboardingFlow onComplete={dismissOnboarding} />;
  }

  return (
    <Screen width="lg" className="flex flex-col lg:max-w-3xl">
      <UsernameSetupModal open={showSetup} onComplete={() => setSetupDismissed(true)} />

      {/* Masthead. Date first, in the mono face — this screen is dated work. */}
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
            {todayLabel()}
          </p>
          {/*
            The greeting and the name are on deliberate separate lines rather
            than one string left to wrap. As a single line it broke wherever the
            name happened to run out of room, so "Where you stand, Feranmioresajo."
            wrapped mid-phrase on one account and not on another. Splitting it
            makes the two-line shape intentional and identical for every name
            length, and `break-words` keeps a very long single-token name inside
            the column instead of pushing the avatar off screen.
          */}
          <h1 className="mt-1.5 font-heading text-[1.75rem] font-extrabold leading-[1.1] tracking-tight text-foreground-strong">
            <span className="block">{readiness.hasData ? 'Where you stand,' : "Let's begin,"}</span>
            <span className="block break-words">{firstName}.</span>
          </h1>
        </div>
        <Link
          to="/profile"
          aria-label="Your profile"
          className="tf-pressable mt-0.5 shrink-0 rounded-full"
        >
          <Avatar name={user.fullName} size="sm" />
        </Link>
      </header>

      {readiness.hasData ? (
        <ReadinessSheet
          readiness={readiness}
          weakest={weakest}
          strongest={strongest}
          streakCount={streakCount}
          streakDays={streakDays}
          flo={flo}
        />
      ) : (
        <FirstPaperSheet subjects={subjects} />
      )}

      {/*
        One primary action. The old screen had no primary action at all, just
        four equal-weight tiles.

        Full width on phones, where it needs to be a thumb-sized target at the
        bottom of the fold. Intrinsic width from `sm` up, because a 850px-wide
        button on a desktop is a mobile pattern that escaped: the click target
        is already trivial with a cursor, and the stretched pill only makes the
        page look like a scaled-up phone.
      */}
      <Link
        to="/courses"
        className={buttonClasses({
          size: 'lg',
          fullWidth: true,
          className: 'mt-4 sm:w-auto sm:self-start sm:px-8',
        })}
      >
        {readiness.hasData ? 'Start a paper' : 'Browse your courses'}
        <ArrowRight size={18} aria-hidden="true" />
      </Link>

      {inProgress.length > 0 && (
        <Section title="Unfinished">
          <div className={sheetClasses()}>
            {inProgress.map((item) => (
              <Link
                key={item.id}
                to={`/exam/${item.id}`}
                className={sheetRowClasses({ interactive: true, className: 'py-3' })}
              >
                <SubjectMark code={item.subjectCode} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-semibold leading-snug text-foreground-strong">
                    {item.subjectCode}
                  </span>
                  <span className="mt-0.5 block font-mono text-[12px] tabular-nums text-muted">
                    {item.answeredCount || 0}/{item.totalQuestions} answered
                  </span>
                </span>
                <span className="shrink-0 text-[13px] font-bold text-score-mid">Resume</span>
                <ChevronRight size={16} className="-mr-1 shrink-0 text-muted" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </Section>
      )}

      {recent.length > 0 && (
        <Section
          title="Recent papers"
          action={
            <Link
              to="/history"
              className="tf-pressable rounded-full py-1 pl-2 text-[13px] font-semibold text-link"
            >
              All papers
            </Link>
          }
        >
          <div className={sheetClasses()}>
            {recent.map((item) => (
              <Link
                key={item.id}
                to={`/exam/${item.id}/result`}
                className={sheetRowClasses({ interactive: true, className: 'py-3' })}
              >
                <SubjectMark code={item.subjectCode} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-semibold leading-snug text-foreground-strong">
                    {item.subjectCode}
                  </span>
                  <span className="mt-0.5 block font-mono text-[12px] tabular-nums text-muted">
                    {formatDay(item.submittedAt)} &middot; {item.correctCount}/{item.totalQuestions}
                  </span>
                </span>
                <span
                  className={cn(
                    'shrink-0 text-[17px] font-extrabold tabular-nums',
                    scoreTone(item.score),
                  )}
                >
                  {item.score}%
                </span>
              </Link>
            ))}
          </div>
        </Section>
      )}

      {/*
        The rest of the app, as three ruled rows rather than four decorative
        tiles. Same destinations, a third of the height, and the unbuilt one is
        labelled honestly instead of wearing a "New" badge.
      */}
      <Section title="More">
        <div className={sheetClasses()}>
          <MoreRow to="/progress" label="Progress" note="Scores by subject" />
          <MoreRow to="/achievements" label="Achievements" note="Badges you've earned" />
          <MoreRow to="/ai-study" label="AI study tools" note="Not ready yet" muted />
        </div>
      </Section>
    </Screen>
  );
}

/* ---------------------------------------------------------------------- */

/**
 * The hero. One figure at display size, its sample size directly under it, and
 * a labelled bar. Everything that follows is a ruled row on the same sheet, so
 * the whole block reads as a single object.
 */
function ReadinessSheet({ readiness, weakest, strongest, streakCount, streakDays, flo }) {
  const { score, totalPapers, totalCorrect, totalAnswered, trend } = readiness;

  return (
    <div className={cn(sheetClasses(), 'mt-5')}>
      <div className="relative px-4 pb-5 pt-4">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
            Readiness
          </h2>
          {trend ? <Trend delta={trend.delta} /> : null}
        </div>

        {/*
          Flo sits beside the figure, reacting to it. Expression only: the
          animation is a 4px float, because this screen is opened many times a
          day and anything livelier would be noise by the third day. The
          performances are saved for the result screen.

          Hidden below 360px, where the figure needs the full width.
        */}
        <Mascot
          mood={flo.mood}
          animation={flo.animation}
          size={68}
          className="absolute right-3 top-14 hidden text-primary/70 xs:block"
        />

        <p
          className={cn(
            'mt-2 font-heading text-[4rem] font-extrabold leading-[0.9] tracking-[-0.04em] tabular-nums',
            scoreTone(score),
          )}
        >
          {score}
          <span className="text-[2rem] tracking-normal">%</span>
        </p>

        {/*
          Sample size sits directly under the figure, never in a tooltip. A
          score with no denominator can flatter a single lucky attempt. The
          band is spelled out in words so the reading never depends on being
          able to tell the red figure from the green one.
        */}
        {/*
          Two short lines, not one long one.

          As a single run — "needs work · across 15 papers · 18 of 78 correct" —
          it wrapped on every phone width and orphaned "correct" on its own
          line, which reads as a layout accident rather than a sentence. Split,
          each line is short enough that it cannot wrap, and the verdict gets
          the emphasis it deserves instead of being the first item in a list.

          "18/78" rather than "18 of 78": the slash is the notation this app
          already uses for counts (6/6 in the recent-papers rows), it is
          shorter, and it sets in tabular figures.
        */}
        <p className={cn('mt-2 text-[13px] font-bold', scoreTone(score))}>{scoreLabel(score)}</p>
        <p className="mt-0.5 font-mono text-[12px] tabular-nums text-muted">
          {totalPapers} {totalPapers === 1 ? 'paper' : 'papers'}
          {totalCorrect !== null && totalAnswered ? (
            <> &middot; {totalCorrect}/{totalAnswered} correct</>
          ) : null}
        </p>

        <ScoreBar score={score} />
      </div>

      {weakest ? (
        <SubjectEdgeRow
          kind="Weakest"
          subject={weakest}
          hint="Practise next"
          actionable
        />
      ) : null}
      {strongest ? <SubjectEdgeRow kind="Strongest" subject={strongest} /> : null}

      <StreakRow count={streakCount} days={streakDays} />
    </div>
  );
}

/**
 * A real bar, not a decorative arc: zero-based, full 0-100 track, with the
 * value stated in text beside it rather than hidden behind a hover.
 */
function ScoreBar({ score }) {
  return (
    <div
      className="mt-4 h-1.5 w-full overflow-hidden rounded-sm bg-surface-strong"
      role="img"
      aria-label={`${score} percent out of 100`}
    >
      <div
        className={cn(
          'h-full rounded-sm transition-[width] duration-[var(--duration-lg)] ease-[var(--ease-out)] motion-reduce:transition-none',
          scoreFill(score),
        )}
        style={{ width: `${Math.max(0, Math.min(100, score))}%` }}
      />
    </div>
  );
}

/**
 * The trend badge.
 *
 * Promoted from a 12px mono line to a tinted pill, because it is the only
 * thing on the sheet that says whether the big figure is moving in the right
 * direction, and at 12px it read as a footnote to the number rather than a
 * verdict on it.
 *
 * It carries the one entrance animation on this screen. Justified narrowly:
 * the purpose is state indication, and the badge is the single element whose
 * value the returning student has not already seen. It rises in once, 260ms,
 * after the figure has painted. Nothing else on the dashboard animates on
 * mount, so this reads as emphasis rather than as the page assembling itself.
 *
 * Direction is carried by an arrow and an explicit sign as well as colour, so
 * the reading survives both colour blindness and a greyscale screenshot.
 */
function Trend({ delta }) {
  const up = delta > 0;
  return (
    <p
      className={cn(
        'tf-rise-in flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1',
        'text-[15px] font-extrabold tabular-nums',
        up ? 'bg-success/10 text-score-good' : 'bg-danger/10 text-score-low',
      )}
      // The figure paints first, then the verdict on it lands.
      style={{ animationDelay: '120ms' }}
    >
      <ArrowUpRight
        size={16}
        strokeWidth={2.75}
        aria-hidden="true"
        className={cn('shrink-0', !up && 'rotate-90')}
      />
      {up ? '+' : ''}
      {delta} pts
      <span className="sr-only">
        {up ? 'improvement on' : 'decline from'} your earlier papers
      </span>
    </p>
  );
}

function SubjectEdgeRow({ kind, subject, hint, actionable }) {
  const body = (
    <>
      <span className="w-[5.25rem] shrink-0 whitespace-nowrap font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-muted">
        {kind}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-semibold text-foreground-strong">
          {subject.subjectCode}
        </span>
        <span className="mt-0.5 block font-mono text-[12px] tabular-nums text-muted">
          {hint ?? `${subject.attempts} ${subject.attempts === 1 ? 'paper' : 'papers'}`}
        </span>
      </span>
      <span
        className={cn(
          'shrink-0 text-[17px] font-extrabold tabular-nums',
          scoreTone(subject.averageScore),
        )}
      >
        {subject.averageScore}%
      </span>
      {actionable ? (
        <ChevronRight size={16} className="-mr-1 shrink-0 text-muted" aria-hidden="true" />
      ) : null}
    </>
  );

  if (!actionable) {
    return <div className={sheetRowClasses({ className: 'py-3' })}>{body}</div>;
  }

  return (
    <Link
      to="/courses"
      aria-label={`Practise ${subject.subjectCode}, your weakest subject at ${subject.averageScore} percent`}
      className={sheetRowClasses({ interactive: true, className: 'py-3' })}
    >
      {body}
    </Link>
  );
}

/**
 * Streak, demoted to one row. It is a habit signal, not a readiness signal, so
 * it sits at the bottom of the sheet rather than at the top of the screen.
 */
function StreakRow({ count, days }) {
  return (
    <div className={sheetRowClasses({ className: 'py-3' })}>
      <span className="w-[5.25rem] shrink-0 whitespace-nowrap font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-muted">
        Streak
      </span>
      <span className="mr-auto flex items-center gap-1.5 whitespace-nowrap">
        <Flame
          size={16}
          aria-hidden="true"
          className={count > 0 ? 'shrink-0 fill-warning text-warning' : 'shrink-0 text-muted'}
        />
        <span
          className={cn(
            'text-[15px] font-semibold tabular-nums',
            count > 0 ? 'text-foreground-strong' : 'text-muted',
          )}
        >
          {count === 0 ? 'None yet' : `${count} ${count === 1 ? 'day' : 'days'}`}
        </span>
      </span>
      {/*
        The week calendar is supplementary: the row already states the streak
        in words, which is the actual information. Below 360px there is not
        enough width for the label column, the count and seven day cells, so
        the calendar is dropped rather than clipped.
      */}
      <span className="hidden shrink-0 xs:flex" aria-hidden="true">
        {WEEK_DAYS.map((day, i) => (
          <span
            key={i}
            className={cn(
              'flex size-[18px] items-center justify-center rounded text-[10px] font-bold',
              // Not `text-muted/60`: at 60% opacity the inactive letters drop
              // to 1.2:1 on the dark surface. The active/inactive distinction
              // is carried by the tinted background, so the letters themselves
              // can stay at full muted and remain readable in both themes.
              days.includes(i) ? 'bg-warning/15 text-score-mid' : 'text-muted',
            )}
          >
            {day}
          </span>
        ))}
      </span>
    </div>
  );
}

/**
 * First-run state. A brand-new student has no readiness figure, so instead of
 * printing a meaningless 0% the sheet says what belongs here and offers the
 * one action that creates it, naming a real course and its real question
 * count.
 */
function FirstPaperSheet({ subjects }) {
  const suggestion = subjects?.find((s) => (s.questionCount ?? 0) > 0);

  return (
    <div className={cn(sheetClasses(), 'mt-5')}>
      <div className="flex items-center gap-4 px-4 pb-5 pt-4">
        <div className="min-w-0 flex-1">
          <h2 className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
            Readiness
          </h2>
          {/*
            An em-dash placeholder where the figure will be. Not "0%": a student
            who has not sat a paper has not scored zero, and opening the app to a
            red nought is a discouraging lie about where they stand.
          */}
          <p className="mt-2 font-heading text-[4rem] font-extrabold leading-[0.9] tracking-[-0.04em] text-muted/30">
            &mdash;&mdash;
          </p>
          <p className="mt-2 max-w-[30ch] text-[13px] leading-relaxed text-muted">
            Sit one paper and your score lands here, with the subjects you should
            practise next.
          </p>
        </div>
        {/*
          The mascot earns its place on exactly this screen: a first-run empty
          state is the one moment with nothing to read and no data to respect.
          It does not appear once the student has a score.
        */}
        <Mascot mood="happy" size={96} className="hidden text-primary xs:block" />
      </div>

      {suggestion ? (
        <Link
          to="/courses"
          className={sheetRowClasses({ interactive: true, className: 'py-3.5' })}
        >
          <SubjectMark code={suggestion.code} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[15px] font-semibold leading-snug text-foreground-strong">
              {suggestion.title}
            </span>
            <span className="mt-0.5 block font-mono text-[12px] tabular-nums text-muted">
              {suggestion.code} &middot; {suggestion.questionCount} questions
            </span>
          </span>
          <span className="shrink-0 text-[13px] font-bold text-link">Start</span>
          <ChevronRight size={16} className="-mr-1 shrink-0 text-muted" aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  );
}

/* ---------------------------------------------------------------------- */

function SubjectMark({ code }) {
  const { Icon, accent } = subjectMeta(code);
  return (
    <span
      className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg', accent)}
      aria-hidden="true"
    >
      <Icon size={16} />
    </span>
  );
}

function Section({ title, action, children }) {
  return (
    <section className="mt-7">
      <div className="mb-2 flex min-h-7 items-center justify-between gap-3 px-1">
        <h2 className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function MoreRow({ to, label, note, muted }) {
  return (
    <Link to={to} className={sheetRowClasses({ interactive: true, className: 'py-3' })}>
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            'block truncate text-[15px] font-medium',
            muted ? 'text-muted' : 'text-foreground-strong',
          )}
        >
          {label}
        </span>
        <span className="mt-0.5 block text-[12px] text-muted">{note}</span>
      </span>
      <ChevronRight size={16} className="-mr-1 shrink-0 text-muted" aria-hidden="true" />
    </Link>
  );
}

export default DashboardPage;

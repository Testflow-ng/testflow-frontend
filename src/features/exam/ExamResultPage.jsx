import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Award,
  Bookmark,
  CheckCircle2,
  ChevronDown,
  MinusCircle,
  Printer,
  RotateCcw,
  Share2,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { Alert, Badge, Button, SegmentedControl } from '../../components/ui/index.js';
import { sheetClasses, sheetRowClasses } from '../../components/ui/surfaces.js';
import ShareDialog from '../../components/share/ShareDialog.jsx';
import ReportQuestionDialog from './ReportQuestionDialog.jsx';
import { useBookmarkedIds, useToggleBookmark } from '../bookmarks/useBookmarks.js';
import StatCard from '../../components/data/StatCard.jsx';
import OptionRow from '../../components/exam/OptionRow.jsx';
import Mascot from '../../components/brand/Mascot.jsx';
import Confetti from '../../components/brand/Confetti.jsx';
import { moodForScore } from '../../components/brand/mascotMood.js';
import { useStats } from '../analytics/useStats.js';
import { useNewAchievements } from '../analytics/useNewAchievements.js';
import AchievementUnlock from '../analytics/AchievementUnlock.jsx';
import PageLoader from '../../components/PageLoader.jsx';
import MathText from '../../components/MathText.jsx';
import { cn } from '../../utils/cn.js';
import { useState } from 'react';
import { useAuth } from '../auth/useAuth.js';
import { useExamResult } from './useExamResult.js';
import { examApi } from './api.js';

const letter = (index) => String.fromCharCode(65 + index);

/** The caption that travels with the link. Short: it is a chat message, not a press release. */
const shareText = (result) =>
  `${result.score}% in ${result.subjectCode} on TestFlow. ${result.correctCount}/${result.totalQuestions} correct.`;

// `color` uses the AA-safe score text roles; the tints stay on the base brand
// colours, which are correct as fills. See utils/score.js.
const scoreTone = (score) => {
  if (score >= 70)
    return {
      color: 'text-score-good',
      bg: 'bg-success/10',
      border: 'border-success/20',
      label: 'Great job',
    };
  if (score >= 50)
    return {
      color: 'text-score-mid',
      bg: 'bg-warning/10',
      border: 'border-warning/20',
      label: 'Keep practicing',
    };
  return {
    color: 'text-score-low',
    bg: 'bg-danger/10',
    border: 'border-danger/20',
    label: 'Needs work',
  };
};

function ExamResultPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isPostUtme = searchParams.get('type') === 'post-utme';
  const { user } = useAuth();

  const navigate = useNavigate();
  const [shareOpen, setShareOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [reportFor, setReportFor] = useState(null);

  /*
    Corrections are where a wrong answer key gets noticed, so saving a question and reporting
    it live here as well as in the paper. Same query, same dialog: a question bookmarked while
    reviewing is already in the profile by the time the student gets there.
  */
  const bookmarkedIds = useBookmarkedIds();
  const toggleBookmark = useToggleBookmark();

  /** What the bookmarks list needs to draw a row before the server answers. */
  const bookmarkPayload = (question) => ({
    id: question.id,
    subjectCode: result?.subjectCode,
    stem: question.stem,
    /* Copied, not aliased: this object goes into the react-query cache, and it has no
       business holding a reference into the session the exam is still editing. */
    options: [...question.options],
    topic: question.topic ?? null,
  });

  /*
    Badges are derived from stats, so this reads the stats that were just
    refreshed by the submit. Any badge the attempt unlocked is celebrated here,
    at the moment it was earned, rather than surfacing on a later screen with
    no visible cause.
  */
  const { data: stats } = useStats();
  const { fresh: newBadges, acknowledge } = useNewAchievements(stats);

  const {
    data: result,
    isLoading,
    isError,
    error,
  } = useExamResult(id, isPostUtme);

  /*
    The Post-UTME admission aggregate: JAMB (50%), O'Level (40%), Post-UTME (10%).

    Computed straight through rather than memoised. It is three arithmetic operations on
    values the component already has, and a `useMemo` here only gives the compiler something
    to disagree with about the session object's lifetime.
  */
  const aggregate = (() => {
    if (!isPostUtme || !result || !user) return null;
    const jamb = (user.utmeData?.jambScore || 0) / 8;
    const oLevel = user.utmeData?.oLevelPoints || 0;
    const postUtme = result.totalScore || 0;
    return (jamb + oLevel + postUtme).toFixed(2);
  })();

  /*
    The share link is minted when the dialog opens, not when the page loads: most students
    never share, and the token should not exist until it is wanted. `staleTime: Infinity`
    keeps one link per attempt for the life of the page, so reopening the dialog does not
    mint a second one.
  */
  const {
    data: share,
    isLoading: shareLoading,
    isError: shareFailed,
    error: shareFailure,
  } = useQuery({
    queryKey: ['examShare', id],
    queryFn: () => examApi.share(id),
    enabled: shareOpen,
    retry: false,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
  const shareError = shareFailed ? shareFailure : null;

  const shareCaption = result ? shareText(result) : '';
  if (isLoading) {
    return <PageLoader label="Scoring your exam" />;
  }
  if (isError) {
    return (
      <div className="mx-auto w-full max-w-xl px-5 py-10">
        <Alert variant="danger">
          {error?.message ?? 'These results could not be loaded.'}
        </Alert>
        <Button
          variant="outline"
          className="mt-4 w-full"
          onClick={() => navigate('/dashboard')}
        >
          Back to dashboard
        </Button>
      </div>
    );
  }

  const tone = scoreTone(result.score);
  const reaction = moodForScore(result.score);
  const wrongCount = result.totalQuestions - result.correctCount;
  const skippedCount = result.questions.filter(q => q.selectedOption === null && !q.isCorrect).length;
  const wrongOnly = Math.max(0, wrongCount - skippedCount);

  /*
    Corrections are a reading exercise, not a scroll. The filter is the whole
    reason the section is usable on a 50-question paper: "show me only what I
    got wrong" is the one job a student has on this screen.
  */
  const visibleQuestions = result.questions.filter((question) => {
    if (filter === 'all') return true;
    if (filter === 'skipped') return question.selectedOption === null;
    return !question.isCorrect && question.selectedOption !== null;
  });

  return (
    <div className="mx-auto w-full max-w-xl flex-1 pt-5 tf-gutter tf-nav-clearance sm:pt-6">
      {/*
        Score hero.

        Flo reacts to the actual result: celebrating over 85, thumbs up on a
        pass, waving encouragement on a borderline, and slumping on a fail. The
        confetti only fires on a pass, because confetti over a 31% would be the
        app failing to read the room.

        `relative` + `overflow-hidden` keeps the confetti inside the card rather
        than over the whole page, so it never lands on the review list below.
      */}
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl border px-5 pb-7 pt-6 text-center',
          tone.bg,
          tone.border,
        )}
      >
        <Confetti active={reaction.confetti} />

        <Mascot
          mood={reaction.mood}
          animation={reaction.animation}
          size={104}
          className={cn('relative mx-auto', tone.color)}
        />

        <p className="relative mt-2 font-mono text-xs font-bold uppercase tracking-widest text-muted">
          {result.subjectCode}
        </p>
        <p
          className={cn(
            'mt-3 font-heading text-6xl font-extrabold leading-none tabular-nums tracking-tight',
            tone.color,
          )}
        >
          {result.score}%
        </p>
        <p className="mt-2.5 text-sm font-medium text-muted">
          {result.correctCount} of {result.totalQuestions} correct
        </p>
        {/* Flo's line, not a bare verdict. "Needs work" states the obvious;
            "Try it again while it is fresh" names the next move. */}
        <p className={cn('relative mt-2.5 text-[14px] font-semibold', tone.color)}>
          {reaction.line}
        </p>
      </div>

      {isPostUtme && aggregate && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-3xl bg-foreground p-6 text-background overflow-hidden relative"
        >
          <div className="absolute -right-6 -top-6 size-24 bg-primary/20 rounded-full blur-2xl" />
          <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-background/60">Admission Aggregate</span>
             </div>
             <Award size={18} className="text-primary" />
          </div>
          <div className="flex items-baseline gap-2">
             <h3 className="text-4xl font-black tracking-tight">{aggregate}%</h3>
             <span className="text-xs font-bold text-background/40">/ 100.00</span>
          </div>
          <p className="mt-3 text-[10px] leading-relaxed text-background/60">
            Calculated using the 50:40:10 formula (JAMB: {((user.utmeData?.jambScore || 0)/8).toFixed(2)} + Post-UTME: {result.totalScore.toFixed(2)} + O-Level: {(user.utmeData?.oLevelPoints || 0).toFixed(2)}).
          </p>
        </motion.div>
      )}

      {/* Stats strip */}
      <div className="mt-3 grid grid-cols-3 gap-2.5">
        <StatCard label="Correct" value={result.correctCount} tone="success" icon={CheckCircle2} />
        <StatCard label="Wrong" value={wrongOnly} tone="warning" icon={XCircle} />
        <StatCard label="Skipped" value={skippedCount} tone="sage" icon={MinusCircle} />
      </div>

      {/*
        Actions stack full-width on phones. Two 50%-width buttons on a 375px
        screen leave ~160px each, which truncates "Practice again" and puts
        both targets in the awkward middle of the screen rather than in easy
        thumb reach.
      */}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Button
          size="lg"
          onClick={() => navigate(`/exam/${id}/report${isPostUtme ? '?type=post-utme' : ''}`)}
          leadingIcon={<Printer size={16} aria-hidden="true" />}
          className="sm:flex-1"
        >
          Report sheet
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => navigate('/courses')}
          leadingIcon={<RotateCcw size={16} aria-hidden="true" />}
          className="sm:flex-1"
        >
          Practice again
        </Button>
      </div>

      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <Button
          variant="outline"
          size="lg"
          onClick={() => setShareOpen(true)}
          leadingIcon={<Share2 size={16} aria-hidden="true" />}
          className="sm:flex-1"
        >
          Share result
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => navigate('/dashboard')}
          className="sm:flex-1"
        >
          Dashboard
        </Button>
      </div>

      {/* Badge celebration, after the score has had its moment. */}
      <AchievementUnlock
        achievements={newBadges}
        open={newBadges.length > 0}
        onClose={acknowledge}
      />

      {/*
        Share.

        There is no canvas here any more, and no meme. A result is shared as a
        *link*: the backend serves that URL as a page carrying the Open Graph
        tags, so WhatsApp, Telegram and X render a card with the score on it.
        That is also why the link is minted server-side rather than built from
        `window.location` .the preview is fetched by the crawler, not by us.
      */}
      <ShareDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        title="Share your result"
        description={`Anyone who opens this link sees your score card for ${result.subjectCode}.`}
        url={share?.url}
        caption={shareCaption}
        loading={shareLoading}
        error={shareError}
      />

      {/*
        Corrections.

        The same `OptionRow` states the runtime uses (`correct` / `wrong` /
        `missed`) are what the student reads here, so the review is the paper
        they sat with the answers filled in, not a second rendering of it.
      */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[15px] font-bold tracking-tight text-foreground-strong">
          Corrections
        </h2>
        <SegmentedControl
          size="sm"
          label="Filter corrections"
          value={filter}
          onValueChange={setFilter}
          options={[
            { value: 'all', label: `All ${result.questions.length}` },
            { value: 'wrong', label: `Wrong ${wrongOnly}` },
            { value: 'skipped', label: `Skipped ${skippedCount}` },
          ]}
        />
      </div>

      {visibleQuestions.length === 0 ? (
        <p className="mt-3 rounded-[20px] border border-border bg-surface p-4 text-sm font-medium text-muted">
          {filter === 'wrong'
            ? 'Nothing wrong on this paper.'
            : 'You answered every question.'}
        </p>
      ) : (
        <ol className="mt-3 flex flex-col gap-2">
          {visibleQuestions.map((question) => (
            <CorrectionItem
              key={question.index}
              question={question}
              defaultOpen={filter !== 'all' && visibleQuestions.length <= 5}
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
            />
          ))}
        </ol>
      )}

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

const VERDICTS = {
  correct: { label: 'Correct', variant: 'success' },
  skipped: { label: 'Skipped', variant: 'warning' },
  wrong: { label: 'Wrong', variant: 'danger' },
};

const verdictOf = (question) =>
  question.isCorrect ? 'correct' : question.selectedOption === null ? 'skipped' : 'wrong';

/**
 * One correction. `OptionRow` already has the three review states a marked
 * paper needs .`correct` (you picked it), `wrong` (you picked it, it's wrong)
 * and `missed` (you didn't pick it and it was the answer), so the mapping here
 * is the mapping the runtime uses, read in reverse.
 */
function CorrectionItem({ question, defaultOpen, bookmarked = false, onBookmark, onReport }) {
  const [expanded, setExpanded] = useState(defaultOpen);
  const verdict = VERDICTS[verdictOf(question)];

  return (
    <li className={sheetClasses()}>
      <button
        type="button"
        onClick={() => setExpanded((open) => !open)}
        aria-expanded={expanded}
        className={sheetRowClasses({ interactive: true, className: 'items-start py-3.5' })}
      >
        <MathText className="min-w-0 flex-1 text-[15px] font-medium leading-snug text-foreground-strong">
          {`${question.index + 1}. ${question.stem}`}
        </MathText>
        <Badge variant={verdict.variant} className="mt-0.5 shrink-0">
          {verdict.label}
        </Badge>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className={cn(
            'mt-0.5 shrink-0 text-muted transition-transform duration-[var(--duration-sm)] ease-[var(--transition-ease)]',
            expanded && 'rotate-180',
          )}
        />
      </button>

      {expanded && (
        <div className="flex flex-col gap-2 p-4">
          {question.options.map((option, index) => {
            const isCorrect = index === question.correctOption;
            const isChosen = index === question.selectedOption;
            const state = isCorrect
              ? isChosen
                ? 'correct'
                : 'missed'
              : isChosen
                ? 'wrong'
                : 'idle';
            return (
              <OptionRow
                key={index}
                label={letter(index)}
                name={`correction-${question.index}`}
                state={state}
                disabled
              >
                {option}
              </OptionRow>
            );
          })}

          {question.explanation && (
            <Alert variant="info" className="mt-1 text-[13px] leading-relaxed">
              <span className="font-bold text-foreground-strong">Explanation. </span>
              <MathText className="inline">{question.explanation}</MathText>
            </Alert>
          )}

          {/* The two things a student wants to do with a question they got wrong: keep it,
              or tell us the answer key is broken. Both sit in the expanded panel, because
              the collapsed row has to stay readable at a glance. */}
          {(onBookmark || onReport) && (
            <div className="mt-1 flex flex-wrap items-center gap-1">
              {onBookmark && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBookmark}
                  aria-pressed={bookmarked}
                  leadingIcon={
                    <Bookmark
                      size={15}
                      aria-hidden="true"
                      className={cn(bookmarked && 'fill-current text-primary')}
                    />
                  }
                  className={cn(bookmarked && 'text-primary')}
                >
                  {bookmarked ? 'Saved' : 'Save question'}
                </Button>
              )}
              {onReport && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onReport}
                  leadingIcon={<AlertTriangle size={15} aria-hidden="true" />}
                >
                  Report it
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </li>
  );
}

export default ExamResultPage;

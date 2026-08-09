import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Check, ChevronDown, Download, RotateCcw, Share2, X, TrendingUp, Sparkles, Award } from 'lucide-react';
import { Alert, Button, Modal, Card } from '../../components/ui/index.js';
import { cardClasses, listRowClasses } from '../../components/ui/surfaces.js';
import Mascot from '../../components/brand/Mascot.jsx';
import Confetti from '../../components/brand/Confetti.jsx';
import { moodForScore } from '../../components/brand/mascotMood.js';
import { useStats } from '../analytics/useStats.js';
import { useNewAchievements } from '../analytics/useNewAchievements.js';
import AchievementUnlock from '../analytics/AchievementUnlock.jsx';
import PageLoader from '../../components/PageLoader.jsx';
import MathText from '../../components/MathText.jsx';
import { cn } from '../../utils/cn.js';
import { examApi } from './api.js';
import { useCallback, useRef, useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';

const letter = (index) => String.fromCharCode(65 + index);

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

const MEME_LINES = {
  high: [
    'Omo you too much!',
    'Brain dey work overtime',
    'Scholar mode activated',
    'Who born you? Legend!',
    'E be like say you swallow textbook',
  ],
  mid: [
    'Almost there, push am!',
    'No be bad, but e fit better',
    'You dey try sha',
    'Small more effort, you go blow',
    'Na pass be pass, no shame',
  ],
  low: [
    'Omoh try oo',
    'Get joor, go read!',
    'Stop playing, open your book',
    'Wetin be this nau?',
    'Na only vibes you carry enter hall?',
    'Your village people dey laugh',
    'Even guess-work no save you',
  ],
};

function getMemeText(score) {
  const tier = score >= 70 ? 'high' : score >= 50 ? 'mid' : 'low';
  const lines = MEME_LINES[tier];
  return lines[Math.floor(Math.random() * lines.length)];
}

function drawResultCard(canvas, result, memeMode) {
  const ctx = canvas.getContext('2d');
  const w = 720;
  const h = memeMode ? 480 : 400;
  canvas.width = w;
  canvas.height = h;

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = '#141414';
  ctx.beginPath();
  ctx.roundRect(20, 20, w - 40, h - 40, 24);
  ctx.fill();

  ctx.strokeStyle = '#262626';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(20, 20, w - 40, h - 40, 24);
  ctx.stroke();

  const scoreColor = result.score >= 70 ? '#22c55e' : result.score >= 50 ? '#eab308' : '#ef4444';

  ctx.fillStyle = '#a3a3a3';
  ctx.font = 'bold 11px system-ui, sans-serif';
  ctx.letterSpacing = '3px';
  ctx.textAlign = 'center';
  ctx.fillText(result.subjectCode.toUpperCase(), w / 2, 70);
  ctx.letterSpacing = '0px';

  ctx.fillStyle = scoreColor;
  ctx.font = 'bold 72px system-ui, sans-serif';
  ctx.fillText(`${result.score}%`, w / 2, 155);

  ctx.fillStyle = '#a3a3a3';
  ctx.font = '500 14px system-ui, sans-serif';
  ctx.fillText(`${result.correctCount} of ${result.totalQuestions} correct`, w / 2, 185);

  if (memeMode) {
    const memeText = getMemeText(result.score);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px system-ui, sans-serif';

    const maxWidth = w - 100;
    const words = memeText.split(' ');
    let lines = [];
    let currentLine = '';
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (ctx.measureText(testLine).width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine);

    const lineHeight = 36;
    const startY = 240;
    lines.forEach((line, i) => {
      ctx.fillText(line, w / 2, startY + i * lineHeight);
    });

    ctx.fillStyle = scoreColor;
    ctx.font = 'bold 10px system-ui, sans-serif';
    ctx.letterSpacing = '2px';
    ctx.fillText('TESTFLOW', w / 2, h - 50);
    ctx.letterSpacing = '0px';
  } else {
    const tone = result.score >= 70 ? 'Great job' : result.score >= 50 ? 'Keep practicing' : 'Needs work';
    ctx.fillStyle = scoreColor;
    ctx.font = 'bold 14px system-ui, sans-serif';
    ctx.fillText(tone, w / 2, 215);

    const barY = 250;
    const barW = w - 160;
    const barX = 80;
    ctx.fillStyle = '#262626';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, 8, 4);
    ctx.fill();
    ctx.fillStyle = scoreColor;
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW * (result.score / 100), 8, 4);
    ctx.fill();

    const wrongCount = result.totalQuestions - result.correctCount;
    const stats = [
      { label: 'Correct', value: result.correctCount, color: '#22c55e' },
      { label: 'Wrong', value: wrongCount, color: '#ef4444' },
    ];
    const statY = 300;
    stats.forEach((s, i) => {
      const sx = w / 2 + (i === 0 ? -100 : 50);
      ctx.fillStyle = s.color;
      ctx.font = 'bold 28px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(s.value, sx, statY);
      ctx.fillStyle = '#a3a3a3';
      ctx.font = '500 11px system-ui, sans-serif';
      ctx.fillText(s.label, sx, statY + 18);
    });

    ctx.fillStyle = scoreColor;
    ctx.font = 'bold 10px system-ui, sans-serif';
    ctx.letterSpacing = '2px';
    ctx.textAlign = 'center';
    ctx.fillText('TESTFLOW', w / 2, h - 50);
    ctx.letterSpacing = '0px';
  }
}

function ExamResultPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isPostUtme = searchParams.get('type') === 'post-utme';
  const { user } = useAuth();

  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [shareOpen, setShareOpen] = useState(false);

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
  } = useQuery({
    queryKey: ['examResult', id],
    queryFn: async () => {
      if (isPostUtme) {
        const res = await fetch(`/api/post-utme/${id}/submit`, { method: 'POST' });
        if (!res.ok) throw new Error('Failed to load Post-UTME result');
        const data = await res.json();
        return {
          ...data.session,
          score: Math.round((data.session.totalScore / 40) * 100),
          correctCount: data.session.totalScore,
          subjectCode: 'OAU POST-UTME'
        };
      }
      return examApi.result(id);
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  const aggregate = useMemo(() => {
    if (!isPostUtme || !result || !user) return null;
    const jamb = (user.utmeData?.jambScore || 0) / 8;
    const oLevel = user.utmeData?.oLevelPoints || 0;
    const postUtme = result.totalScore || 0;
    return (jamb + oLevel + postUtme).toFixed(2);
  }, [isPostUtme, result, user]);

  const downloadCard = useCallback((memeMode) => {
    if (!result || !canvasRef.current) return;
    drawResultCard(canvasRef.current, result, memeMode);
    const link = document.createElement('a');
    link.download = memeMode
      ? `testflow-${result.subjectCode}-meme.png`
      : `testflow-${result.subjectCode}-result.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
    setShareOpen(false);
  }, [result]);

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

  return (
    <div className="mx-auto w-full max-w-xl flex-1 pt-5 tf-gutter tf-nav-clearance sm:pt-6">
      <canvas ref={canvasRef} className="hidden" />

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
            Calculated using OAU's 50:40:10 formula (JAMB: {((user.utmeData?.jambScore || 0)/8).toFixed(2)} + Post-UTME: {result.totalScore.toFixed(2)} + O-Level: {(user.utmeData?.oLevelPoints || 0).toFixed(2)}).
          </p>
        </motion.div>
      )}

      {/* Stats strip */}
      <div className="mt-3 grid grid-cols-3 gap-2.5">
        <ResultStat value={result.correctCount} label="Correct" tone="text-score-good" />
        <ResultStat value={wrongCount - skippedCount} label="Wrong" tone="text-score-low" />
        <ResultStat value={skippedCount} label="Skipped" tone="text-muted" />
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
          onClick={() => navigate('/courses')}
          leadingIcon={<RotateCcw size={16} aria-hidden="true" />}
          className="sm:order-2 sm:flex-1"
        >
          Practice again
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => navigate('/dashboard')}
          className="sm:order-1 sm:flex-1"
        >
          Dashboard
        </Button>
      </div>

      {/* Share button */}
      <button
        type="button"
        onClick={() => setShareOpen(true)}
        className="tf-pressable mt-2 flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-border text-sm font-semibold text-foreground-strong active:bg-surface-strong"
      >
        <Share2 size={16} aria-hidden="true" />
        Share result
      </button>

      {/* Badge celebration, after the score has had its moment. */}
      <AchievementUnlock
        achievements={newBadges}
        open={newBadges.length > 0}
        onClose={acknowledge}
      />

      {/* Share modal */}
      <Modal
        open={shareOpen}
        onOpenChange={setShareOpen}
        title="Share your result"
        size="sm"
      >
        <div className="flex flex-col gap-2 py-1">
          <button
            type="button"
            onClick={() => downloadCard(false)}
            className={listRowClasses({ className: 'p-4' })}
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Download size={18} className="text-primary" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block text-[15px] font-semibold text-foreground-strong">
                Download result card
              </span>
              <span className="mt-0.5 block text-[13px] text-muted">Clean scorecard image</span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => downloadCard(true)}
            className={listRowClasses({ className: 'p-4' })}
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-warning/10 text-lg">
              😂
            </span>
            <span className="min-w-0">
              <span className="block text-[15px] font-semibold text-foreground-strong">
                Meme download
              </span>
              <span className="mt-0.5 block text-[13px] text-muted">With Naija commentary</span>
            </span>
          </button>
        </div>
      </Modal>

      {/* Review */}
      <h2 className="mt-8 text-[15px] font-bold tracking-tight text-foreground-strong">
        Review answers
      </h2>
      <ol className="mt-3 flex flex-col gap-2">
        {result.questions.map((question) => (
          <ReviewItem key={question.index} question={question} />
        ))}
      </ol>
    </div>
  );
}

function ResultStat({ value, label, tone }) {
  return (
    <div className={cardClasses({ padding: 'none', className: 'flex flex-col items-center py-3' })}>
      <span className={cn('text-xl font-extrabold leading-none tabular-nums', tone)}>{value}</span>
      <span className="mt-1.5 text-[11px] font-medium leading-none text-muted">{label}</span>
    </div>
  );
}

function ReviewItem({ question }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <li className={cardClasses({ padding: 'none', className: 'overflow-hidden' })}>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        className="tf-pressable flex w-full items-start justify-between gap-3 p-4 text-left active:bg-surface-strong"
      >
        <MathText className="flex-1 text-[15px] font-medium leading-snug text-foreground-strong">
          {`${question.index + 1}. ${question.stem}`}
        </MathText>
        <div className="flex shrink-0 items-center gap-2">
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-[11px] font-bold',
              question.isCorrect ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger',
            )}
          >
            {question.isCorrect
              ? 'Correct'
              : question.selectedOption === null
                ? 'Skipped'
                : 'Wrong'}
          </span>
          <ChevronDown
            size={16}
            aria-hidden="true"
            className={cn(
              'text-muted transition-transform duration-[var(--duration-sm)] ease-[var(--transition-ease)]',
              expanded && 'rotate-180',
            )}
          />
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border px-4 pb-4 pt-3">
          <div className="flex flex-col gap-2">
            {question.options.map((option, index) => {
              const isCorrect = index === question.correctOption;
              const isChosen = index === question.selectedOption;
              return (
                <div
                  key={index}
                  className={cn(
                    'flex items-center gap-2.5 rounded-xl border p-3 text-[14px] leading-snug',
                    isCorrect
                      ? 'border-success/30 bg-success/5 text-success'
                      : isChosen
                        ? 'border-danger/30 bg-danger/5 text-danger'
                        : 'border-border text-foreground',
                  )}
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-lg border border-current text-[11px] font-bold">
                    {letter(index)}
                  </span>
                  <MathText className="flex-1">{option}</MathText>
                  {isCorrect && (
                    <Check size={14} className="ml-auto shrink-0" />
                  )}
                  {isChosen && !isCorrect && (
                    <X size={14} className="ml-auto shrink-0" />
                  )}
                </div>
              );
            })}
          </div>

          {question.explanation && (
            <div className="mt-3 rounded-xl bg-surface-strong p-3 text-[13px] leading-relaxed text-muted">
              <span className="font-bold text-foreground-strong">
                Explanation.{' '}
              </span>
              <MathText className="inline">{question.explanation}</MathText>
            </div>
          )}
        </div>
      )}
    </li>
  );
}

export default ExamResultPage;

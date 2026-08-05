import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Check, ChevronDown, Download, RotateCcw, Share2, X } from 'lucide-react';
import { Alert, Button, Modal } from '../../components/ui/index.js';
import PageLoader from '../../components/PageLoader.jsx';
import MathText from '../../components/MathText.jsx';
import { cn } from '../../utils/cn.js';
import { examApi } from './api.js';
import { useCallback, useRef, useState } from 'react';

const letter = (index) => String.fromCharCode(65 + index);

const scoreTone = (score) => {
  if (score >= 70) return { color: 'text-success', bg: 'bg-success/10', border: 'border-success/20', label: 'Great job' };
  if (score >= 50) return { color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/20', label: 'Keep practicing' };
  return { color: 'text-danger', bg: 'bg-danger/10', border: 'border-danger/20', label: 'Needs work' };
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
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [shareOpen, setShareOpen] = useState(false);
  const {
    data: result,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['examResult', id],
    queryFn: () => examApi.result(id),
    retry: false,
    refetchOnWindowFocus: false,
  });

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
  const wrongCount = result.totalQuestions - result.correctCount;
  const skippedCount = result.questions.filter(q => q.selectedOption === null && !q.isCorrect).length;

  return (
    <div className="mx-auto w-full max-w-xl flex-1 px-5 pb-28 pt-6 lg:pb-8">
      <canvas ref={canvasRef} className="hidden" />

      {/* Score hero */}
      <div className={cn('rounded-2xl border p-6 text-center', tone.bg, tone.border)}>
        <p className="font-mono text-xs font-bold uppercase tracking-widest text-muted">
          {result.subjectCode}
        </p>
        <p
          className={cn(
            'mt-3 font-heading text-6xl font-extrabold tabular-nums tracking-tight',
            tone.color,
          )}
        >
          {result.score}%
        </p>
        <p className="mt-1 text-sm font-medium text-muted">
          {result.correctCount} of {result.totalQuestions} correct
        </p>
        <p className={cn('mt-2 text-xs font-bold', tone.color)}>{tone.label}</p>
      </div>

      {/* Stats strip */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center rounded-2xl border border-border bg-surface py-3">
          <span className="text-xl font-extrabold tabular-nums text-success">{result.correctCount}</span>
          <span className="mt-0.5 text-[10px] font-medium text-muted">Correct</span>
        </div>
        <div className="flex flex-col items-center rounded-2xl border border-border bg-surface py-3">
          <span className="text-xl font-extrabold tabular-nums text-danger">{wrongCount - skippedCount}</span>
          <span className="mt-0.5 text-[10px] font-medium text-muted">Wrong</span>
        </div>
        <div className="flex flex-col items-center rounded-2xl border border-border bg-surface py-3">
          <span className="text-xl font-extrabold tabular-nums text-muted">{skippedCount}</span>
          <span className="mt-0.5 text-[10px] font-medium text-muted">Skipped</span>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex gap-2">
        <Button
          variant="outline"
          size="md"
          onClick={() => navigate('/dashboard')}
          className="flex-1"
        >
          Dashboard
        </Button>
        <Button
          size="md"
          onClick={() => navigate('/courses')}
          leadingIcon={<RotateCcw size={16} />}
          className="flex-1"
        >
          Practice again
        </Button>
      </div>

      {/* Share button */}
      <button
        onClick={() => setShareOpen(true)}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-border py-3 text-sm font-semibold text-foreground-strong transition-colors hover:bg-surface-strong"
      >
        <Share2 size={16} />
        Share result
      </button>

      {/* Share modal */}
      <Modal
        open={shareOpen}
        onOpenChange={setShareOpen}
        title="Share your result"
        size="sm"
      >
        <div className="flex flex-col gap-3 pt-2">
          <button
            onClick={() => downloadCard(false)}
            className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 text-left transition-colors hover:bg-surface-strong"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Download size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground-strong">Download result card</p>
              <p className="text-xs text-muted">Clean scorecard image</p>
            </div>
          </button>
          <button
            onClick={() => downloadCard(true)}
            className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 text-left transition-colors hover:bg-surface-strong"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning/10">
              <span className="text-lg">😂</span>
            </div>
            <div>
              <p className="text-sm font-bold text-foreground-strong">Meme download</p>
              <p className="text-xs text-muted">With Naija commentary</p>
            </div>
          </button>
        </div>
      </Modal>

      {/* Review */}
      <h2 className="mt-8 text-sm font-bold text-foreground-strong">
        Review answers
      </h2>
      <ol className="mt-3 flex flex-col gap-3">
        {result.questions.map((question) => (
          <ReviewItem key={question.index} question={question} />
        ))}
      </ol>
    </div>
  );
}

function ReviewItem({ question }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <li className="rounded-2xl border border-border bg-surface overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-start justify-between gap-3 p-4 text-left"
      >
        <MathText className="text-sm font-medium text-foreground-strong flex-1">
          {`${question.index + 1}. ${question.stem}`}
        </MathText>
        <div className="flex shrink-0 items-center gap-2">
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-[10px] font-bold',
              question.isCorrect
                ? 'bg-success/10 text-success'
                : 'bg-danger/10 text-danger',
            )}
          >
            {question.isCorrect
              ? 'Correct'
              : question.selectedOption === null
                ? 'Skipped'
                : 'Wrong'}
          </span>
          <ChevronDown
            size={14}
            className={cn(
              'text-muted transition-transform',
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
                    'flex items-center gap-2.5 rounded-xl border p-3 text-sm',
                    isCorrect
                      ? 'border-success/30 bg-success/5 text-success'
                      : isChosen
                        ? 'border-danger/30 bg-danger/5 text-danger'
                        : 'border-border text-foreground',
                  )}
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-lg border border-current text-[10px] font-bold">
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
            <div className="mt-3 rounded-xl bg-surface-strong p-3 text-xs leading-relaxed text-muted">
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

import Mascot from '../../components/brand/Mascot.jsx';

/**
 * The wait between submitting and seeing the score.
 *
 * Marking is fast, and a bare spinner would flash for 300ms and be gone. That
 * is a wasted moment: this is the most emotionally loaded second in the app,
 * and a beat of suspense before the reveal is what makes the result land.
 *
 * The overlay is held for a minimum time by its caller (see ExamRuntimePage),
 * so it never flickers. It is deliberately NOT dismissible: unlike the
 * countdown, there is nothing to skip to — the score is not ready yet, and an
 * escape hatch here would just show an empty screen.
 *
 * The messages step so the wait reads as progress rather than a stall.
 */
function SubmitSuspense({ phase = 'marking' }) {
  const copy = {
    marking: 'Marking your paper',
    tallying: 'Adding up the score',
    ready: 'Here it comes',
  }[phase];

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[700] flex flex-col items-center justify-center gap-6 bg-background"
    >
      <Mascot
        mood={phase === 'ready' ? 'excited' : 'thinking'}
        animation={phase === 'ready' ? 'jump' : 'bounce'}
        size={124}
        className="text-primary"
      />

      <div className="text-center">
        <p className="font-heading text-[1.375rem] font-extrabold tracking-tight text-foreground-strong">
          {copy}
        </p>
        <p className="mt-1.5 text-[13px] text-muted">One moment.</p>
      </div>
    </div>
  );
}

export default SubmitSuspense;

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, ProgressBar, Spinner } from '../../components/ui/index.js';
import Mascot from '../../components/brand/Mascot.jsx';
import GoogleAdUnit from './GoogleAdUnit.jsx';
import SponsoredCard from '../../components/ads/SponsoredCard.jsx';
import { useAdPlacement } from './useAdPlacement.js';

const SECONDS = 3;

/**
 * The ad a student sees per finished paper: a 3-second countdown card with 3, 2, 1 ticker
 * before the Skip button is revealed. It only appears when the backend allows the post_activity placement (no ad-free pass).
 * If ads are off, slow or blocked it steps aside at once, so the result is never held back for nothing.
 */
function PostExamAdGate({ onDone }) {
  const ad = useAdPlacement('post_activity');
  const [left, setLeft] = useState(SECONDS);
  const [patience, setPatience] = useState(false);

  // Don't make anyone wait on the eligibility check itself.
  useEffect(() => {
    const t = setTimeout(() => setPatience(true), 2500);
    return () => clearTimeout(t);
  }, []);

  const skip = !ad.loading && !ad.show;
  const giveUp = ad.loading && patience;
  useEffect(() => {
    if (skip || giveUp) onDone();
  }, [skip, giveUp, onDone]);

  useEffect(() => {
    if (!ad.show) return undefined;
    const id = setInterval(() => setLeft((n) => Math.max(0, n - 1)), 1000);
    return () => clearInterval(id);
  }, [ad.show]);

  if (!ad.show) {
    return (
      <div className="flex min-h-[60svh] items-center justify-center" role="status" aria-label="Preparing your result">
        <Spinner size="lg" className="text-primary" />
      </div>
    );
  }

  const ready = left === 0;

  return (
    <div className="mx-auto flex min-h-[70svh] w-full max-w-[34rem] flex-col justify-center gap-5 px-5 py-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <Mascot mood="excited" animation="bounce" size={84} />
        <h1 className="font-heading text-2xl font-extrabold tracking-tight text-foreground-strong">Your result is ready</h1>
        <p className="text-sm text-muted">Reviewing your performance & loading corrections...</p>
      </div>

      <Card padding="md" className="space-y-3 shadow-md border-border">
        <div className="flex items-center justify-between px-1 text-[11px]">
          <span className="font-semibold uppercase tracking-[0.14em] text-muted">
            {ad.isHouseAd ? 'Sponsored' : 'Advertisement'}
          </span>
          <Link to="/billing" className="font-semibold text-primary hover:underline">Remove ads</Link>
        </div>
        {ad.isHouseAd && ad.houseAd ? (
          <SponsoredCard ad={ad.houseAd} cta={ad.houseAd.cta} className="mx-auto" />
        ) : (
          <GoogleAdUnit publisherId={ad.publisherId} slotId={ad.slotId} minHeight={250} />
        )}
      </Card>

      <div className="space-y-3">
        <ProgressBar value={SECONDS - left} max={SECONDS} size="sm" tone="accent" label={undefined} />
        {ready ? (
          <Button
            size="lg"
            variant="primary"
            className="w-full font-bold text-base shadow-sm hover:shadow-md transition-all"
            onClick={onDone}
            aria-live="polite"
          >
            Skip Ad & View Results →
          </Button>
        ) : (
          <div
            className="flex w-full items-center justify-center gap-2.5 rounded-full border border-border bg-surface-subtle py-3 text-sm font-semibold text-muted shadow-2xs"
            aria-live="polite"
          >
            <span>Skip available in</span>
            <span className="inline-flex size-7 items-center justify-center rounded-full bg-primary font-bold text-sm text-primary-foreground shadow-xs animate-pulse">
              {left}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default PostExamAdGate;

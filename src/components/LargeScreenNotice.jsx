import { useState } from 'react';
import { Smartphone } from 'lucide-react';
import Button from './ui/Button.jsx';

const STORAGE_KEY = 'tf:allow-desktop';

/**
 * Mobile-first guard. TestFlow is designed for phones, so on large screens we
 * show a full-screen notice recommending mobile, with an explicit opt-out.
 * Hidden entirely below `lg` (phones/tablets never see it). The opt-out is
 * remembered per session so it does not nag on every navigation.
 */
function LargeScreenNotice() {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  });

  if (dismissed) {
    return null;
  }

  const handleContinue = () => {
    try {
      sessionStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // sessionStorage unavailable (e.g. private mode) — dismiss for this session in memory only.
    }
    setDismissed(true);
  };

  return (
    <div
      role="region"
      aria-labelledby="large-screen-notice-title"
      className="fixed inset-0 z-[999] hidden items-center justify-center bg-background p-8 lg:flex"
    >
      <div className="max-w-md text-center">
        <span className="mx-auto mb-6 inline-flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Smartphone size={30} aria-hidden="true" />
        </span>
        <h2 id="large-screen-notice-title" className="text-2xl text-foreground-strong">
          Best experienced on mobile
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-muted">
          TestFlow is built mobile-first for a focused examination experience. For the best results,
          open it on your phone. You can continue on this device if you prefer.
        </p>
        <Button className="mt-8" onClick={handleContinue}>
          Continue on this device
        </Button>
      </div>
    </div>
  );
}

export default LargeScreenNotice;

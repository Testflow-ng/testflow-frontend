import { Smartphone } from 'lucide-react';

/**
 * Hard mobile gate. TestFlow is a phone-only experience by product decision, so
 * on large screens (lg and up) we cover the entire app with a full-screen
 * notice and provide no way past it. Hidden entirely below lg.
 */
function LargeScreenNotice() {
  return (
    <div
      role="region"
      aria-labelledby="large-screen-notice-title"
      className="fixed inset-0 z-[999] hidden flex-col items-center justify-center bg-background p-8 text-center lg:flex"
    >
      <span className="mb-6 inline-flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Smartphone size={30} aria-hidden="true" />
      </span>
      <h2 id="large-screen-notice-title" className="text-2xl text-foreground-strong">
        Continue on your phone
      </h2>
    </div>
  );
}

export default LargeScreenNotice;

import { useEffect, useRef } from 'react';
import { cn } from '../../utils/cn.js';

const SCRIPT_ID = 'tf-adsense';

function loadScript(publisherId) {
  // index.html already carries the AdSense tag for site verification; never load it twice.
  if (document.getElementById(SCRIPT_ID) || document.querySelector('script[src*="adsbygoogle.js"]')) return;
  const s = document.createElement('script');
  s.id = SCRIPT_ID;
  s.async = true;
  s.crossOrigin = 'anonymous';
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(publisherId)}`;
  document.head.appendChild(s);
}

// A publisher id of all zeros is the placeholder used for local design work: draw a box, load nothing from Google.
const isPlaceholder = (id) => /^ca-pub-0+$/.test(id);

/** One AdSense display unit. Space is reserved up front so nothing jumps when the ad arrives. */
function GoogleAdUnit({ publisherId, slotId, minHeight = 100, className }) {
  const pushed = useRef(false);
  const demo = isPlaceholder(publisherId);

  useEffect(() => {
    if (demo || pushed.current) return;
    pushed.current = true;
    loadScript(publisherId);
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* a blocked or failed ad is not an error worth showing */
    }
  }, [publisherId, demo]);

  if (demo) {
    return (
      <div className={cn('flex items-center justify-center rounded-2xl border border-dashed border-border-strong bg-surface-strong/60 text-sm text-muted', className)} style={{ minHeight }}>
        Ad space (placeholder). Slot {slotId}
      </div>
    );
  }

  return (
    <ins
      className={cn('adsbygoogle block overflow-hidden rounded-2xl', className)}
      style={{ display: 'block', minHeight }}
      data-ad-client={publisherId}
      data-ad-slot={slotId}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}

export default GoogleAdUnit;

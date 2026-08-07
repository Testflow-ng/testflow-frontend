import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus.js';
import Mascot from './brand/Mascot.jsx';

/**
 * Offline notice.
 *
 * Deliberately still a thin banner and not a takeover. Going offline mid-app
 * is not an error and should not behave like one: everything already loaded
 * still works, a cached paper can still be answered, and blocking the screen
 * over a dropped connection would take the app away from someone who can still
 * use most of it.
 *
 * So Flo appears at 28px, looking around for the signal, rather than
 * performing. The banner slides down on arrival so the state change is
 * noticed without a sound or a modal.
 *
 * `role="status"` rather than `alert`: this is information, not an emergency.
 */
function OfflineBanner() {
  const online = useOnlineStatus();
  if (online) return null;

  return (
    <div
      role="status"
      className="tf-rise-in flex items-center justify-center gap-2 bg-warning/15 px-4 py-1.5 text-center"
    >
      <Mascot
        mood="thinking"
        animation="lookAround"
        size={28}
        showTicks={false}
        className="text-score-mid"
      />
      <WifiOff size={14} className="text-score-mid" aria-hidden="true" />
      <span className="text-[13px] font-medium text-score-mid">
        Offline. Answers are saved and will sync.
      </span>
    </div>
  );
}

export default OfflineBanner;

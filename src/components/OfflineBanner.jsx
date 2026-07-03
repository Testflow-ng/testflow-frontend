import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus.js';

/** Thin banner shown while the device is offline. */
function OfflineBanner() {
  const online = useOnlineStatus();
  if (online) return null;

  return (
    <div
      role="status"
      className="flex items-center justify-center gap-2 bg-warning/15 px-4 py-1.5 text-center text-xs font-medium text-warning"
    >
      <WifiOff size={13} aria-hidden="true" />
      You are offline. Some features need a connection.
    </div>
  );
}

export default OfflineBanner;

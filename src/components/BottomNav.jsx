import { Link, useLocation } from 'react-router-dom';
import { BookOpen, GraduationCap, Home, Radio, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn.js';
import { useAuth } from '../features/auth/useAuth.js';

const TABS = [
  { to: '/dashboard', label: 'Home', Icon: Home, isMatch: (p) => p === '/dashboard' },
  { to: '/courses', label: 'CBT', Icon: GraduationCap, isMatch: (p) => p.startsWith('/courses') || p.startsWith('/exam') },
  { to: '/live', label: 'Live CBT', Icon: Radio, isMatch: (p) => p.startsWith('/live') },
  { to: '/library', label: 'Library', Icon: BookOpen, isMatch: (p) => p.startsWith('/library') },
];

/**
 * Mobile Bottom Navigation Bar
 * Reproduces mobile/lib/features/main/widgets/app_nav_bar.dart:
 * - Grouped pill on the left (Home, CBT, Live CBT, Library)
 * - Standalone circular button on the right (Settings)
 * - Mobile only (lg:hidden)
 */
function BottomNav() {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  if (!isAuthenticated || isLoading) return null;

  const currentPath = location.pathname;
  const isSettingsActive = currentPath.startsWith('/settings');

  return (
    <div
      aria-label="Bottom navigation"
      className="fixed inset-x-0 bottom-0 z-50 pointer-events-none px-3 sm:px-4 pb-[calc(0.5rem+var(--safe-bottom))] pt-2 lg:hidden"
    >
      <div className="mx-auto flex w-full max-w-md items-center gap-2 sm:gap-2.5">
        {/* Left: Grouped destination pill */}
        <nav
          aria-label="Main tabs"
          className="pointer-events-auto relative flex flex-1 h-[58px] items-center rounded-full border border-border/80 bg-surface/95 p-1 shadow-[0_8px_24px_rgba(0,0,0,0.10),0_2px_6px_rgba(0,0,0,0.04)] backdrop-blur-xl"
        >
          {TABS.map(({ to, label, Icon, isMatch }) => {
            const active = isMatch(currentPath);
            return (
              <Link
                key={to}
                to={to}
                data-tour={`nav-${label.toLowerCase().replace(/\s+/g, '-')}`}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative flex h-full flex-1 select-none flex-col items-center justify-center rounded-full px-1 transition-colors duration-150 active:scale-95',
                  active
                    ? 'text-primary font-semibold'
                    : 'text-muted hover:text-foreground font-medium',
                )}
              >
                {active && (
                  <motion.span
                    layoutId="activeBottomTabPill"
                    className="absolute inset-1 rounded-full bg-primary/10 -z-10"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <Icon
                  size={19}
                  strokeWidth={active ? 2.3 : 1.7}
                  className="transition-transform shrink-0"
                  aria-hidden="true"
                />
                <span className="text-[10px] leading-tight mt-0.5 tracking-tight truncate max-w-full text-center">
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Right: Standalone circular Settings button */}
        <Link
          to="/settings"
          data-tour="nav-settings"
          aria-label="Settings"
          aria-current={isSettingsActive ? 'page' : undefined}
          className={cn(
            'pointer-events-auto flex size-[56px] shrink-0 items-center justify-center rounded-full transition-all duration-200 active:scale-95',
            isSettingsActive
              ? 'bg-primary text-primary-foreground shadow-[0_8px_24px_rgba(37,99,235,0.35)]'
              : 'border border-border/80 bg-surface/95 text-muted shadow-[0_8px_24px_rgba(0,0,0,0.10),0_2px_6px_rgba(0,0,0,0.04)] backdrop-blur-xl hover:text-foreground',
          )}
        >
          <Settings size={21} strokeWidth={isSettingsActive ? 2.3 : 1.8} />
        </Link>
      </div>
    </div>
  );
}

export default BottomNav;

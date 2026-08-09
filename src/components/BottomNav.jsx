import { Link, useLocation } from 'react-router-dom';
import { BookOpen, GraduationCap, Home, User, Users, Zap } from 'lucide-react';
import { cn } from '../utils/cn.js';
import { useMemo } from 'react';

const items = [
  { to: '/dashboard', label: 'Home', Icon: Home },
  { to: '/post-utme', label: 'UTME', Icon: Zap },
  { to: '/live', label: 'Live', Icon: Users },
  { to: '/courses', label: 'Courses', Icon: GraduationCap },
  { to: '/profile', label: 'Profile', Icon: User },
];

/**
 * Mobile tab bar - PWA STANDALONE ONLY.
 *
 * This component only renders when the site is installed as a PWA and running
 * in standalone mode. This keeps the regular mobile browser UI clean while
 * providing an app-like experience for installed users.
 */
function BottomNav() {
  const location = useLocation();

  // Only show if running in standalone mode (PWA installed)
  const isStandalone = useMemo(() => {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true; // iOS Safari check
  }, []);

  if (!isStandalone) return null;

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface tf-safe-bottom lg:hidden shadow-[0_-4px_12px_rgba(0,0,0,0.03)]"
    >
      <ul
        className="mx-auto flex max-w-lg items-stretch px-1"
        style={{ height: 'var(--nav-height)' }}
      >
        {items.map(({ to, label, Icon }) => {
          const active = location.pathname === to || location.pathname.startsWith(to + '/');
          return (
            <li key={to} className="flex flex-1">
              <Link
                to={to}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'group flex min-h-12 flex-1 select-none flex-col items-center justify-center gap-1',
                  'transition-colors duration-[var(--duration-xs)]',
                  active ? 'text-primary' : 'text-muted',
                )}
              >
                <Icon
                  size={22}
                  strokeWidth={active ? 2.4 : 1.8}
                  aria-hidden="true"
                  className="transition-transform duration-[var(--duration-xs)] ease-[var(--transition-ease)] group-active:scale-90 motion-reduce:transition-none motion-reduce:group-active:scale-100"
                />
                <span
                  className={cn(
                    'text-[10px] leading-none tracking-tight',
                    active ? 'font-semibold' : 'font-medium',
                  )}
                >
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default BottomNav;

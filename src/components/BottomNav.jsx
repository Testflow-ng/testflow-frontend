import { Link, useLocation } from 'react-router-dom';
import { BookOpen, GraduationCap, Home, User, Users } from 'lucide-react';
import { cn } from '../utils/cn.js';

const items = [
  { to: '/dashboard', label: 'Home', Icon: Home },
  { to: '/history', label: 'History', Icon: BookOpen },
  { to: '/live', label: 'Live', Icon: Users },
  { to: '/courses', label: 'Courses', Icon: GraduationCap },
  { to: '/profile', label: 'Profile', Icon: User },
];

/**
 * Mobile tab bar.
 *
 * Deliberately flat: a solid surface with a hairline top rule, no blur, no
 * shadow, no elevation. The bar itself is 54px (`--nav-height`) while each
 * item stretches to a 48px touch target, which clears the 44px minimum
 * without the bar eating vertical space. The home-indicator inset is applied
 * below the row, so the inset never inflates the visual bar height.
 */
function BottomNav() {
  const location = useLocation();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface tf-safe-bottom lg:hidden"
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

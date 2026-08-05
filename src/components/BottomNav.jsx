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

function BottomNav() {
  const location = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-surface/95 backdrop-blur-lg lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-1.5">
        {items.map(({ to, label, Icon }) => {
          const active = location.pathname === to || location.pathname.startsWith(to + '/');
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                'flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 transition-colors',
                active
                  ? 'text-primary'
                  : 'text-muted hover:text-foreground-strong',
              )}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[10px] font-semibold">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;

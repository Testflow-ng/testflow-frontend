import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  History,
  Home,
  LayoutDashboard,
  LogIn,
  Menu,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  User,
  UserPlus,
} from 'lucide-react';
import { cn } from '../utils/cn.js';
import Logo from './Logo.jsx';
import IconButton from './ui/IconButton.jsx';
import NavDrawer from './NavDrawer.jsx';
import { useAuth } from '../features/auth/useAuth.js';

function Header() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const authLinks = [
    { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
    { to: '/progress', label: 'Your progress', Icon: TrendingUp },
    { to: '/achievements', label: 'Achievements', Icon: Award },
    { to: '/history', label: 'Exam history', Icon: History },
    { to: '/profile', label: 'Profile', Icon: User },
  ];

  if (user?.role === 'admin') {
    authLinks.push({ to: '/admin', label: 'Admin panel', Icon: ShieldAlert });
  }

  const links = isAuthenticated
    ? authLinks
    : [
        { to: '/', label: 'Home', Icon: Home },
        { to: '/features', label: 'How it works', Icon: Sparkles },
        { to: '/login', label: 'Sign in', Icon: LogIn },
        { to: '/register', label: 'Create account', Icon: UserPlus },
      ];

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-border bg-background/80 px-5 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur">
      <div className="flex items-center gap-8">
        <Link
          to="/"
          className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Logo size={30} />
        </Link>

        {!isLoading && (
          <nav className="hidden lg:flex items-center gap-1">
            {links.slice(0, isAuthenticated ? 2 : 2).map(({ to, label }) => (
              <Link
                key={label}
                to={to}
                className="px-3 py-1.5 text-sm font-medium text-muted hover:text-foreground-strong transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {label}
              </Link>
            ))}
          </nav>
        )}
      </div>

      {!isLoading && (
        <div className="flex items-center gap-2">
          {isAuthenticated && user?.role === 'admin' && (
            <Link
              to="/admin"
              className="hidden lg:flex px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors"
            >
              Admin Panel
            </Link>
          )}

          <IconButton
            variant="ghost"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
            className={cn('')}
          >
            <Menu size={20} aria-hidden="true" />
          </IconButton>
        </div>
      )}

      <NavDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        links={links}
        onSignOut={isAuthenticated ? logout : undefined}
      />
    </header>
  );
}

export default Header;

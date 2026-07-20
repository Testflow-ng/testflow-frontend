import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Award,
  ChevronDown,
  History,
  LayoutDashboard,
  LogOut,
  ShieldAlert,
  TrendingUp,
  User,
} from 'lucide-react';
import { cn } from '../utils/cn.js';
import Logo from './Logo.jsx';
import EqualsMenuIcon from './EqualsMenuIcon.jsx';
import NavDrawer from './NavDrawer.jsx';
import { useAuth } from '../features/auth/useAuth.js';
import { buttonClasses } from './ui/index.js';
import Avatar from './ui/Avatar.jsx';

function Header() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();

  const authLinks = [
    { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
    { to: '/progress', label: 'Analytics', Icon: TrendingUp },
    { to: '/history', label: 'History', Icon: History },
  ];

  if (['admin', 'super_admin'].includes(user?.role)) {
    authLinks.push({ to: '/admin', label: 'Admin', Icon: ShieldAlert });
  }

  const publicLinks = [
    { to: '/', label: 'Home' },
    { to: '/features', label: 'Features' },
    { to: '/#how-it-works', label: 'How it works' },
    { to: '/#subjects', label: 'Subjects' },
  ];

  const links = isAuthenticated ? authLinks : publicLinks;

  return (
    <header className="sticky top-0 z-50 w-full px-4 pt-3 sm:px-5">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 rounded-full border border-border/70 bg-background/70 px-3 pl-4 shadow-sm backdrop-blur-xl sm:h-16 sm:pl-6 sm:pr-3">
        <Link
          to="/"
          className="flex items-center gap-2 transition-transform active:scale-95"
        >
          <Logo size={28} withWordmark={false} />
          <span className="font-heading text-lg font-semibold tracking-tight text-foreground-strong">
            TestFlow
          </span>
        </Link>

        {!isLoading && (
          <nav className="hidden items-center gap-1 rounded-full bg-surface-strong/60 p-1 lg:flex">
            {links.map(({ to, label }) => {
              const isActive = location.pathname === to;
              return (
                <Link
                  key={label}
                  to={to}
                  className={cn(
                    'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-surface text-foreground-strong shadow-sm'
                      : 'text-muted hover:text-foreground-strong',
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        )}

        <div className="flex items-center gap-2">
          {!isLoading &&
            (isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 rounded-full border border-border bg-surface p-1 pr-3 transition-colors hover:border-border-strong"
                >
                  <Avatar name={user.fullName} size="sm" />
                  <span className="hidden max-w-[100px] truncate text-xs font-bold text-foreground-strong sm:block">
                    {user.fullName.split(' ')[0]}
                  </span>
                  <ChevronDown
                    size={14}
                    className={cn(
                      'text-muted transition-transform',
                      userMenuOpen && 'rotate-180',
                    )}
                  />
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 z-20 mt-2 w-56 origin-top-right rounded-2xl border border-border bg-surface p-2 shadow-xl">
                      <div className="mb-1 border-b border-border px-3 py-2">
                        <p className="truncate text-sm font-bold text-foreground-strong">
                          {user.fullName}
                        </p>
                        <p className="truncate text-xs text-muted">{user.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-strong hover:text-foreground-strong"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User size={16} /> Profile
                      </Link>
                      <Link
                        to="/achievements"
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-strong hover:text-foreground-strong"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Award size={16} /> Achievements
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-danger transition-colors hover:bg-danger/5"
                      >
                        <LogOut size={16} /> Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden items-center gap-2 lg:flex">
                <Link
                  to="/login"
                  className="px-3 text-sm font-semibold text-muted transition-colors hover:text-foreground-strong"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className={buttonClasses({ size: 'md', className: 'px-5' })}
                >
                  Get started
                </Link>
              </div>
            ))}

          {!isLoading && (
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-border/70 bg-surface text-foreground-strong transition-colors hover:bg-surface-strong lg:hidden"
            >
              <EqualsMenuIcon size={22} />
            </button>
          )}
        </div>
      </div>

      <NavDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        links={links}
        isAuthenticated={isAuthenticated}
        onSignOut={isAuthenticated ? logout : undefined}
      />
    </header>
  );
}

export default Header;

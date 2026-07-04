import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Award,
  ChevronDown,
  History,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  User,
  Settings,
} from 'lucide-react';
import { cn } from '../utils/cn.js';
import Logo from './Logo.jsx';
import IconButton from './ui/IconButton.jsx';
import NavDrawer from './NavDrawer.jsx';
import { useAuth } from '../features/auth/useAuth.js';
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
    { to: '/', label: 'Home', Icon: Home },
    { to: '/features', label: 'Features', Icon: Sparkles },
  ];

  const links = isAuthenticated ? authLinks : publicLinks;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/60 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
        {/* Left: Logo */}
        <div className="flex items-center gap-10">
          <Link
            to="/"
            className="flex items-center gap-2 transition-transform hover:scale-[1.02] active:scale-95"
          >
            <Logo size={32} withWordmark={false} />
            <span className="hidden font-display text-xl font-bold tracking-tight text-foreground-strong sm:block">
              TestFlow
            </span>
          </Link>

          {/* Center: Desktop Nav */}
          {!isLoading && (
            <nav className="hidden lg:flex items-center gap-1">
              {links.map(({ to, label }) => {
                const isActive = location.pathname === to;
                return (
                  <Link
                    key={label}
                    to={to}
                    className={cn(
                      'relative px-4 py-2 text-sm font-medium transition-colors rounded-full',
                      isActive
                        ? 'text-primary'
                        : 'text-muted hover:text-foreground-strong hover:bg-surface-strong'
                    )}
                  >
                    {label}
                    {isActive && (
                      <span className="absolute inset-x-4 -bottom-px h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
                    )}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {!isLoading && (
            <>
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 rounded-full border border-border bg-surface p-1 pr-3 transition-all hover:border-border-strong hover:shadow-sm"
                  >
                    <Avatar name={user.fullName} size="sm" />
                    <div className="hidden text-left lg:block">
                      <p className="max-w-[100px] truncate text-xs font-bold text-foreground-strong">
                        {user.fullName.split(' ')[0]}
                      </p>
                      <p className="text-[10px] text-muted capitalize">{user.role}</p>
                    </div>
                    <ChevronDown size={14} className={cn("text-muted transition-transform", userMenuOpen && "rotate-180")} />
                  </button>

                  {/* Desktop Dropdown */}
                  {userMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setUserMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-border bg-surface p-2 shadow-xl ring-1 ring-black/5 focus:outline-none z-20">
                        <div className="px-3 py-2 border-b border-border mb-1">
                          <p className="text-sm font-bold text-foreground-strong truncate">{user.fullName}</p>
                          <p className="text-xs text-muted truncate">{user.email}</p>
                        </div>
                        <Link
                          to="/profile"
                          className="flex items-center gap-2 px-3 py-2 text-sm text-muted hover:text-foreground-strong hover:bg-surface-strong rounded-lg transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <User size={16} /> Profile
                        </Link>
                        <Link
                          to="/achievements"
                          className="flex items-center gap-2 px-3 py-2 text-sm text-muted hover:text-foreground-strong hover:bg-surface-strong rounded-lg transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Award size={16} /> Achievements
                        </Link>
                        <button
                          onClick={() => {
                            logout();
                            setUserMenuOpen(false);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-danger/5 rounded-lg transition-colors"
                        >
                          <LogOut size={16} /> Sign out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="hidden lg:flex items-center gap-3">
                  <Link to="/login" className="text-sm font-medium text-muted hover:text-foreground-strong transition-colors">
                    Sign in
                  </Link>
                  <Link to="/register">
                    <button className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground transition-all hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/20 active:scale-95">
                      Join TestFlow
                    </button>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <IconButton
                variant="ghost"
                onClick={() => setMenuOpen(true)}
                className="lg:hidden"
                aria-label="Open menu"
              >
                <Menu size={22} />
              </IconButton>
            </>
          )}
        </div>
      </div>

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

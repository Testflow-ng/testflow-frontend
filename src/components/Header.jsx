import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  History,
  LayoutDashboard,
  LogOut,
  ShieldAlert,
  Sun,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { cn } from '../utils/cn.js';
import Logo from './Logo.jsx';
import EqualsMenuIcon from './EqualsMenuIcon.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import { THEME_SWITCHING_ENABLED } from '../theme.js';
import WhatsAppIcon from './icons/WhatsAppIcon.jsx';
import { WHATSAPP_CHANNEL_URL, WHATSAPP_GREEN } from '../constants/social.js';
import { useAuth } from '../features/auth/useAuth.js';
import { LOGIN_PATH, REGISTER_PATH } from '../features/auth/paths.js';
import { buttonClasses } from './ui/index.js';
import AccountMenu from './AccountMenu.jsx';

function Header() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  const authLinks = [
    { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
    { to: '/post-utme', label: 'Post-UTME', Icon: Zap },
    { to: '/live', label: 'Live CBT', Icon: Users },
    { to: '/courses', label: 'Courses', Icon: TrendingUp },
    { to: '/history', label: 'History', Icon: History },
  ];

  if (['admin', 'super_admin'].includes(user?.role)) {
    authLinks.push({ to: '/admin', label: 'Admin', Icon: ShieldAlert });
  }

  const publicLinks = [
    { to: '/', label: 'Home' },
    { to: '/#how-it-works', label: 'How it works' },
    { to: '/#subjects', label: 'Subjects' },
  ];

  const links = isAuthenticated ? authLinks : publicLinks;

  return (
    /*
      `viewport-fit=cover` lets the page run under the status bar, so the
      header has to add the top inset itself .without it the pill sits behind
      the clock and notch on an installed iPhone PWA.
    */
    <header className="sticky top-0 z-50 w-full px-4 pt-[calc(0.5rem+var(--safe-top))] sm:px-5">
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 z-40 bg-background/40 backdrop-blur-sm lg:hidden"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <div className="relative z-50 mx-auto max-w-6xl overflow-hidden rounded-[1.75rem] border border-border/70 bg-background/80 shadow-sm backdrop-blur-xl">
        <div className="flex h-12 items-center justify-between gap-3 pl-4 pr-2.5 sm:h-14 sm:pl-5">
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
                      'rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
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
            <a
              href={WHATSAPP_CHANNEL_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="Follow EDDYRUS MEDIA on WhatsApp"
              title="Follow EDDYRUS MEDIA on WhatsApp"
              className="tf-pressable relative flex size-9 items-center justify-center rounded-full text-white after:absolute after:inset-[-3px] after:content-['']"
              style={{ backgroundColor: WHATSAPP_GREEN }}
            >
              <WhatsAppIcon size={20} />
            </a>

            {!isLoading &&
              (isAuthenticated ? (
                <AccountMenu />
              ) : (
                <div className="hidden items-center gap-2 lg:flex">
                  <Link
                    to={LOGIN_PATH}
                    className="px-3 text-sm font-semibold text-muted transition-colors hover:text-foreground-strong"
                  >
                    Sign in
                  </Link>
                  <Link
                    to={REGISTER_PATH}
                    className={buttonClasses({ size: 'sm', className: 'px-5' })}
                  >
                    Get started
                  </Link>
                </div>
              ))}

            {!isLoading && (
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                data-tour="menu"
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={menuOpen}
                className="tf-pressable relative flex size-9 items-center justify-center rounded-full border border-border/70 bg-surface text-foreground-strong after:absolute after:inset-[-3px] after:content-[''] active:bg-surface-strong lg:hidden"
              >
                <EqualsMenuIcon size={22} open={menuOpen} />
              </button>
            )}
          </div>
        </div>

        <AnimatePresence initial={false}>
          {menuOpen && (
            <motion.div
              key="panel"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="overflow-hidden lg:hidden"
            >
              <div className="border-t border-border px-3 pb-4 pt-2">
                <nav className="flex flex-col">
                  {links.map(({ to, label }, i) => (
                    <motion.div
                      key={label}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 + i * 0.04, duration: 0.25 }}
                    >
                      <Link
                        to={to}
                        onClick={() => setMenuOpen(false)}
                        className={cn(
                          'tf-pressable flex min-h-12 items-center rounded-2xl px-3 text-lg font-semibold tracking-tight active:bg-surface-strong',
                          location.pathname === to
                            ? 'text-foreground-strong'
                            : 'text-muted',
                        )}
                      >
                        {label}
                      </Link>
                    </motion.div>
                  ))}
                </nav>

                {THEME_SWITCHING_ENABLED && (
                  <div className="mt-2 flex items-center justify-between rounded-2xl bg-surface-strong px-4 py-3">
                    <span className="flex items-center gap-3 text-sm font-semibold text-foreground-strong">
                      <Sun size={18} className="text-muted" />
                      Theme
                    </span>
                    <ThemeToggle />
                  </div>
                )}

                <a
                  href={WHATSAPP_CHANNEL_URL}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setMenuOpen(false)}
                  className="mt-2 flex items-center gap-3 rounded-2xl bg-surface-strong px-4 py-3"
                >
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-full text-white"
                    style={{ backgroundColor: WHATSAPP_GREEN }}
                  >
                    <WhatsAppIcon size={16} />
                  </span>
                  <span className="text-sm font-semibold text-foreground-strong">
                    Follow EDDYRUS MEDIA
                  </span>
                </a>

                <div className="mt-3 border-t border-border pt-4">
                  {isAuthenticated ? (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        logout();
                      }}
                      className={buttonClasses({
                        variant: 'outline',
                        size: 'lg',
                        fullWidth: true,
                        className: 'gap-2 text-danger',
                      })}
                    >
                      <LogOut size={18} aria-hidden="true" />
                      Sign out
                    </button>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <Link
                        to={LOGIN_PATH}
                        onClick={() => setMenuOpen(false)}
                        className={buttonClasses({
                          variant: 'outline',
                          size: 'lg',
                          fullWidth: true,
                        })}
                      >
                        Sign in
                      </Link>
                      <Link
                        to={REGISTER_PATH}
                        onClick={() => setMenuOpen(false)}
                        className={buttonClasses({
                          size: 'lg',
                          fullWidth: true,
                          className: 'gap-2',
                        })}
                      >
                        Get started
                        <ArrowRight size={18} aria-hidden="true" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

export default Header;

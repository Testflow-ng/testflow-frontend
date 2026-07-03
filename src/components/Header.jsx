import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  History,
  Home,
  LayoutDashboard,
  LogIn,
  Menu,
  Sparkles,
  TrendingUp,
  User,
  UserPlus,
} from 'lucide-react';
import Logo from './Logo.jsx';
import IconButton from './ui/IconButton.jsx';
import NavDrawer from './NavDrawer.jsx';
import { useAuth } from '../features/auth/useAuth.js';

function Header() {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = isAuthenticated
    ? [
        { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
        { to: '/progress', label: 'Your progress', Icon: TrendingUp },
        { to: '/achievements', label: 'Achievements', Icon: Award },
        { to: '/history', label: 'Exam history', Icon: History },
        { to: '/profile', label: 'Profile', Icon: User },
      ]
    : [
        { to: '/', label: 'Home', Icon: Home },
        { to: '/features', label: 'How it works', Icon: Sparkles },
        { to: '/login', label: 'Sign in', Icon: LogIn },
        { to: '/register', label: 'Create account', Icon: UserPlus },
      ];

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-border bg-background/80 px-5 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur">
      <Link
        to="/"
        className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <Logo size={30} />
      </Link>

      {!isLoading && (
        <IconButton variant="ghost" aria-label="Open menu" onClick={() => setMenuOpen(true)}>
          <Menu size={20} aria-hidden="true" />
        </IconButton>
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

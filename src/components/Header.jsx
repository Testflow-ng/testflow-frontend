import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import ThemeToggle from './ThemeToggle.jsx';
import { Button, buttonClasses } from './ui/index.js';
import { useAuth } from '../features/auth/useAuth.js';

function Header() {
  const { isAuthenticated, isLoading, logout } = useAuth();

  return (
    <header className="flex items-center justify-between gap-3 px-5 pb-4 pt-[max(1rem,env(safe-area-inset-top))]">
      <Link
        to="/"
        className="rounded-sm font-semibold tracking-tight text-foreground-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        TestFlow
      </Link>
      <div className="flex items-center gap-2">
        {!isLoading &&
          (isAuthenticated ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              leadingIcon={<LogOut size={16} aria-hidden="true" />}
            >
              Sign out
            </Button>
          ) : (
            <Link to="/login" className={buttonClasses({ variant: 'ghost', size: 'sm' })}>
              Sign in
            </Link>
          ))}
        <ThemeToggle />
      </div>
    </header>
  );
}

export default Header;

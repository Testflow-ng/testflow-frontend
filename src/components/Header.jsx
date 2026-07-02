import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import ThemeToggle from './ThemeToggle.jsx';
import Logo from './Logo.jsx';
import { Button, buttonClasses } from './ui/index.js';
import { useAuth } from '../features/auth/useAuth.js';

function Header() {
  const { isAuthenticated, isLoading, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-border bg-background/80 px-5 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur">
      <Link
        to="/"
        className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <Logo size={30} />
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

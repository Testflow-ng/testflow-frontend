import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle.jsx';

function Header() {
  return (
    <header className="flex items-center justify-between gap-4 px-5 pb-4 pt-[max(1rem,env(safe-area-inset-top))]">
      <Link
        to="/"
        className="rounded-sm font-semibold tracking-tight text-foreground-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        TestFlow
      </Link>
      <ThemeToggle />
    </header>
  );
}

export default Header;

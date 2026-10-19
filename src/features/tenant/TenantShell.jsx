import { Link, NavLink } from 'react-router-dom';
import { ArrowLeft, LogOut } from 'lucide-react';
import { Avatar, DropdownMenu, IconButton } from '../../components/ui/index.js';
import { cn } from '../../utils/cn.js';
import TenantBrand from './TenantBrand.jsx';
import { useTenant } from './TenantContext.js';

const link = ({ isActive }) => cn('rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary', isActive ? 'bg-primary text-primary-foreground' : 'text-muted hover:text-foreground-strong');

/** The organisation's header and footer around a student page. */
function TenantShell({ title, back, children, wide }) {
  const { brand, user, logout, site } = useTenant();
  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[64rem] items-center justify-between gap-4 px-5">
          <TenantBrand />
          <nav aria-label="Main" className="flex items-center gap-1">
            <NavLink to="/" end className={link}>Exams</NavLink>
            {site?.pages?.results !== false && <NavLink to="/results" className={link}>My results</NavLink>}
          </nav>
          <DropdownMenu placement="bottom-end" trigger={(p) => <IconButton aria-label="Account" variant="ghost" {...p}><Avatar name={user.fullName} size="sm" /></IconButton>} items={[{ label: user.fullName, disabled: true }, { separator: true }, { label: 'Sign out', icon: LogOut, danger: true, onSelect: logout }]} />
        </div>
      </header>
      <main className={cn('mx-auto w-full flex-1 px-5 py-8', wide ? 'max-w-[64rem]' : 'max-w-[48rem]')}>
        {back && <Link to={back} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-foreground-strong"><ArrowLeft size={15} aria-hidden="true" /> Back</Link>}
        {title && <h1 className="mb-6 font-heading text-2xl font-extrabold tracking-tight text-foreground-strong">{title}</h1>}
        {children}
      </main>
      <footer className="border-t border-border py-5 text-center text-xs text-muted">{brand.name} · Powered by <a href="https://testflow.com.ng" className="font-semibold underline" target="_blank" rel="noopener noreferrer">Testflow</a></footer>
    </div>
  );
}

export default TenantShell;

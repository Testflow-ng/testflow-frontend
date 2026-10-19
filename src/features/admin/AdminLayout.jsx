import { NavLink, Outlet } from 'react-router-dom';
import { cn } from '../../utils/cn.js';
import { ADMIN_NAV } from './adminNav.js';

/** Wraps every /admin page. On desktop the sidebar is the menu; on phones this scrolling strip is. */
function AdminLayout() {
  return (
    <>
      <nav aria-label="Admin sections" className="sticky top-0 z-30 -mb-px border-b border-border bg-background/95 backdrop-blur lg:hidden">
        <ul className="flex gap-1.5 overflow-x-auto px-4 py-2.5">
          {ADMIN_NAV.map(({ to, label, end }) => (
            <li key={to} className="shrink-0">
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) => cn('inline-flex h-9 items-center rounded-full px-3.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary', isActive ? 'bg-primary text-primary-foreground' : 'border border-border bg-surface text-muted')}
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <Outlet />
    </>
  );
}

export default AdminLayout;

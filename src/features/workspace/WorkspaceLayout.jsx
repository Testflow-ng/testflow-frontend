import { Navigate, NavLink, Outlet } from 'react-router-dom';
import { SkeletonCard } from '../../components/ui/index.js';
import Screen from '../../components/layout/Screen.jsx';
import { cn } from '../../utils/cn.js';
import { WORKSPACE_NAV } from './workspaceNav.js';
import { OrgContext } from './OrgContext.js';
import { useOrganizations } from './useWorkspace.js';

/** Loads the organisation once and shares it with every workspace screen. On phones a scrolling strip replaces the sidebar. */
function WorkspaceLayout() {
  const { data, isLoading, error } = useOrganizations();
  const org = Array.isArray(data) ? data[0] : null;

  if (isLoading) return <Screen width="full"><SkeletonCard className="mt-6 h-40" /></Screen>;
  // No organisation yet: the first-time setup (name, logo, domain, wallet) instead of an empty workspace.
  if (!org && !error) return <Navigate to="/everybody/start" replace />;
  if (!org) return <Screen width="md"><p className="py-16 text-center text-muted">Could not load your workspace. Check your connection and refresh.</p></Screen>;

  return (
    <OrgContext.Provider value={{ org, orgId: org.id }}>
      <nav aria-label="Workspace sections" className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur lg:hidden">
        <ul className="flex gap-1.5 overflow-x-auto px-4 py-2.5">
          {WORKSPACE_NAV.map(({ to, label, end }) => (
            <li key={to} className="shrink-0">
              <NavLink to={to} end={end} className={({ isActive }) => cn('inline-flex h-9 items-center rounded-full px-3.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary', isActive ? 'bg-primary text-primary-foreground' : 'border border-border bg-surface text-muted')}>{label}</NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <Outlet />
    </OrgContext.Provider>
  );
}

export default WorkspaceLayout;

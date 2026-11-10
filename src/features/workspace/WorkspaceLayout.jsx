import { Navigate, Outlet } from 'react-router-dom';
import { SkeletonCard } from '../../components/ui/index.js';
import Screen from '../../components/layout/Screen.jsx';
import WorkspaceMobileNav from './WorkspaceMobileNav.jsx';
import { OrgContext } from './OrgContext.js';
import TrialBanner from './TrialBanner.jsx';
import { useOrganizations } from './useWorkspace.js';

/** Loads the organisation once and shares it with every workspace screen. On phones a top bar with a hamburger drawer replaces the sidebar. */
function WorkspaceLayout() {
  const { data, isLoading, error } = useOrganizations();
  const org = Array.isArray(data) ? data[0] : null;

  if (isLoading) return <Screen width="full"><SkeletonCard className="mt-6 h-40" /></Screen>;
  // No organisation yet: the first-time setup (name, logo, domain, wallet) instead of an empty workspace.
  if (!org && !error) return <Navigate to="/everybody/start" replace />;
  if (!org) return <Screen width="md"><p className="py-16 text-center text-muted">Could not load your workspace. Check your connection and refresh.</p></Screen>;

  return (
    <OrgContext.Provider value={{ org, orgId: org.id }}>
      <WorkspaceMobileNav orgName={org.name} />
      <TrialBanner />
      <Outlet />
    </OrgContext.Provider>
  );
}

export default WorkspaceLayout;

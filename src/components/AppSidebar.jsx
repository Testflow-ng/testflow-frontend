import { Award, BookOpen, ChartLine, LayoutDashboard, Palette, Radio, ShieldAlert, Sparkles, Target, Trophy, User } from 'lucide-react';
import { useState } from 'react';
import { ConfirmDialog } from './ui/index.js';
import SidebarShell from './SidebarShell.jsx';
import { useAuth } from '../features/auth/useAuth.js';
import { useSubjects } from '../features/subjects/useSubjects.js';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/courses', label: 'Courses', Icon: BookOpen },
  { to: '/post-utme', label: 'Post-UTME', Icon: Target, tag: 'Soon' },
  { to: '/live', label: 'Live CBT', Icon: Radio },
  { to: '/ai-study', label: 'AI Study', Icon: Sparkles, tag: 'Soon' },
  { to: '/progress', label: 'Progress', Icon: ChartLine },
  { to: '/hall-of-fame', label: 'Hall of Fame', Icon: Trophy },
  { to: '/achievements', label: 'Achievements', Icon: Award },
  { to: '/profile', label: 'Profile', Icon: User },
];

/** The student app's sidebar: the shared SidebarShell with the student menu and pinned courses. */
function AppSidebar() {
  const { user, logout } = useAuth();
  const [confirmOut, setConfirmOut] = useState(false);
  const { data: subjects } = useSubjects();

  const pinnedIds = new Set(user?.pinnedSubjects ?? []);
  const entries = (subjects ?? [])
    .filter((s) => pinnedIds.has(s.id))
    .slice(0, 10)
    .map((s) => ({ key: s.id, to: '/courses', label: s.name ? `${s.code} · ${s.name}` : s.code, title: s.name ?? s.code }));
  const isAdmin = ['admin', 'super_admin'].includes(user?.role);
  const base = isAdmin ? [...NAV, { to: '/admin', label: 'Admin', Icon: ShieldAlert }] : NAV;
  // Developer reference for the shared components (development only here; the footer links to it everywhere).
  const items = import.meta.env.DEV ? [...base, { to: '/ui-kit', label: 'UI Kit', Icon: Palette }] : base;

  return (
    <>
    <SidebarShell
      items={items}
      list={{ title: 'Pinned courses', searchTo: '/courses', searchLabel: 'Search courses', entries, emptyText: 'Pin a course from Courses and it shows up here.' }}
      onLogout={() => setConfirmOut(true)}
    />
    <ConfirmDialog
      open={confirmOut}
      onOpenChange={setConfirmOut}
      title="Sign out?"
      description="You will need to sign in again to take exams."
      confirmLabel="Sign out"
      tone="danger"
      onConfirm={logout}
    />
    </>
  );
}

export default AppSidebar;

import { Activity, BarChart3, BookOpenCheck, FileQuestion, Flag, LayoutDashboard, Megaphone, MessageSquare, Settings2, ShieldCheck, Users } from 'lucide-react';

/** The admin menu. `end` makes /admin match only the overview, not every admin page. */
export const ADMIN_NAV = [
  { to: '/admin', label: 'Overview', Icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: 'Users', Icon: Users },
  { to: '/admin/questions', label: 'Questions', Icon: FileQuestion },
  { to: '/admin/subjects', label: 'Subjects', Icon: BookOpenCheck },
  { to: '/admin/reports', label: 'Problems', Icon: Flag },
  { to: '/admin/feedback', label: 'Feedback', Icon: MessageSquare },
  { to: '/admin/verifications', label: 'Verifications', Icon: ShieldCheck },
  { to: '/admin/ads', label: 'Ads', Icon: Megaphone },
  { to: '/admin/activity', label: 'Audit log', Icon: Activity },
  { to: '/admin/settings', label: 'Settings', Icon: Settings2 },
];

export const ADMIN_ICON = BarChart3;

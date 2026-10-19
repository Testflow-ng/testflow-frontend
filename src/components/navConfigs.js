import { BarChart3, CreditCard, FileText, Globe, LayoutDashboard, LayoutTemplate, ListChecks, Megaphone, MessagesSquare, Users } from 'lucide-react';

// Menus for the other products' sidebars (pass to <SidebarShell items={...} />). Routes are placeholders
// until those dashboards are built.
export const adsNav = [
  { to: '/ads/dashboard', label: 'Overview', Icon: LayoutDashboard },
  { to: '/ads/campaigns', label: 'Campaigns', Icon: Megaphone },
  { to: '/ads/analytics', label: 'Analytics', Icon: BarChart3 },
  { to: '/ads/billing', label: 'Billing', Icon: CreditCard },
];

export const everybodyNav = [
  { to: '/everybody/dashboard', label: 'Overview', Icon: LayoutDashboard },
  { to: '/everybody/site', label: 'Website', Icon: LayoutTemplate },
  { to: '/everybody/exams', label: 'Exams', Icon: ListChecks },
  { to: '/everybody/questions', label: 'Question bank', Icon: FileText },
  { to: '/everybody/students', label: 'Students', Icon: Users },
  { to: '/everybody/community', label: 'Community', Icon: MessagesSquare },
  { to: '/everybody/results', label: 'Results', Icon: BarChart3 },
  { to: '/everybody/domains', label: 'Domains', Icon: Globe },
  { to: '/everybody/billing', label: 'Billing', Icon: CreditCard },
];

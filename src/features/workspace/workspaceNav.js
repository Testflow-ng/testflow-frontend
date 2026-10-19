import { CreditCard, Flag, Globe, Layers, LayoutDashboard, ListChecks, Megaphone, Users, Wallet } from 'lucide-react';

export const WORKSPACE_NAV = [
  { to: '/workspace', label: 'Overview', Icon: LayoutDashboard, end: true },
  { to: '/workspace/exams', label: 'Exams', Icon: ListChecks },
  { to: '/workspace/banks', label: 'Question banks', Icon: Layers },
  { to: '/workspace/students', label: 'Students', Icon: Users },
  { to: '/workspace/announcements', label: 'Announcements', Icon: Megaphone },
  { to: '/workspace/reports', label: 'Reported questions', Icon: Flag },
  { to: '/workspace/payments', label: 'Earnings', Icon: Wallet },
  { to: '/workspace/domains', label: 'Name and domain', Icon: Globe },
  { to: '/workspace/billing', label: 'Plan', Icon: CreditCard },
];

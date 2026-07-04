import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../api.js';
import {
  Card,
  Spinner,
  Avatar,
  Alert,
  Button
} from '../../../components/ui/index.js';
import {
  BookOpen,
  FileQuestion,
  Users,
  LayoutDashboard,
  Activity,
  CheckCircle2,
  TrendingUp,
  Clock,
  ShieldCheck,
  Download
} from 'lucide-react';
import { cn } from '../../../utils/cn.js';
import { useAuth } from '../../auth/useAuth.js';

const maskEmail = (email) => {
  const [name, domain] = email.split('@');
  if (name.length <= 2) return `${name[0]}***@${domain}`;
  return `${name[0]}${name[1]}***${name[name.length - 1]}@${domain}`;
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

function AdminDashboardPage() {
  const { user: currentUser } = useAuth();

  const handleExport = () => {
    window.open(`${API_URL}/api/admin/export-results`, '_blank');
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ['adminStats'],
    queryFn: adminApi.getStats,
    refetchInterval: 30000,
  });

  const adminLinks = [
    {
      title: 'Question Bank',
      description: 'Manage exam questions across all subjects.',
      href: '/admin/questions',
      icon: FileQuestion,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      title: 'Subjects',
      description: 'Add or edit subjects and categories.',
      href: '/admin/subjects',
      icon: BookOpen,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
    },
    {
      title: 'Students',
      description: 'View student performance and management.',
      href: '/admin/students',
      icon: Users,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
    },
  ];

  if (['admin', 'super_admin'].includes(currentUser?.role)) {
    // Check if super_admin to add roster link
    if (currentUser?.role === 'super_admin') {
      const hasRosterLink = adminLinks.some(l => l.href === '/admin/roster');
      if (!hasRosterLink) {
        adminLinks.push({
          title: 'Admin Roster',
          description: 'Manage executive roles and permissions.',
          href: '/admin/roster',
          icon: ShieldCheck,
          color: 'text-danger',
          bg: 'bg-danger/10',
        });
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto w-full max-w-4xl px-5 py-6">
        <Alert variant="danger">Failed to load dashboard statistics.</Alert>
      </div>
    );
  }

  const { stats, recentUsers } = data;

  const statCards = [
    { label: 'Total Signups', value: stats.users.students, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Total Exams Taken', value: stats.usage.totalSessions, icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Active Sessions (1h)', value: stats.usage.activeNow, icon: Activity, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Questions Bank', value: stats.content.questions, icon: FileQuestion, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2.5 rounded-xl">
            <LayoutDashboard className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground-strong tracking-tight">Admin Dashboard</h1>
            <p className="text-muted text-sm font-medium">Real-time overview of TestFlow activity</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted bg-surface p-2 rounded-lg border border-border">
          <Clock className="w-3.5 h-3.5" />
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      <div className="flex justify-end mb-6">
        <Button
          variant="outline"
          size="sm"
          leadingIcon={<Download size={14} />}
          onClick={handleExport}
          className="rounded-xl"
        >
          Export Results (CSV)
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {statCards.map((stat) => (
          <Card key={stat.label} className="p-5 flex flex-col gap-3">
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", stat.bg)}>
              <stat.icon className={cn("w-5 h-5", stat.color)} />
            </div>
            <div>
              <p className="text-xs font-bold text-muted uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-black text-foreground-strong mt-1">{stat.value.toLocaleString()}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted">Management Tools</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {adminLinks.map((link) => (
              <Link key={link.href} to={link.href}>
                <Card className="h-full hover:shadow-md transition-shadow cursor-pointer p-6 group">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", link.bg)}>
                    <link.icon className={cn("w-6 h-6", link.color)} />
                  </div>
                  <h3 className="text-lg font-bold text-foreground-strong mb-2">{link.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{link.description}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted">Recent Signups</h2>
          <Card className="divide-y divide-border overflow-hidden">
            {recentUsers.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted">No recent signups</div>
            ) : (
              recentUsers.map((user) => (
                <div key={user.id} className="p-4 flex items-center gap-3">
                  <Avatar name={user.fullName} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-foreground-strong truncate">{user.fullName}</p>
                    <p className="text-[10px] text-muted truncate">{maskEmail(user.email)}</p>
                  </div>
                  {user.isEmailVerified && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-success flex-shrink-0" />
                  )}
                </div>
              ))
            )}
            <Link to="/admin/students" className="block p-3 text-center text-xs font-bold text-primary hover:bg-surface-strong transition-colors">
              View all students
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;

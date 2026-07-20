import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
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
  CheckCircle2,
  TrendingUp,
  Clock,
  ShieldCheck,
  Download
} from 'lucide-react';
import { cn } from '../../../utils/cn.js';
import { useAuth } from '../../auth/useAuth.js';
import UsernameSetupModal from '../../auth/components/UsernameSetupModal.jsx';

const maskEmail = (email) => {
  if (!email) return '';
  const [name, domain] = email.split('@');
  if (name.length <= 2) return `${name[0]}***@${domain}`;
  return `${name[0]}${name[1]}***${name[name.length - 1]}@${domain}`;
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

function AdminDashboardPage() {
  const { user: currentUser } = useAuth();
  const [setupDismissed, setSetupDismissed] = useState(false);
  const showSetup = Boolean(currentUser && !currentUser.username) && !setupDismissed;

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
    { label: 'Active Students', value: stats.users.activity?.daily || 0, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Total Exams', value: stats.usage.totalSessions, icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Platform Avg', value: `${stats.usage.averageScore}%`, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Total Qs', value: stats.content.questions, icon: FileQuestion, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    { label: 'Active Now', value: stats.usage.activeNow, icon: Clock, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8">
      <UsernameSetupModal open={showSetup} onComplete={() => setSetupDismissed(true)} />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2.5 rounded-xl">
            <LayoutDashboard className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground-strong tracking-tight font-display">Admin Dashboard</h1>
            <p className="text-muted text-sm font-medium">Real-time overview of TestFlow activity</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted bg-surface p-2 rounded-lg border border-border tabular-nums">
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

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
        {statCards.map((stat) => (
          <Card key={stat.label} className="p-5 flex flex-col gap-3">
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", stat.bg)}>
              <stat.icon className={cn("w-5 h-5", stat.color)} />
            </div>
            <div>
              <p className="text-xs font-bold text-muted uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-black text-foreground-strong mt-1 tabular-nums">{stat.value.toLocaleString()}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted">Management Tools</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {adminLinks.map((link) => (
                <Link key={link.href} to={link.href}>
                  <Card className="h-full hover:shadow-md transition-shadow cursor-pointer p-6 group">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", link.bg)}>
                      <link.icon className={cn("w-6 h-6", link.color)} />
                    </div>
                    <h3 className="text-lg font-bold text-foreground-strong mb-2 font-display">{link.title}</h3>
                    <p className="text-sm text-muted leading-relaxed font-medium">{link.description}</p>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted">Engagement & Activity</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="p-5 bg-primary/[0.02] border-primary/10">
                <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Daily Active (DAU)</p>
                <p className="text-2xl font-black text-foreground-strong tabular-nums">{stats.users.activity?.daily || 0}</p>
                <p className="text-[9px] text-muted font-medium mt-1">Users active in last 24h</p>
              </Card>
              <Card className="p-5 bg-primary/[0.02] border-primary/10">
                <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Weekly Active (WAU)</p>
                <p className="text-2xl font-black text-foreground-strong tabular-nums">{stats.users.activity?.weekly || 0}</p>
                <p className="text-[9px] text-muted font-medium mt-1">Users active in last 7 days</p>
              </Card>
              <Card className="p-5 bg-primary/[0.02] border-primary/10">
                <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Monthly Active (MAU)</p>
                <p className="text-2xl font-black text-foreground-strong tabular-nums">{stats.users.activity?.monthly || 0}</p>
                <p className="text-[9px] text-muted font-medium mt-1">Users active in last 30 days</p>
              </Card>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted">Subject Inventory</h2>
            <Card className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {Object.entries(stats.content.levels || {}).sort().map(([level, count]) => (
                  <div key={level} className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-muted uppercase tracking-tighter">{level} Courses</span>
                    <span className="text-2xl font-black text-foreground-strong">{count}</span>
                    <div className="w-full h-1 bg-border rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${stats.content.subjects > 0 ? (count / stats.content.subjects) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-2">
              <Link to="/admin/questions?action=add">
                <Button variant="outline" className="w-full justify-start gap-3 h-12 rounded-xl border-dashed">
                  <FileQuestion size={18} className="text-blue-500" />
                  <span>Add New Question</span>
                </Button>
              </Link>
              <Link to="/admin/subjects?action=add">
                <Button variant="outline" className="w-full justify-start gap-3 h-12 rounded-xl border-dashed">
                  <BookOpen size={18} className="text-green-500" />
                  <span>Create Subject</span>
                </Button>
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted">Recent Signups</h2>
            <Card className="divide-y divide-border overflow-hidden p-0">
            {recentUsers.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted font-medium">No recent signups</div>
            ) : (
              recentUsers.map((user) => (
                <div key={user.id} className="p-4 flex items-center gap-3">
                  <Avatar name={user.fullName} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-foreground-strong truncate">{user.fullName}</p>
                    <p className="text-[10px] font-medium text-muted truncate">{maskEmail(user.email)}</p>
                  </div>
                  {user.isEmailVerified && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-success flex-shrink-0" />
                  )}
                </div>
              ))
            )}
            <Link to="/admin/students" className="block p-4 text-center text-xs font-bold text-primary hover:bg-surface-strong transition-colors border-t border-border">
              View all students
            </Link>
          </Card>
        </div>
      </div>
    </div>
  </div>
);
}

export default AdminDashboardPage;

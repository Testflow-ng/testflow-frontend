import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Download,
  FileQuestion,
  Radio,
  ShieldCheck,
  TrendingUp,
  Users,
  Zap,
  Check,
  Search,
  Settings,
} from 'lucide-react';
import { adminApi } from '../api.js';
import { Spinner, Alert, Button, Card } from '../../../components/ui/index.js';
import { cn } from '../../../utils/cn.js';
import { useAuth } from '../../auth/useAuth.js';
import UsernameSetupModal from '../../auth/components/UsernameSetupModal.jsx';
import AdminStatCard from '../components/AdminStatCard.jsx';
import ActiveUsersChart from '../components/ActiveUsersChart.jsx';
import LevelBarChart from '../components/LevelBarChart.jsx';
import SessionsDonut from '../components/SessionsDonut.jsx';
import RecentStudents from '../components/RecentStudents.jsx';
import AdminActivityFeed from '../components/AdminActivityFeed.jsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

function AdminDashboardPage() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [setupDismissed, setSetupDismissed] = useState(false);
  const [utmeCode, setUtmeCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState(null);

  const showSetup = Boolean(currentUser && !currentUser.username) && !setupDismissed;

  const handleExport = () => {
    window.open(`${API_URL}/api/admin/export-results`, '_blank');
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!utmeCode || verifying) return;
    setVerifying(true);
    setVerifyStatus(null);
    try {
      const res = await fetch('/api/admin/verify-utme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verificationCode: utmeCode })
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Verification failed');
      }
      setVerifyStatus({ type: 'success', message: 'User verified successfully!' });
      setUtmeCode('');
      queryClient.invalidateQueries(['adminStats']);
    } catch (err) {
      setVerifyStatus({ type: 'error', message: err.message });
    } finally {
      setVerifying(false);
    }
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ['adminStats'],
    queryFn: adminApi.getStats,
    refetchInterval: 30000,
  });

  const managementTools = [
    {
      title: 'Question bank',
      description: 'Manage exam questions across all subjects.',
      href: '/admin/questions',
      icon: FileQuestion,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      title: 'Subjects',
      description: 'Add or edit subjects and topics.',
      href: '/admin/subjects',
      icon: BookOpen,
      color: 'text-success',
      bg: 'bg-success/10',
    },
    {
      title: 'Students',
      description: 'View and manage student accounts.',
      href: '/admin/students',
      icon: Users,
      color: 'text-secondary',
      bg: 'bg-secondary/10',
    },
    {
      title: 'Rankings',
      description: 'View Post-UTME performance leaderboards.',
      href: '/admin/rankings',
      icon: TrendingUp,
      color: 'text-info',
      bg: 'bg-info/20',
    },
    {
      title: 'Verifications',
      description: 'Review and approve payment receipts.',
      href: '/admin/verifications',
      icon: Zap,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
    {
      title: 'Platform settings',
      description: 'Configure bank details and global toggles.',
      href: '/admin/settings',
      icon: Settings,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
  ];

  if (currentUser?.role === 'super_admin') {
    managementTools.push({
      title: 'Admin roster',
      description: 'Manage executive roles and permissions.',
      href: '/admin/roster',
      icon: ShieldCheck,
      color: 'text-danger',
      bg: 'bg-danger/10',
    });
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

  const kpis = [
    { label: 'Students', value: stats.users.students, icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Paid UTME', value: stats.users.postUtmePaid, icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Active now', value: stats.usage.activeNow, icon: Radio, color: 'text-success', bg: 'bg-success/10', hint: 'live' },
    { label: 'Total exams', value: stats.usage.totalSessions, icon: TrendingUp, color: 'text-warning', bg: 'bg-warning/10' },
    { label: 'Platform avg', value: `${stats.usage.averageScore}%`, icon: CheckCircle2, color: 'text-info', bg: 'bg-info/10' },
    { label: 'Questions', value: stats.content.questions, icon: FileQuestion, color: 'text-secondary', bg: 'bg-secondary/10' },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8">
      <UsernameSetupModal open={showSetup} onComplete={() => setSetupDismissed(true)} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-extrabold tracking-tight text-foreground-strong sm:text-3xl">
            Admin dashboard
          </h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-muted">
            <Clock size={14} />
            Updated {new Date().toLocaleTimeString()}
            <span className="ml-1 rounded-full bg-surface-strong px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
              Top: {stats.usage.topSubject}
            </span>
          </p>
        </div>
        <Button
          variant="outline"
          size="md"
          leadingIcon={<Download size={16} />}
          onClick={handleExport}
        >
          Export results
        </Button>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {kpis.map((kpi) => (
          <AdminStatCard key={kpi.label} {...kpi} />
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Verification Tool */}
        <Card className="p-6 border-amber-500/20 bg-amber-500/5 lg:col-span-1">
          <div className="flex items-center gap-2 mb-2">
             <Zap size={18} className="text-amber-500 fill-current" />
             <h3 className="text-sm font-black uppercase tracking-widest text-foreground-strong">Verify UTME Code</h3>
          </div>
          <p className="text-[10px] text-muted leading-tight mb-4 italic">
            Manual override: Use this to instantly unlock a student if they paid but cannot upload a receipt.
          </p>
          <form onSubmit={handleVerify} className="space-y-3">
             <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  value={utmeCode}
                  onChange={(e) => setUtmeCode(e.target.value.toUpperCase())}
                  placeholder="UTME-XXXXXX"
                  className="h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-4 text-sm font-bold text-foreground-strong outline-none focus:border-amber-500 transition-colors"
                />
             </div>
             <Button
                type="submit"
                fullWidth
                loading={verifying}
                disabled={!utmeCode}
                className="h-11 rounded-xl bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-500/20"
                leadingIcon={<Check size={18} />}
             >
                Verify Student
             </Button>
          </form>
          {verifyStatus && (
            <div className={cn(
              "mt-4 rounded-xl p-3 text-xs font-bold text-center",
              verifyStatus.type === 'success' ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
            )}>
              {verifyStatus.message}
            </div>
          )}
        </Card>

        {/* Growth Stats */}
        <Card className="p-6 lg:col-span-2">
           <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-foreground-strong">Student Growth Intelligence</h3>
              <TrendingUp size={18} className="text-primary" />
           </div>
           <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                 <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">Today</p>
                 <h4 className="text-3xl font-black text-foreground-strong">+{stats.users.growth?.today || 0}</h4>
                 <div className={cn(
                    "mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black",
                    stats.users.growth?.todayPercent >= 0 ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                 )}>
                    {stats.users.growth?.todayPercent >= 0 ? '+' : ''}{stats.users.growth?.todayPercent}%
                    <span className="text-[8px] font-bold opacity-60">vs yesterday</span>
                 </div>
              </div>
              <div className="text-center border-x border-border">
                 <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">This Week</p>
                 <h4 className="text-3xl font-black text-foreground-strong">+{stats.users.growth?.week || 0}</h4>
                 <div className={cn(
                    "mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black",
                    stats.users.growth?.weekPercent >= 0 ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                 )}>
                    {stats.users.growth?.weekPercent >= 0 ? '+' : ''}{stats.users.growth?.weekPercent}%
                    <span className="text-[8px] font-bold opacity-60">vs last week</span>
                 </div>
              </div>
              <div className="text-center">
                 <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">This Month</p>
                 <h4 className="text-3xl font-black text-foreground-strong">+{stats.users.growth?.month || 0}</h4>
                 <div className={cn(
                    "mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black",
                    stats.users.growth?.monthPercent >= 0 ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                 )}>
                    {stats.users.growth?.monthPercent >= 0 ? '+' : ''}{stats.users.growth?.monthPercent}%
                    <span className="text-[8px] font-bold opacity-60">vs last month</span>
                 </div>
              </div>
           </div>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ActiveUsersChart activity={stats.users.activity} />
        <LevelBarChart levels={stats.content.levels} />
        <SessionsDonut
          total={stats.usage.totalSessions}
          completed={stats.usage.completedSessions}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-4 font-heading text-lg font-bold text-foreground-strong">
            Management
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {managementTools.map((tool) => (
              <Link
                key={tool.href}
                to={tool.href}
                className="group rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-primary/40"
              >
                <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl', tool.bg)}>
                  <tool.icon className={cn('h-5 w-5', tool.color)} />
                </div>
                <h3 className="mt-4 font-bold text-foreground-strong">{tool.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  {tool.description}
                </p>
              </Link>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1 space-y-8">
          <div>
            <h2 className="mb-4 font-heading text-lg font-bold text-foreground-strong flex items-center gap-2">
              <Users size={20} className="text-primary" />
              Recent Students
            </h2>
            <RecentStudents students={recentUsers} />
          </div>

          <div>
            <h2 className="mb-4 font-heading text-lg font-bold text-foreground-strong flex items-center gap-2">
              <ShieldCheck size={20} className="text-secondary" />
              Activity Feed
            </h2>
            <AdminActivityFeed />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;

import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
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
} from 'lucide-react';
import { adminApi } from '../api.js';
import { Spinner, Alert, Button } from '../../../components/ui/index.js';
import { cn } from '../../../utils/cn.js';
import { useAuth } from '../../auth/useAuth.js';
import UsernameSetupModal from '../../auth/components/UsernameSetupModal.jsx';
import AdminStatCard from '../components/AdminStatCard.jsx';
import ActiveUsersChart from '../components/ActiveUsersChart.jsx';
import LevelBarChart from '../components/LevelBarChart.jsx';
import SessionsDonut from '../components/SessionsDonut.jsx';
import RecentStudents from '../components/RecentStudents.jsx';

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
    { label: 'Active now', value: stats.usage.activeNow, icon: Radio, color: 'text-success', bg: 'bg-success/10', hint: 'live' },
    { label: 'Total exams', value: stats.usage.totalSessions, icon: TrendingUp, color: 'text-warning', bg: 'bg-warning/10' },
    { label: 'Platform average', value: `${stats.usage.averageScore}%`, icon: CheckCircle2, color: 'text-info', bg: 'bg-info/10' },
    { label: 'Questions', value: stats.content.questions, icon: FileQuestion, color: 'text-secondary', bg: 'bg-secondary/10' },
    { label: 'Subjects', value: stats.content.subjects, icon: BookOpen, color: 'text-primary', bg: 'bg-primary/10' },
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

        <div className="lg:col-span-1">
          <h2 className="mb-4 font-heading text-lg font-bold text-foreground-strong">
            Recent
          </h2>
          <RecentStudents students={recentUsers} />
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;

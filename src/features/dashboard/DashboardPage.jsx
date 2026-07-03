import { Link } from 'react-router-dom';
import { Alert, Card } from '../../components/ui/index.js';
import { useAuth } from '../auth/useAuth.js';
import SubjectGrid from '../subjects/SubjectGrid.jsx';
import { useStats } from '../analytics/useStats.js';
import { Trophy, Target, Zap, Clock } from 'lucide-react';
import Avatar from '../../components/ui/Avatar.jsx';

function DashboardPage() {
  const { user } = useAuth();
  const { data: stats } = useStats();

  return (
    <section className="mx-auto w-full max-w-5xl flex-1 px-5 py-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar name={user.fullName} size="lg" className="border-2 border-primary/20 p-1" />
            <div className="absolute -bottom-1 -right-1 bg-success rounded-full p-1 border-2 border-background">
              <Zap size={12} className="text-white fill-white" />
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted">Student Portal</p>
            <h1 className="text-3xl font-black text-foreground-strong tracking-tight">
              Hello, {user.fullName.split(' ')[0]}!
            </h1>
          </div>
        </div>

        {/* Quick Stats Banner */}
        {stats && (
          <div className="flex items-center gap-6 px-6 py-3 bg-surface border border-border rounded-2xl shadow-sm">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-muted uppercase tracking-tighter">Avg Score</span>
              <span className="text-lg font-black text-primary">{stats.averageScore}%</span>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-muted uppercase tracking-tighter">Exams</span>
              <span className="text-lg font-black text-foreground-strong">{stats.totalExams}</span>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="flex items-center gap-2">
               <Trophy size={20} className="text-amber-500" />
               <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-muted uppercase tracking-tighter">Best</span>
                  <span className="text-lg font-black text-foreground-strong">{stats.bestScore}%</span>
               </div>
            </div>
          </div>
        )}
      </div>

      {!user.isEmailVerified && (
        <div className="mb-8">
          <Alert variant="warning" className="rounded-2xl border-dashed">
            <div className="flex items-center gap-2">
              <Target size={18} className="text-amber-600" />
              <span>
                Account Restricted: Please verify your email to unlock all subjects.
                <Link to="/profile" className="ml-2 font-bold underline hover:text-amber-700">
                  Verify Now
                </Link>
              </span>
            </div>
          </Alert>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-muted mb-4">Available Courses</h2>
          <SubjectGrid />
        </div>
      </div>
    </section>
  );
}

export default DashboardPage;

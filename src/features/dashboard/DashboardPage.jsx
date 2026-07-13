import { useState, useEffect } from 'react';
import { useAuth } from '../auth/useAuth.js';
import SubjectGrid from '../subjects/SubjectGrid.jsx';
import { useStats } from '../analytics/useStats.js';
import { Trophy, Zap, Flame, Star, Filter } from 'lucide-react';
import Avatar from '../../components/ui/Avatar.jsx';
import UsernameSetupModal from '../auth/components/UsernameSetupModal.jsx';
import { cn } from '../../utils/cn.js';

function DashboardPage() {
  const { user } = useAuth();
  const { data: stats } = useStats();
  const [showSetup, setShowSetup] = useState(false);
  const [filter, setFilter] = useState('all'); // all, 100, 200, 300, 400, 500, pinned

  useEffect(() => {
    // If user has no username, show the setup prompt
    if (user && !user.username) {
      setShowSetup(true);
    }
  }, [user]);

  const levels = ['all', '100', '200', '300', 'pinned'];

  return (
    <section className="mx-auto w-full max-w-5xl flex-1 px-5 py-8">
      <UsernameSetupModal open={showSetup} onComplete={() => setShowSetup(false)} />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar name={user.fullName} size="lg" className="border-2 border-primary/20 p-1" />
            {user.streakCount > 0 && (
              <div className="absolute -top-1 -right-1 bg-orange-500 rounded-full px-1.5 py-0.5 border-2 border-background flex items-center gap-0.5 shadow-sm">
                <Flame size={10} className="text-white fill-white" />
                <span className="text-[10px] font-black text-white leading-none">{user.streakCount}</span>
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 bg-success rounded-full p-1 border-2 border-background">
              <Zap size={12} className="text-white fill-white" />
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted flex items-center gap-2">
              {user.username ? `@${user.username}` : 'Student Portal'}
              {user.streakCount >= 3 && <span className="text-[10px] bg-orange-500/10 text-orange-600 px-2 py-0.5 rounded-full">On Fire 🔥</span>}
            </p>
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

      <div className="space-y-8">
        {/* Filter Bar */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-widest">
            <Filter size={14} />
            Filter Subjects
          </div>
          <div className="flex flex-wrap gap-2">
            {levels.map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilter(lvl)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border",
                  filter === lvl
                    ? "bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105"
                    : "bg-surface border-border text-muted hover:border-border-strong"
                )}
              >
                {lvl === 'pinned' ? <span className="flex items-center gap-1.5"><Star size={12} className="fill-amber-400 text-amber-400" /> My Courses</span> : `${lvl}${lvl !== 'all' ? 'L' : ''}`}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted mb-6 flex items-center gap-3">
             <span className="h-px flex-1 bg-border" />
             Available Courses
             <span className="h-px flex-1 bg-border" />
          </h2>
          <SubjectGrid filter={filter} />
        </div>
      </div>
    </section>
  );
}

export default DashboardPage;

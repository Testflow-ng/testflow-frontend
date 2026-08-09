import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Target,
  Calculator,
  History,
  ChevronRight,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { Card, Button, Badge, Skeleton } from '../../../components/ui/index.js';
import { useAuth } from '../../auth/useAuth.js';
import { cn } from '../../../utils/cn.js';
import { Link, useNavigate } from 'react-router-dom';
import PostUtmeSubjectSelector from './PostUtmeSubjectSelector.jsx';
import AggregateModal from './AggregateModal.jsx';
import PostUtmeRadarChart from './PostUtmeRadarChart.jsx';

function StatTile({ label, value, subValue, icon: Icon, color = 'primary' }) {
  return (
    <Card className="relative overflow-hidden p-5 border-border/50">
      <div className={cn(
        "absolute -right-4 -top-4 size-24 rounded-full opacity-[0.03]",
        `bg-${color}`
      )} />
      <div className="flex items-center justify-between mb-3">
        <div className={cn(
          "flex size-10 items-center justify-center rounded-xl",
          color === 'primary' ? "bg-primary/10 text-primary" : "bg-amber-500/10 text-amber-500"
        )}>
          <Icon size={20} />
        </div>
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">{label}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-2xl font-black text-foreground-strong tracking-tight">{value}</h3>
          {subValue && <span className="text-xs font-bold text-muted">{subValue}</span>}
        </div>
      </div>
    </Card>
  );
}

function PostUtmeDashboard({ stats = [] }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [aggregateOpen, setAggregateOpen] = useState(false);

  // Calculate average score
  const avgScore = stats.length > 0
    ? (stats.reduce((acc, s) => acc + s.totalScore, 0) / stats.length).toFixed(1)
    : '0.0';

  // Aggregate Calculation (simplified example)
  const jambContribution = (user.utmeData?.jambScore || 0) / 8;
  const oLevelContribution = user.utmeData?.oLevelPoints || 0;
  const postUtmeContribution = stats.length > 0 ? parseFloat(avgScore) : 0;
  const totalAggregate = (jambContribution + oLevelContribution + postUtmeContribution).toFixed(2);

  const startTest = async (subjects) => {
    try {
      const res = await fetch('/api/post-utme/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjects })
      });
      if (!res.ok) throw new Error('Failed to start test');
      const data = await res.json();
      navigate(`/exam/${data.session.id}?type=post-utme`);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 lg:py-12">
      {/* Hero Header */}
      <header className="mb-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="primary" className="rounded-full px-3 py-0.5 text-[10px] uppercase tracking-widest font-black">
                Post-UTME Vault
              </Badge>
              <span className="text-[10px] font-bold text-muted uppercase tracking-tighter">
                Session 2024/2025
              </span>
            </div>
            <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground-strong lg:text-4xl">
              Hello, {user.fullName.split(' ')[0]}
            </h1>
            <p className="mt-1 text-sm text-muted">
              You are preparing for <span className="font-bold text-foreground">{user.utmeData?.departmentChoice || 'your chosen department'}</span>.
            </p>
          </div>

          <div className="flex items-center gap-3">
             <Button
                variant="outline"
                onClick={() => setAggregateOpen(true)}
                className="rounded-xl h-11"
                leadingIcon={<Calculator size={18} />}
             >
                Aggregate Tool
             </Button>
             <Button
                onClick={() => setSelectorOpen(true)}
                className="rounded-xl h-11 shadow-lg shadow-primary/20"
                leadingIcon={<Target size={18} />}
             >
                Start Mock Test
             </Button>
          </div>
        </motion.div>
      </header>

      <PostUtmeSubjectSelector
        open={selectorOpen}
        onOpenChange={setSelectorOpen}
        onStart={startTest}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
        <main className="space-y-8">
          {/* Top Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
             <StatTile
                label="Admission Aggregate"
                value={`${totalAggregate}%`}
                subValue={`Target: 75%+`}
                icon={TrendingUp}
             />
             <StatTile
                label="Mock Average"
                value={avgScore}
                subValue="/ 40"
                icon={Target}
                color="amber"
             />
             <StatTile
                label="Tests Completed"
                value={stats.length}
                subValue="Attempts"
                icon={History}
             />
          </div>

          {/* Radar & Aggregate Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <PostUtmeRadarChart stats={stats} />

             <Card className="p-6 border-primary/10">
                <div className="flex items-center justify-between mb-8">
                   <h3 className="text-sm font-black uppercase tracking-widest text-foreground-strong">Aggregate Breakdown</h3>
                   <Sparkles size={18} className="text-primary" />
                </div>

                <div className="space-y-6">
                   <div>
                      <div className="flex items-center justify-between mb-2">
                         <span className="text-xs font-bold text-muted uppercase">JAMB (50%)</span>
                         <span className="text-sm font-black text-foreground-strong">{jambContribution.toFixed(2)} / 50.00</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-surface-strong overflow-hidden">
                         <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${(jambContribution / 50) * 100}%` }} />
                      </div>
                   </div>

                   <div>
                      <div className="flex items-center justify-between mb-2">
                         <span className="text-xs font-bold text-muted uppercase">Post-UTME (40%)</span>
                         <span className="text-sm font-black text-foreground-strong">{postUtmeContribution.toFixed(2)} / 40.00</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-surface-strong overflow-hidden">
                         <div className="h-full bg-amber-500 rounded-full transition-all duration-1000" style={{ width: `${(postUtmeContribution / 40) * 100}%` }} />
                      </div>
                   </div>

                   <div>
                      <div className="flex items-center justify-between mb-2">
                         <span className="text-xs font-bold text-muted uppercase">O-Level (10%)</span>
                         <span className="text-sm font-black text-foreground-strong">{oLevelContribution.toFixed(2)} / 10.00</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-surface-strong overflow-hidden">
                         <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${(oLevelContribution / 10) * 100}%` }} />
                      </div>
                   </div>
                </div>

                <div className="mt-8 flex items-start gap-3 rounded-2xl bg-primary/5 p-4 border border-primary/10">
                   <AlertCircle size={18} className="text-primary shrink-0 mt-0.5" />
                   <p className="text-[11px] leading-relaxed text-foreground-strong">
                     Calculated using your highest JAMB score and best mock test performance.
                   </p>
                </div>
             </Card>
          </div>
        </main>

        <aside className="space-y-6">
          <div className="space-y-3">
             <h4 className="text-[10px] font-black uppercase tracking-widest text-muted px-1">Resources</h4>
             <Link to="/history" className="flex items-center justify-between p-4 rounded-2xl bg-surface border border-border hover:border-primary/30 transition-all group">
                <div className="flex items-center gap-3">
                   <div className="size-8 rounded-lg bg-surface-strong flex items-center justify-center text-muted group-hover:text-primary transition-colors">
                      <History size={16} />
                   </div>
                   <span className="text-xs font-bold text-foreground-strong">Past Attempts</span>
                </div>
                <ChevronRight size={14} className="text-muted" />
             </Link>
          </div>
        </aside>
      </div>
      <AggregateModal
        open={aggregateOpen}
        onOpenChange={setAggregateOpen}
      />
    </div>
  );
}

export default PostUtmeDashboard;

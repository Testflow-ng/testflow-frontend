import { useState } from 'react';
import { Copy, Plus, Users, Zap, ArrowRight, Clock, Trophy } from 'lucide-react';
import { Button } from '../../components/ui/index.js';
import { cn } from '../../utils/cn.js';

function LiveCBTPage() {
  const [joinCode, setJoinCode] = useState('');

  return (
    <section className="mx-auto w-full max-w-2xl flex-1 px-5 pb-28 pt-6 lg:pb-8">
      <div className="mb-8">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-success">
          <Zap size={10} /> Coming soon
        </span>
        <h1 className="mt-2 font-heading text-2xl font-extrabold tracking-tight text-foreground-strong">
          Live CBT
        </h1>
        <p className="mt-1 text-sm text-muted">
          Challenge your friends in real-time exam sessions.
        </p>
      </div>

      {/* Create or Join */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/8 text-primary">
            <Plus size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground-strong">
              Create session
            </h2>
            <p className="mt-1 text-xs text-muted leading-relaxed">
              Pick a subject, set rules, and share a join code with your study
              group.
            </p>
          </div>
          <Button disabled className="mt-auto w-full">
            Create Live CBT
          </Button>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5">
          <div className="flex size-12 items-center justify-center rounded-xl bg-success/8 text-success">
            <Users size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground-strong">
              Join session
            </h2>
            <p className="mt-1 text-xs text-muted leading-relaxed">
              Enter a 6-digit code from a friend to join their live exam
              session.
            </p>
          </div>
          <div className="mt-auto flex gap-2">
            <input
              type="text"
              maxLength={6}
              value={joinCode}
              onChange={(e) =>
                setJoinCode(e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase())
              }
              placeholder="ABC123"
              className="h-11 flex-1 rounded-full border border-border bg-surface-strong px-4 text-center font-mono text-sm font-bold uppercase tracking-[0.3em] text-foreground-strong outline-none placeholder:text-muted/50 focus:border-primary"
            />
            <Button disabled size="md">
              Join
            </Button>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="mt-10">
        <h2 className="text-sm font-bold text-foreground-strong">
          How Live CBT works
        </h2>
        <div className="mt-4 flex flex-col gap-3">
          {[
            {
              icon: <Plus size={16} />,
              title: 'Create or join',
              desc: 'Host creates a session and shares the join code.',
            },
            {
              icon: <Users size={16} />,
              title: 'Wait for participants',
              desc: 'See who has joined in real time. Host starts when ready.',
            },
            {
              icon: <Clock size={16} />,
              title: 'Exam in sync',
              desc: 'Everyone starts simultaneously with a synced timer.',
            },
            {
              icon: <Trophy size={16} />,
              title: 'Instant results',
              desc: 'Live leaderboard and detailed performance review.',
            },
          ].map((step, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-strong text-muted">
                {step.icon}
              </div>
              <div>
                <p className="text-sm font-bold text-foreground-strong">
                  {step.title}
                </p>
                <p className="mt-0.5 text-xs text-muted">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default LiveCBTPage;

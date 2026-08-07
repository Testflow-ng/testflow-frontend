import { useState } from 'react';
import { Plus, Users, Zap, Clock, Trophy } from 'lucide-react';
import { Button } from '../../components/ui/index.js';
import { cardClasses } from '../../components/ui/surfaces.js';
import Screen from '../../components/layout/Screen.jsx';

function LiveCBTPage() {
  const [joinCode, setJoinCode] = useState('');

  return (
    <Screen width="lg">
      <div className="mb-6">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-success">
          <Zap size={11} aria-hidden="true" /> Coming soon
        </span>
        <h1 className="mt-2.5 font-heading text-[1.625rem] font-extrabold leading-tight tracking-tight text-foreground-strong">
          Live CBT
        </h1>
        <p className="mt-1 text-sm leading-snug text-muted">
          Challenge your friends in real-time exam sessions.
        </p>
      </div>

      {/* Create or Join */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className={cardClasses({ padding: 'lg', className: 'flex flex-col gap-4' })}>
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/8 text-primary">
            <Plus size={22} />
          </div>
          <div>
            <h2 className="text-[17px] font-bold leading-snug tracking-tight text-foreground-strong">
              Create session
            </h2>
            <p className="mt-1 text-[13px] leading-relaxed text-muted">
              Pick a subject, set rules, and share a join code with your study
              group.
            </p>
          </div>
          <Button disabled className="mt-auto w-full">
            Create Live CBT
          </Button>
        </div>

        <div className={cardClasses({ padding: 'lg', className: 'flex flex-col gap-4' })}>
          <div className="flex size-12 items-center justify-center rounded-xl bg-success/8 text-success">
            <Users size={22} />
          </div>
          <div>
            <h2 className="text-[17px] font-bold leading-snug tracking-tight text-foreground-strong">
              Join session
            </h2>
            <p className="mt-1 text-[13px] leading-relaxed text-muted">
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
              aria-label="Session join code"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              className="h-12 min-w-0 flex-1 rounded-full border border-border bg-surface-strong px-4 text-center font-mono text-base font-bold uppercase tracking-[0.25em] text-foreground-strong outline-none placeholder:text-muted/50 focus:border-primary sm:h-11"
            />
            <Button disabled size="md" className="shrink-0 px-5">
              Join
            </Button>
          </div>
        </div>
      </div>

      {/* How it works */}
      <section className="mt-8">
        <h2 className="text-[15px] font-bold tracking-tight text-foreground-strong">
          How Live CBT works
        </h2>
        <div className="mt-3 flex flex-col gap-2">
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
              className={cardClasses({ padding: 'md', className: 'flex items-start gap-3' })}
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-strong text-muted">
                {step.icon}
              </div>
              <div className="min-w-0">
                <p className="text-[15px] font-semibold leading-snug text-foreground-strong">
                  {step.title}
                </p>
                <p className="mt-0.5 text-[13px] leading-snug text-muted">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </Screen>
  );
}

export default LiveCBTPage;

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, Plus, Trophy, Users } from 'lucide-react';
import { Button, Card, Input, Reveal } from '../../components/ui/index.js';
import { ICON_LG } from '../../components/ui/iconProps.js';
import Mascot from '../../components/brand/Mascot.jsx';
import Screen, { PageHeader } from '../../components/layout/Screen.jsx';
import { FeatureCard, FeatureGrid } from '../../components/marketing/FeatureCard.jsx';
import CreateSessionModal from './CreateSessionModal.jsx';
import { useEntitlement } from '../billing/useBilling.js';

const STEPS = [
  { icon: Plus, title: 'Create or join', text: 'The host creates a session and shares the join code.' },
  { icon: Users, title: 'Host approves', text: 'The host lets friends in from the waiting room and starts when ready.' },
  { icon: Clock, title: 'Exam in sync', text: 'Everyone races the same server clock. No pausing.' },
  { icon: Trophy, title: 'Ranked results', text: 'A leaderboard and full corrections once the host publishes.' },
];

function LiveCBTPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [creating, setCreating] = useState(false);
  const ready = code.length >= 6;
  const { data: held } = useEntitlement();
  // Only block when the backend says we do not hold the hosting pass; while it loads, let the button work.
  const needsPass = held ? !held.liveCbtHost : false;

  const join = (e) => {
    e.preventDefault();
    if (ready) navigate(`/live/${code}`);
  };

  return (
    <Screen width="xl">
      <PageHeader title="Live CBT" subtitle="Sit the same exam with your friends, at the same time." />

      <Reveal className="mt-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Card padding="lg" className="flex flex-col gap-4 bg-[var(--brand-lavender)]">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-surface text-primary">
              <Plus {...ICON_LG} />
            </span>
            <div>
              <h2 className="font-heading text-lg font-bold tracking-tight text-foreground-strong">Host a session</h2>
              <p className="mt-1 text-sm leading-relaxed text-foreground">Pick a subject, set the rules and share a code with your study group.</p>
            </div>
            {needsPass ? (
              <div className="mt-auto space-y-2">
                <Link to="/billing"><Button className="w-full">Get a Student Pass to host</Button></Link>
                <p className="text-center text-xs text-foreground">Hosting needs a pass. Joining is always free.</p>
              </div>
            ) : (
              <Button className="mt-auto w-full" onClick={() => setCreating(true)}>Create a session</Button>
            )}
          </Card>

          <Card padding="lg" className="flex flex-col gap-4">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-[var(--brand-sage)] text-secondary">
              <Users {...ICON_LG} />
            </span>
            <div>
              <h2 className="font-heading text-lg font-bold tracking-tight text-foreground-strong">Join a session</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted">Enter the code from your host. They approve you, then you wait for the start.</p>
            </div>
            <form onSubmit={join} className="mt-auto flex gap-2">
              <Input
                value={code}
                maxLength={16}
                onChange={(e) => setCode(e.target.value.replace(/[^a-zA-Z2-9]/g, '').toUpperCase())}
                placeholder="ABC234"
                aria-label="Session join code"
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
                className="text-center font-mono font-bold uppercase tracking-[0.25em]"
              />
              <Button type="submit" disabled={!ready} className="shrink-0">Join</Button>
            </form>
          </Card>
        </div>
      </Reveal>

      <Reveal delay={0.1} className="mt-8">
        <div className="mb-3 flex items-center gap-3">
          <Mascot mood="excited" size={44} />
          <h2 className="font-heading text-lg font-bold tracking-tight text-foreground-strong">How Live CBT works</h2>
        </div>
        <FeatureGrid cols={4}>
          {STEPS.map((s) => (
            <FeatureCard key={s.title} icon={s.icon} title={s.title} text={s.text} tone="surface" />
          ))}
        </FeatureGrid>
      </Reveal>

      <CreateSessionModal open={creating} onOpenChange={setCreating} />
    </Screen>
  );
}

export default LiveCBTPage;

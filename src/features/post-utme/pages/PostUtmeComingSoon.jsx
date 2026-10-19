import { Target } from 'lucide-react';
import { Badge, Card, Reveal } from '../../../components/ui/index.js';
import Mascot from '../../../components/brand/Mascot.jsx';
import Screen, { PageHeader } from '../../../components/layout/Screen.jsx';

/** Post-UTME is paused. The full feature (hub, lock screen, dashboard, calculator) is kept in this folder, unrouted. */
function PostUtmeComingSoon() {
  return (
    <Screen width="xl">
      <PageHeader
        title="Post-UTME"
        subtitle="Practice for your university screening."
        action={<Badge variant="lime"><Target size={12} aria-hidden="true" /> Coming soon</Badge>}
      />
      <Reveal className="mt-6">
        <Card padding="lg" className="flex flex-col items-center gap-5 bg-[var(--brand-lavender)] text-center sm:flex-row sm:text-left">
          <Mascot mood="thinking" animation="float" size={112} />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">Coming soon</p>
            <h2 className="mt-1 font-heading text-2xl font-extrabold tracking-tight text-foreground-strong">
              Post-UTME practice is <em className="tf-accent font-normal">on the way</em>
            </h2>
            <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-foreground">
              We are getting it ready. In the meantime, practise your courses and track your progress.
            </p>
          </div>
        </Card>
      </Reveal>
    </Screen>
  );
}

export default PostUtmeComingSoon;

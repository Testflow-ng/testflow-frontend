import { Link } from 'react-router-dom';
import { Badge, Button, Card, Reveal } from '../../../components/ui/index.js';
import Mascot from '../../../components/brand/Mascot.jsx';
import Screen, { PageHeader } from '../../../components/layout/Screen.jsx';

/** One coming-soon page for any workspace feature that is built but switched off (see flags.js). */
function ComingSoonScreen({ title, subtitle, icon: Icon, headline, text, cta }) {
  return (
    <Screen width="xl">
      <PageHeader title={title} subtitle={subtitle} action={<Badge variant="lime"><Icon size={12} aria-hidden="true" /> Coming soon</Badge>} />
      <Reveal className="mt-6">
        <Card padding="lg" className="flex flex-col items-center gap-5 bg-[var(--brand-lavender)] text-center sm:flex-row sm:text-left">
          <Mascot mood="thinking" animation="float" size={112} />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">Coming soon</p>
            <h2 className="mt-1 font-heading text-2xl font-extrabold tracking-tight text-foreground-strong">{headline} <em className="tf-accent font-normal">is on the way</em></h2>
            <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-foreground">{text}</p>
            {cta && <Link to={cta.to} className="mt-4 inline-block"><Button>{cta.label}</Button></Link>}
          </div>
        </Card>
      </Reveal>
    </Screen>
  );
}

export default ComingSoonScreen;

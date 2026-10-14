import { BookOpen, Brain, LineChart, Sparkles, Target, TrendingUp, Zap } from 'lucide-react';
import { Badge, Card, Reveal } from '../../components/ui/index.js';
import Mascot from '../../components/brand/Mascot.jsx';
import Screen, { PageHeader } from '../../components/layout/Screen.jsx';
import { FeatureCard, FeatureGrid } from '../../components/marketing/FeatureCard.jsx';

const PLANNED = [
  { icon: Target, title: 'Smart revision', text: 'Finds your weak areas and builds focused review sessions.' },
  { icon: Zap, title: 'Auto quiz generation', text: 'Generates practice questions from your weakest topics.' },
  { icon: Brain, title: 'Learning insights', text: 'Understands your study patterns and suggests the best times to study.' },
  { icon: TrendingUp, title: 'Progress predictions', text: 'Projects your exam readiness from your current trend.' },
  { icon: BookOpen, title: 'Study summaries', text: 'Short summaries of the topics you practised, with the key ideas.' },
  { icon: LineChart, title: 'Adaptive difficulty', text: 'Adjusts question difficulty to your level in each topic.' },
];

function AIStudyPage() {
  return (
    <Screen width="xl">
      <PageHeader
        title="AI Study"
        subtitle="Smart tools to help you study more effectively."
        action={<Badge variant="lime"><Sparkles size={12} aria-hidden="true" /> Coming soon</Badge>}
      />

      <Reveal className="mt-6">
        <Card padding="lg" className="flex flex-col items-center gap-5 bg-[var(--brand-lavender)] text-center sm:flex-row sm:text-left">
          <Mascot mood="thinking" animation="float" size={112} />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">Coming soon</p>
            <h2 className="mt-1 font-heading text-2xl font-extrabold tracking-tight text-foreground-strong">
              Your study companion is <em className="tf-accent font-normal">on the way</em>
            </h2>
            <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-foreground">
              We are still building this. Until then, keep practising and your results will shape what it suggests first.
            </p>
          </div>
        </Card>
      </Reveal>

      <Reveal delay={0.1} className="mt-8">
        <h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-muted">What is planned</h2>
        <FeatureGrid>
          {PLANNED.map((f) => (
            <FeatureCard key={f.title} icon={f.icon} title={f.title} text={f.text} tone="surface" />
          ))}
        </FeatureGrid>
      </Reveal>
    </Screen>
  );
}

export default AIStudyPage;

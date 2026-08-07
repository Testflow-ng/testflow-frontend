import {
  BookOpen,
  Brain,
  LineChart,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react';
import Screen from '../../components/layout/Screen.jsx';
import { cardClasses } from '../../components/ui/surfaces.js';

function AIStudyPage() {
  return (
    <Screen width="lg">
      <div className="mb-6">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-info/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-info">
          <Sparkles size={11} aria-hidden="true" /> Coming soon
        </span>
        <h1 className="mt-2.5 font-heading text-[1.625rem] font-extrabold leading-tight tracking-tight text-foreground-strong">
          AI Study Companion
        </h1>
        <p className="mt-1 text-sm leading-snug text-muted">
          Smart tools to help you study more effectively.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {[
          {
            icon: <Target size={20} />,
            title: 'Smart revision',
            desc: 'Automatically identifies your weak areas and creates focused review sessions.',
            accent: 'bg-primary/8 text-primary',
          },
          {
            icon: <Zap size={20} />,
            title: 'Auto quiz generation',
            desc: 'Generates practice questions from your weakest topics.',
            accent: 'bg-warning/8 text-warning',
          },
          {
            icon: <Brain size={20} />,
            title: 'Learning insights',
            desc: 'Understands your study patterns and suggests optimal study times.',
            accent: 'bg-success/8 text-success',
          },
          {
            icon: <LineChart size={20} />,
            title: 'Progress predictions',
            desc: 'Projects your exam readiness based on current performance trends.',
            accent: 'bg-info/8 text-info',
          },
          {
            icon: <BookOpen size={20} />,
            title: 'Study summaries',
            desc: 'Concise summaries of topics you have practiced, highlighting key concepts.',
            accent: 'bg-secondary/8 text-secondary',
          },
          {
            icon: <TrendingUp size={20} />,
            title: 'Adaptive difficulty',
            desc: 'Adjusts question difficulty based on your skill level in each topic.',
            accent: 'bg-danger/8 text-danger',
          },
        ].map((feature) => (
          <div
            key={feature.title}
            className={cardClasses({
              padding: 'lg',
              className: 'flex flex-col gap-3 opacity-70',
            })}
          >
            <div className={`flex size-10 items-center justify-center rounded-xl ${feature.accent}`}>
              {feature.icon}
            </div>
            <div>
              <h3 className="text-[15px] font-semibold leading-snug text-foreground-strong">
                {feature.title}
              </h3>
              <p className="mt-1 text-[13px] leading-relaxed text-muted">
                {feature.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-dashed border-border bg-surface-strong px-5 py-6 text-center">
        <Sparkles size={28} className="mx-auto text-muted/40" aria-hidden="true" />
        <p className="mt-3 text-[15px] font-semibold text-foreground-strong">
          Under development
        </p>
        <p className="mx-auto mt-1.5 max-w-[26rem] text-[13px] leading-relaxed text-muted">
          These AI features are being built by our team. They will activate
          automatically once available. Keep practicing to get the most from
          them.
        </p>
      </div>
    </Screen>
  );
}

export default AIStudyPage;

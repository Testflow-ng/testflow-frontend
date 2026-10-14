import { CalendarDays, Globe, ShieldCheck } from 'lucide-react';
import SectionHeading from '../../../components/marketing/SectionHeading.jsx';
import { FeatureCard, FeatureGrid } from '../../../components/marketing/FeatureCard.jsx';
import FaqAccordion from '../../../components/marketing/FaqAccordion.jsx';
import PlanCard from '../../../components/marketing/PlanCard.jsx';
import TeamCard from '../../../components/marketing/TeamCard.jsx';

export default [
  {
    id: 'section-heading', name: 'Section heading and feature cards', category: 'Marketing', source: ['marketing/SectionHeading.jsx', 'marketing/FeatureCard.jsx'],
    description: 'Title with an italic serif accent, and icon cards in a responsive grid.',
    keywords: ['heading', 'features', 'landing', 'marketing', 'grid', 'cards', 'accent'],
    Preview: () => (
      <div className="space-y-6">
        <SectionHeading eyebrow="Less cramming. More growing." title="Built for how you" accent="actually study." side="Learning is personal. Your prep should be too." />
        <FeatureGrid>
          <FeatureCard icon={CalendarDays} title="A plan that gets you" text="A clear, flexible study plan built around your goal." to="/" linkLabel="See how it works" />
          <FeatureCard icon={Globe} tone="sage" title="Your own site" text="yourname.testflow.com.ng, or connect your own domain." />
          <FeatureCard icon={ShieldCheck} tone="ink" title="Data kept separate" text="Each organisation's data stays its own." />
        </FeatureGrid>
      </div>
    ),
    usage: `import SectionHeading from '../components/marketing/SectionHeading.jsx';
import { FeatureCard, FeatureGrid } from '../components/marketing/FeatureCard.jsx';

<SectionHeading eyebrow="Less cramming." title="Built for how you" accent="actually study." />
<FeatureGrid cols={3}>
  <FeatureCard icon={Globe} tone="sage" title="Your own site" text="yourname.testflow.com.ng" />   {/* tone: lavender | sage | surface | ink */}
</FeatureGrid>`,
  },
  {
    id: 'plans', name: 'Plan card, FAQ and team card', category: 'Marketing', source: ['marketing/PlanCard.jsx', 'marketing/FaqAccordion.jsx', 'marketing/TeamCard.jsx'],
    description: 'Pricing plans, an accessible FAQ accordion and team member cards.',
    keywords: ['pricing', 'plan', 'faq', 'accordion', 'team', 'about', 'landing'],
    Preview: () => (
      <div className="space-y-8">
        <div className="grid gap-4 md:grid-cols-2">
          <PlanCard name="Pro" price="₦7,000" blurb="Your branded platform and dashboard." note="Shows sponsored ads to your students" points={['Your own site', 'No-code builder', 'Automatic marking']} ctaLabel="Choose Pro" to="/everybody/register" />
          <PlanCard featured badge="Ad-free" name="Studio" price="₦20,000" blurb="Everything in Pro, completely ad-free." points={['Everything in Pro', 'No ads, ever', 'Built for schools']} ctaLabel="Choose Studio" to="/everybody/register" />
        </div>
        <FaqAccordion defaultOpen={[0]} items={[['Do I need to code?', 'No. You pick a plan, add your name, logo and colours, and build your site with simple blocks.'], ['Can I use my own domain?', 'Yes. Every organisation gets a yourname.testflow.com.ng site and can connect their own domain.']]} />
        <div className="grid gap-4 md:grid-cols-2">
          <TeamCard name="Feranmi Oresajo" role="Core lead" summary="Leads Testflow and built the exam runtime and landing pages." avatar="/team/feranmi-oresajo.webp" links={[{ label: 'GitHub', href: 'https://github.com/Ferousco-dev' }, { label: 'Portfolio', href: 'https://feranmi.appmd.dev' }]} />
          <TeamCard name="Akinrinola Abdulqudus" role="UI/UX designer" summary="Testflow's product designer, and the founder of Ecovest." />
        </div>
      </div>
    ),
    usage: `import PlanCard from '../components/marketing/PlanCard.jsx';
import FaqAccordion from '../components/marketing/FaqAccordion.jsx';
import TeamCard from '../components/marketing/TeamCard.jsx';

<PlanCard featured badge="Ad-free" name="Studio" price="₦20,000" blurb="Everything in Pro."
  points={['No ads, ever']} ctaLabel="Choose Studio" to="/everybody/register" />
<FaqAccordion defaultOpen={[0]} items={[['Question?', 'Answer.']]} />
<TeamCard name="Feranmi Oresajo" role="Core lead" summary="..." avatar="/team/feranmi-oresajo.webp" />`,
  },
];

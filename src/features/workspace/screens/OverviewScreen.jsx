import { Link } from 'react-router-dom';
import { ArrowRight, Check, ChevronRight, Circle, FileQuestion, ListChecks, Plus, Share2, Users, Wallet } from 'lucide-react';
import { Button, Card, ProgressBar, Reveal } from '../../../components/ui/index.js';
import StatCard from '../../../components/data/StatCard.jsx';
import Screen, { PageHeader } from '../../../components/layout/Screen.jsx';
import { ICON } from '../../../components/ui/iconProps.js';
import { cn } from '../../../utils/cn.js';
import { formatMoney } from '../../../utils/money.js';
import { useOrg } from '../OrgContext.js';
import { useDomains, useEarnings, useExams, useSite, useStudents } from '../useWorkspace.js';

const HOW = [
  { icon: FileQuestion, title: 'Create an exam', text: 'Give it a name. Anytime, or a Live CBT on Studio.', to: '/workspace/exams' },
  { icon: Check, title: 'Add questions', text: 'Type them, import a file, or add pictures.', to: '/workspace/exams' },
  { icon: Share2, title: 'Make it live and share', text: 'Send the link. Free, or charge a fee.', to: '/workspace/exams' },
  { icon: Users, title: 'See the results', text: 'Scores for every student, in one place.', to: '/workspace/students' },
];

function OverviewScreen() {
  const { org } = useOrg();
  const site = useSite().data;
  const exams = useExams().data ?? [];
  const students = useStudents({ limit: 1 }).data;
  const earnings = useEarnings().data;
  const domains = useDomains().data ?? [];

  const steps = [
    { done: Boolean(site?.brand?.logoUrl), label: 'Add your name and logo', to: '/workspace/domains' },
    { done: exams.length > 0, label: 'Create your first exam', to: '/workspace/exams' },
    { done: (students?.total ?? 0) > 0, label: 'Invite your students', to: '/workspace/students' },
    { done: org.payout?.status === 'active', label: 'Add your payout account', to: '/workspace/payments' },
    { done: domains.some((d) => d.type === 'custom' && d.status === 'active') || domains.length > 0, label: 'Choose your web address', to: '/workspace/domains' },
  ];
  const doneCount = steps.filter((s) => s.done).length;
  const allDone = doneCount === steps.length;

  return (
    <Screen width="full">
      <PageHeader
        title={`Welcome, ${org.name}`}
        subtitle="Build your CBT, set your prices and see how it is doing."
        action={<Link to="/workspace/exams" className="w-full sm:w-auto"><Button size="lg" className="w-full sm:w-auto" leadingIcon={<Plus {...ICON} />}>Create an exam</Button></Link>}
      />
      <div className="mt-6 space-y-6 sm:mt-8 sm:space-y-8">
        {/* Your numbers first. On phones earnings is the wide tile on top; from sm up the order is students, exams, earnings. */}
        <Reveal>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            <StatCard className="order-first col-span-2 p-4 sm:order-last sm:col-span-1 sm:p-5" label="Your earnings, 30 days" value={formatMoney(earnings?.totals?.last30d ?? 0)} icon={Wallet} tone="accent" />
            <StatCard className="p-4 sm:p-5" label="Students" value={students?.total ?? 0} icon={Users} tone="primary" />
            <StatCard className="p-4 sm:p-5" label="Exams" value={exams.length} icon={ListChecks} tone="sage" />
          </div>
        </Reveal>

        {/* The set-up list is only worth space while something is left to do. */}
        {!allDone && (
          <Reveal delay={0.04}>
            <Card padding="lg" className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-6">
              <div>
                <div className="flex items-baseline justify-between gap-3 lg:block">
                  <h2 className="font-heading text-lg font-bold text-foreground-strong">Get set up</h2>
                  <p className="text-sm text-muted lg:mt-1">{doneCount} of {steps.length} done</p>
                </div>
                <ProgressBar className="mt-3 lg:mt-4" value={doneCount} max={steps.length} tone="accent" />
              </div>
              <ul className="grid gap-2 sm:grid-cols-2">
                {steps.map((st) => (
                  <li key={st.label}>
                    <Link to={st.to} className="flex min-h-12 items-center gap-3 rounded-2xl border border-border p-3 text-sm hover:bg-surface-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                      <span className={cn('flex size-6 shrink-0 items-center justify-center rounded-full', st.done ? 'bg-success text-white' : 'border border-border-strong text-muted')}>{st.done ? <Check size={14} aria-hidden="true" /> : <Circle size={10} aria-hidden="true" />}</span>
                      <span className={st.done ? 'text-muted line-through' : 'font-medium text-foreground-strong'}>{st.label}</span>
                      {!st.done && <ArrowRight size={14} className="ml-auto shrink-0 text-muted" aria-hidden="true" />}
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          </Reveal>
        )}

        {/* How it works: one tidy list on phones, four cards from sm up. */}
        <Reveal delay={0.08}>
          <section aria-labelledby="how">
            <h2 id="how" className="mb-3 font-heading text-base font-bold text-foreground-strong sm:sr-only">How it works</h2>
            <ol className="divide-y divide-border overflow-hidden rounded-[20px] border border-border bg-surface sm:hidden">
              {HOW.map(({ icon: Icon, title, text, to }, i) => (
                <li key={title}>
                  <Link to={to} className="flex min-h-16 items-center gap-3 px-4 py-3 hover:bg-surface-strong/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-lavender)] text-primary"><Icon {...ICON} size={18} /></span>
                    <span className="min-w-0 flex-1"><span className="block font-semibold text-foreground-strong">{i + 1}. {title}</span><span className="block text-sm text-muted">{text}</span></span>
                    <ChevronRight {...ICON} size={18} className="shrink-0 text-muted" />
                  </Link>
                </li>
              ))}
            </ol>
            <ol className="hidden gap-3 sm:grid sm:grid-cols-2 xl:grid-cols-4">
              {HOW.map(({ icon: Icon, title, text, to }, i) => (
                <li key={title}><Link to={to} className="tf-pressable flex h-full gap-3 rounded-[20px] border border-border bg-surface p-4 hover:bg-surface-strong/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-lavender)] text-primary"><Icon size={18} strokeWidth={1.5} aria-hidden="true" /></span><span><span className="block font-semibold text-foreground-strong">{i + 1}. {title}</span><span className="block text-sm text-muted">{text}</span></span></Link></li>
              ))}
            </ol>
          </section>
        </Reveal>
      </div>
    </Screen>
  );
}

export default OverviewScreen;

import { useQuery } from '@tanstack/react-query';
import { Clock, FileQuestion, Megaphone } from 'lucide-react';
import { Badge, Button, Card, EmptyState, SkeletonCard } from '../../components/ui/index.js';
import { fmtDate } from '../admin/screens/format.js';
import { formatMoney } from '../../utils/money.js';
import TenantAd from './TenantAd.jsx';
import TenantShell from './TenantShell.jsx';
import { useTenant } from './TenantContext.js';
import { tenantApi } from './tenantApi.js';

/** What a signed-in student sees: the organisation's welcome and its exams. Branded as the organisation, with a small Testflow credit. */
function TenantPortal() {
  const { brand, site, user, hostname } = useTenant();
  const welcome = site?.portal?.welcome ?? {};
  const { data: exams, isLoading } = useQuery({ queryKey: ['tenant', hostname, 'exams'], queryFn: tenantApi.exams });
  const { data: notices } = useQuery({ queryKey: ['tenant', hostname, 'notices'], queryFn: tenantApi.announcements });
  const showExams = site?.pages?.exams !== false;

  return (
    <TenantShell wide>
      <section className="grid items-center gap-6 rounded-[28px] bg-primary p-8 text-primary-foreground sm:grid-cols-[minmax(0,1fr)_auto] sm:p-10">
        <div>
          <h1 className="font-heading text-3xl font-extrabold leading-tight tracking-tight text-primary-foreground sm:text-4xl">{welcome.heading || `Welcome, ${user.fullName.split(' ')[0]}`}</h1>
          <p className="mt-3 max-w-[46ch] text-primary-foreground/85">{welcome.text || `Pick an exam below to get started with ${brand.name}.`}</p>
        </div>
        {welcome.imageUrl && <img src={welcome.imageUrl} alt="" className="hidden max-h-44 rounded-2xl object-cover sm:block" />}
      </section>

      {notices?.length > 0 && (
        <section className="mt-8" aria-labelledby="notices">
          <h2 id="notices" className="mb-3 flex items-center gap-2 font-heading text-lg font-extrabold tracking-tight text-foreground-strong"><Megaphone size={18} aria-hidden="true" /> Announcements</h2>
          <ul className="space-y-2">{notices.map((n) => <li key={n.id} className="rounded-2xl border border-border bg-surface p-4 text-sm leading-relaxed text-foreground-strong">{n.pinned && <Badge variant="lime" className="mb-2">Pinned</Badge>}<p>{n.text}</p><p className="mt-1.5 text-xs text-muted">{fmtDate(n.createdAt)}</p></li>)}</ul>
        </section>
      )}

      {showExams && (
        <section className="mt-10" aria-labelledby="exams">
          <h2 id="exams" className="mb-4 font-heading text-xl font-extrabold tracking-tight text-foreground-strong">Your exams</h2>
          {isLoading ? <div className="grid gap-4 sm:grid-cols-2"><SkeletonCard className="h-36" /><SkeletonCard className="h-36" /></div> : !exams?.length ? (
            <EmptyState icon={FileQuestion} title="No exams yet" description={`${brand.name} has not published an exam yet. Check back soon.`} />
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2">
              {exams.map((e) => (
                <li key={e.id}>
                  <Card padding="lg" className="flex h-full flex-col gap-3">
                    <div className="flex items-start justify-between gap-3"><h3 className="font-heading text-lg font-bold text-foreground-strong">{e.title}</h3>{e.priceMinor ? <Badge variant="lime">{formatMoney(e.priceMinor)}</Badge> : <Badge variant="outline">Free</Badge>}</div>
                    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted"><span>{e.questionCount ?? 0} questions</span><span className="inline-flex items-center gap-1"><Clock size={13} aria-hidden="true" />{e.durationMinutes} min</span>{e.mode === 'live' && <Badge variant="lavender">Live CBT</Badge>}</p>
                    <Button className="mt-auto" disabled title="Taking exams on your own site is opening soon">{e.priceMinor ? `Pay ${formatMoney(e.priceMinor)} and start` : 'Start exam'}</Button>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <TenantAd slot="portal_home" className="mt-10" />
    </TenantShell>
  );
}

export default TenantPortal;

import { useState } from 'react';
import { Check, ExternalLink, Globe, Link2, Type } from 'lucide-react';
import { Badge, Banner, Button, Card, CopyField, Field, Input, Reveal, Skeleton, useToast } from '../../../components/ui/index.js';
import ColorPicker from '../../../components/everybody/ColorPicker.jsx';
import ImageField from '../../../components/everybody/ImageField.jsx';
import OrgThemeProvider from '../../../components/everybody/OrgThemeProvider.jsx';
import Screen, { PageHeader } from '../../../components/layout/Screen.jsx';
import { ICON } from '../../../components/ui/iconProps.js';
import { cn } from '../../../utils/cn.js';
import { wsApi } from '../api.js';
import { useOrg } from '../OrgContext.js';
import { useDomains, useSite, useWsMutation } from '../useWorkspace.js';

const HOST = 'testflow.com.ng';

const Section = ({ icon: Icon, step, title, text, children }) => (
  <Card padding="lg" className="space-y-6">
    <header className="flex items-start gap-4">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--brand-lavender)] text-primary"><Icon {...ICON} size={20} /></span>
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">Step {step}</p>
        <h2 className="font-heading text-lg font-extrabold tracking-tight text-foreground-strong">{title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted">{text}</p>
      </div>
    </header>
    {children}
  </Card>
);

/** How the organisation looks to the world: its name and logo, and the address people use to find it. One button opens the real site. */
function DomainsScreen() {
  const { org } = useOrg();
  const { data: site } = useSite();
  const domains = useDomains().data ?? [];
  const [draft, setDraft] = useState(null); // { name, logo } while editing

  if (!site) return <Screen width="full"><Skeleton className="mt-8 h-96 w-full rounded-[24px]" /></Screen>;

  const sub = domains.find((d) => d.type === 'subdomain');
  const custom = domains.find((d) => d.type === 'custom');
  const host = custom?.status === 'active' ? custom.hostname : sub?.hostname ?? `${org.slug}.${HOST}`;

  return (
    <Screen width="full">
      <PageHeader title="Name and domain" subtitle="What your CBT is called, its logo, and where people find it." />
      <div className="mt-8 grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <Reveal><NameAndLogo key={site.version ?? 0} site={site} org={org} onDraft={setDraft} /></Reveal>
          <Reveal delay={0.06}><Address sub={sub} orgSlug={org.slug} /></Reveal>
          <Reveal delay={0.12}><OwnDomain custom={custom} /></Reveal>
        </div>
        <Reveal delay={0.1} className="xl:sticky xl:top-6"><PreviewLink host={host} dirty={Boolean(draft)} /></Reveal>
      </div>
    </Screen>
  );
}

function NameAndLogo({ site, org, onDraft }) {
  const toast = useToast();
  const { orgId } = useOrg();
  const saved = { name: site.brand?.name ?? org.name, logo: site.brand?.logoUrl ?? '', primary: site.brand?.primaryColor ?? '#163a5f', accent: site.brand?.accentColor ?? '#f5c542' };
  const [v, setV] = useState(saved);
  const dirty = JSON.stringify(v) !== JSON.stringify(saved);
  const update = (patch) => { const next = { ...v, ...patch }; setV(next); onDraft(JSON.stringify(next) === JSON.stringify(saved) ? null : next); };

  const save = useWsMutation(async (id) => { await wsApi.saveSite(id, { brand: { ...site.brand, name: v.name.trim(), logoUrl: v.logo, primaryColor: v.primary, accentColor: v.accent } }); return wsApi.publishSite(id); }, {
    onSuccess: () => { onDraft(null); toast.success('Saved', 'Your site now uses your name, logo and colours.'); },
    onError: (e) => toast.error('Could not save', e.message),
  });

  return (
    <Section icon={Type} step={1} title="Name, logo and colours" text='Shown instead of "Testflow" everywhere your students look: the header, the browser tab, the sign-in page and shared links.'>
      <div className="grid gap-6 lg:grid-cols-2">
        <Field label="Name" hint="This is what students see everywhere."><Input value={v.name} maxLength={60} onChange={(e) => update({ name: e.target.value })} placeholder="Grace CBT" /></Field>
        <ImageField label="Logo" value={v.logo} onChange={(l) => update({ logo: l })} upload={(file) => wsApi.uploadSiteImage(orgId, file)} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <ColorPicker label="Main colour" value={v.primary} onChange={(c) => update({ primary: c })} />
        <ColorPicker label="Accent colour" checkContrast={false} value={v.accent} onChange={(c) => update({ accent: c })} />
      </div>
      <OrgThemeProvider brand={{ primaryColor: v.primary, accentColor: v.accent }} className="rounded-2xl border border-border bg-background p-4">
        <p className="mb-3 text-xs font-semibold text-muted">Your colours on buttons and labels</p>
        <div className="flex flex-wrap items-center gap-3"><Button>Start exam</Button><Button variant="outline">Sign in</Button><Badge variant="primary">Live CBT</Badge><Badge variant="lime">New</Badge></div>
      </OrgThemeProvider>
      <div className="flex items-center justify-end gap-3 border-t border-border pt-5">
        {dirty && <Button variant="ghost" onClick={() => { setV(saved); onDraft(null); }}>Undo</Button>}
        <Button loading={save.isPending} disabled={!dirty || !v.name.trim()} onClick={() => save.mutate()}>Save changes</Button>
      </div>
    </Section>
  );
}

function Address({ sub, orgSlug }) {
  const toast = useToast();
  const [name, setName] = useState('');
  const [avail, setAvail] = useState(null);
  const check = async () => { setAvail(null); try { setAvail(await wsApi.checkSubdomain(name)); } catch (e) { setAvail({ available: false, reason: e.message }); } };
  const add = useWsMutation((id, body) => wsApi.addDomain(id, body), { onSuccess: () => { toast.success('Address set'); setName(''); setAvail(null); }, onError: (e) => toast.error('Could not set', e.message) });

  return (
    <Section icon={Link2} step={2} title="Your Testflow address" text="Free and ready straight away. Students open your CBT here.">
      {sub ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-surface-strong/60 p-4">
            <Globe {...ICON} size={20} className="shrink-0 text-primary" />
            <span className="min-w-0 flex-1 truncate font-heading text-xl font-extrabold tracking-tight text-foreground-strong">{sub.hostname}</span>
            <Badge variant="success">Live</Badge>
            <a href={`https://${sub.hostname}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">Open <ExternalLink size={13} aria-hidden="true" /></a>
          </div>
          <CopyField value={`https://${sub.hostname}`} label="Link to share" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex max-w-xl flex-wrap items-end gap-2">
            <Field label="Choose a name" className="min-w-[12rem] flex-1"><Input value={name} onChange={(e) => { setName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')); setAvail(null); }} placeholder={orgSlug || 'jamb'} /></Field>
            <span className="pb-3 text-sm text-muted">.{HOST}</span>
            <Button variant="outline" disabled={name.length < 3} onClick={check}>Check</Button>
          </div>
          {avail && (avail.available ? <p className="flex items-center gap-2 text-sm font-semibold text-score-good"><Check size={15} aria-hidden="true" />{name}.{HOST} is free.</p> : <Banner variant="warning">{avail.reason ?? 'That name is taken.'}</Banner>)}
          <Button loading={add.isPending} disabled={!avail?.available} onClick={() => add.mutate({ type: 'subdomain', hostname: `${name}.${HOST}` })}>Use {name || 'this name'}.{HOST}</Button>
        </div>
      )}
    </Section>
  );
}

/** One step in the vertical guide: a numbered (or ticked) marker on a rail, and the step's content beside it. */
function GuideStep({ n, state, title, last, children }) {
  const done = state === 'done';
  const active = state === 'active';
  return (
    <li className="relative flex gap-4">
      <div className="flex flex-col items-center">
        <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold', done ? 'border-success bg-success text-white' : active ? 'border-primary bg-primary text-primary-foreground shadow-[0_0_0_4px_rgba(74,53,240,0.12)]' : 'border-border-strong bg-surface text-muted')}>
          {done ? <Check size={16} strokeWidth={2.5} aria-hidden="true" /> : n}
        </span>
        {!last && <span aria-hidden="true" className={cn('mt-1 w-0.5 flex-1', done ? 'bg-success/40' : 'bg-border')} />}
      </div>
      <div className={cn('min-w-0 flex-1 pb-8', last && 'pb-0')}>
        <h3 className={cn('font-heading text-base font-bold leading-9', state === 'todo' ? 'text-muted' : 'text-foreground-strong')}>{title}</h3>
        {children && <div className="mt-2 space-y-4">{children}</div>}
      </div>
    </li>
  );
}

const PROVIDERS = 'Namecheap, GoDaddy, Cloudflare or wherever you bought it';

function OwnDomain({ custom }) {
  const toast = useToast();
  const [value, setValue] = useState('');
  const add = useWsMutation((id, body) => wsApi.addDomain(id, body), { onSuccess: () => { toast.success('Domain added', 'Now add the records below.'); setValue(''); }, onError: (e) => toast.error('Could not add', e.message) });
  const verify = useWsMutation((id, d) => wsApi.verifyDomain(id, d), { onSuccess: (d) => toast[d.status === 'active' ? 'success' : 'info'](d.status === 'active' ? 'Domain connected' : 'Not connected yet', d.status === 'active' ? undefined : 'DNS can take a while. Try again soon.') });
  const remove = useWsMutation((id, d) => wsApi.removeDomain(id, d), { onSuccess: () => toast.success('Domain removed') });
  const valid = /^[a-z0-9.-]+\.[a-z]{2,}$/.test(value.trim().toLowerCase());
  const live = custom?.status === 'active';
  const records = custom?.records ?? [];

  return (
    <Section icon={Globe} step={3} title="Your own domain" text="Optional. Use an address you already own, like exams.mybrand.com.">
      {live && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-success/10 p-4">
          <Check size={18} className="shrink-0 text-score-good" aria-hidden="true" />
          <p className="min-w-0 flex-1 text-sm font-semibold text-score-good">Connected. Your CBT opens at <span className="break-all">{custom.hostname}</span></p>
          <a href={`https://${custom.hostname}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">Open <ExternalLink size={13} aria-hidden="true" /></a>
        </div>
      )}

      <ol className="mt-1">
        <GuideStep n={1} state={custom ? 'done' : 'active'} title={custom ? <span className="break-all">{custom.hostname}</span> : 'Type the domain you own'}>
          {custom ? (
            <Button variant="ghost" size="sm" className="text-danger" loading={remove.isPending} onClick={() => remove.mutate(custom.id)}>Remove this domain</Button>
          ) : (
            <form className="flex max-w-xl flex-wrap items-end gap-2" onSubmit={(e) => { e.preventDefault(); add.mutate({ type: 'custom', hostname: value.trim().toLowerCase() }); }}>
              <Field label="Your domain" className="min-w-[14rem] flex-1"><Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="exams.mybrand.com" /></Field>
              <Button type="submit" loading={add.isPending} disabled={!valid}>Add domain</Button>
            </form>
          )}
        </GuideStep>

        <GuideStep n={2} state={live ? 'done' : custom ? 'active' : 'todo'} title="Add these records at your domain provider">
          {custom ? (
            <>
              <p className="text-sm leading-relaxed text-muted">Sign in to {PROVIDERS}, open the DNS settings and add each record exactly as shown.</p>
              <ul className="space-y-3">
                {records.map((r) => (
                  <li key={`${r.type}-${r.host}`} className="rounded-2xl border border-border p-3.5">
                    <div className="mb-3"><Badge variant="lavender">{r.type}</Badge></div>
                    <div className="grid gap-3 lg:grid-cols-2"><CopyField label="Name / Host" value={r.host} /><CopyField label="Value" value={r.value} /></div>
                  </li>
                ))}
              </ul>
              {custom.expiresAt && !live && <p className="text-xs text-muted">Add them within {custom.expiresAt.replace(/^in /, '')}, or you will need to start again.</p>}
            </>
          ) : <p className="text-sm text-muted">We will show you exactly what to add once you type your domain.</p>}
        </GuideStep>

        <GuideStep n={3} state={live ? 'done' : 'todo'} title={live ? 'Connected' : 'Press Verify'} last>
          {custom && !live ? (
            <div className="flex flex-wrap items-center gap-3">
              <Button loading={verify.isPending} onClick={() => verify.mutate(custom.id)}>Verify my domain</Button>
              <Badge variant={custom.status === 'failed' ? 'danger' : 'warning'}>{custom.status === 'failed' ? 'Could not find the records yet' : 'Waiting for the records'}</Badge>
              <p className="w-full text-xs text-muted">It can take a few minutes, sometimes a few hours, to show up. You can leave this page and come back.</p>
            </div>
          ) : !custom ? <p className="text-sm text-muted">Verifying checks that the records are in place.</p> : null}
        </GuideStep>
      </ol>
    </Section>
  );
}

/** One button to see the real thing: opens the organisation's own site in a new tab. */
function PreviewLink({ host, dirty }) {
  const url = `https://${host}`;
  return (
    <Card padding="lg" className="space-y-4 bg-[var(--brand-lavender)]">
      <div>
        <h2 className="font-heading text-lg font-extrabold tracking-tight text-foreground-strong">See your site</h2>
        <p className="mt-1 text-sm leading-relaxed text-foreground">Open it the way your students will see it, with your name, logo and sign-in page.</p>
      </div>
      <a href={url} target="_blank" rel="noopener noreferrer" className="block"><Button size="lg" className="w-full" leadingIcon={<ExternalLink {...ICON} />}>Preview my site</Button></a>
      <p className="truncate text-center text-xs text-foreground">{host}</p>
      {dirty && <p className="rounded-xl bg-surface p-3 text-xs leading-relaxed text-muted">You have changes you have not saved. Save them first so the preview shows them.</p>}
    </Card>
  );
}

export default DomainsScreen;

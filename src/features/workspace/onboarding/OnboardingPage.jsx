import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Banner, Button, Card, Field, IconButton, Input, Spinner, Stepper, useToast } from '../../../components/ui/index.js';
import { ICON } from '../../../components/ui/iconProps.js';
import DomainCard from '../../../components/everybody/DomainCard.jsx';
import ImageField from '../../../components/everybody/ImageField.jsx';
import Logo from '../../../components/Logo.jsx';
import { useAuth } from '../../auth/useAuth.js';
import { wsApi } from '../api.js';
import { OrgContext } from '../OrgContext.js';
import PayoutCard from '../PayoutCard.jsx';
import { useOrganizations } from '../useWorkspace.js';

const HOST = 'testflow.com.ng';
const STEPS = [{ label: 'Name' }, { label: 'Logo' }, { label: 'Domain' }, { label: 'Wallet' }];
const slugify = (v) => v.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 30);

/**
 * First-time setup for Testflow for Everyone. No landing page: a short run of questions. Everything after the name can be
 * skipped; the workspace Overview reminds them of what is left.
 */
function OnboardingPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const orgs = useOrganizations();
  if (isLoading || orgs.isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/everybody/register" replace />;
  return <Wizard existing={Array.isArray(orgs.data) ? orgs.data[0] : null} />;
}

function Wizard({ existing }) {
  const navigate = useNavigate();
  const toast = useToast();
  const qc = useQueryClient();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [org, setOrg] = useState(existing);
  const [name, setName] = useState(existing?.name ?? '');
  const [slug, setSlug] = useState(existing?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(Boolean(existing));
  const [avail, setAvail] = useState(existing ? { available: true } : null);
  const [logo, setLogo] = useState('');
  const [custom, setCustom] = useState('');
  const [domain, setDomain] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const onName = (v) => { setName(v); setAvail(null); if (!slugTouched) setSlug(slugify(v)); };
  const onSlug = (v) => { setSlug(slugify(v)); setSlugTouched(true); setAvail(null); };
  // The address is checked by itself shortly after typing stops, so there is no "Check name" button to remember.
  useEffect(() => {
    if (org || slug.length < 3) return undefined;
    let live = true;
    const timer = setTimeout(async () => {
      try { const res = await wsApi.checkSubdomain(slug); if (live) setAvail(res); } catch (e) { if (live) setAvail({ available: false, reason: e.message }); }
    }, 450);
    return () => { live = false; clearTimeout(timer); };
  }, [slug, org]);

  const next = () => { setError(null); setStep((s) => s + 1); };
  const run = async (fn) => { setBusy(true); setError(null); try { await fn(); } catch (e) { setError(e.message || 'Something went wrong. Try again.'); } finally { setBusy(false); } };

  const saveName = () => run(async () => {
    let current = org;
    if (!current) {
      current = await wsApi.createOrg({ name: name.trim(), slug });
      await wsApi.addDomain(current.id, { type: 'subdomain', hostname: `${slug}.${HOST}` });
    } else if (current.name !== name.trim()) current = await wsApi.updateOrg(current.id, { name: name.trim() });
    setOrg(current);
    qc.invalidateQueries({ queryKey: ['ws'] });
    next();
  });
  const saveLogo = () => run(async () => {
    const site = await wsApi.site(org.id);
    await wsApi.saveSite(org.id, { brand: { ...site?.brand, name: name.trim(), logoUrl: logo } });
    next();
  });
  const saveDomain = () => run(async () => { setDomain(await wsApi.addDomain(org.id, { type: 'custom', hostname: custom.trim().toLowerCase() })); });
  const finish = () => run(async () => {
    try { await wsApi.publishSite(org.id); } catch { /* publishing can wait; the workspace will remind them */ }
    qc.invalidateQueries({ queryKey: ['ws'] });
    toast.success('Your CBT is ready', `${name.trim()} is set up.`);
    navigate('/workspace', { replace: true });
  });

  const canName = name.trim().length >= 2 && slug.length >= 3 && (org || avail?.available);
  const checking = !org && slug.length >= 3 && !avail;

  // What the pinned bar at the bottom shows for each step: one clear main action, a quiet skip.
  const actions = [
    { label: 'Continue', onClick: saveName, disabled: !canName },
    { label: 'Continue', onClick: saveLogo, disabled: !logo, skip: { label: 'Skip for now', onClick: next } },
    domain
      ? { label: 'Continue', onClick: next }
      : { label: 'Add domain', onClick: saveDomain, disabled: !/^[a-z0-9.-]+\.[a-z]{2,}$/.test(custom.trim().toLowerCase()), skip: { label: 'Skip for now', onClick: next } },
    { label: 'Finish', onClick: finish, skip: { label: 'Skip for now', onClick: finish } },
  ][step];

  return (
    <main className="flex min-h-svh flex-col items-center bg-background">
      <div className="flex w-full max-w-[34rem] flex-1 flex-col">
        <header className="px-4 pb-4 pt-3 sm:pt-8">
          <div className="flex h-11 items-center justify-between">
            {step > 0 ? (
              <IconButton aria-label="Back" size="md" disabled={busy} onClick={() => { setError(null); setStep((s) => s - 1); }} className="-ml-2"><ArrowLeft {...ICON} size={22} /></IconButton>
            ) : <span className="size-11" aria-hidden="true" />}
            <Logo size={26} />
            <span className="size-11" aria-hidden="true" />
          </div>
          <Stepper current={step} steps={STEPS} className="mt-3" />
        </header>

        <Card flushMobile padding="lg" className="mx-4 flex-1 space-y-6 pb-6 sm:mx-4 sm:mb-6 sm:flex-none">
          {error && <Banner variant="danger">{error}</Banner>}

          {step === 0 && (
            <>
              <Head title={`What is your CBT called${user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}?`} text="This is the name your students see." />
              <Field label="Name of your CBT"><Input value={name} onChange={(e) => onName(e.target.value)} placeholder="Grace CBT" maxLength={60} autoFocus autoComplete="organization" enterKeyHint="next" /></Field>
              <Field label="Your address" hint={org ? undefined : 'Made from your name. You can change it. Letters, numbers and dashes.'}>
                <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2"><Input value={slug} onChange={(e) => onSlug(e.target.value)} aria-label="Address" placeholder="grace" autoCapitalize="none" autoCorrect="off" spellCheck={false} /><span className="shrink-0 break-all text-sm text-muted">.{HOST}</span></div>
              </Field>
              <div className="min-h-6" aria-live="polite">
                {checking && <p className="flex items-center gap-2 text-sm text-muted"><Spinner size="sm" /> Checking {slug}.{HOST}</p>}
                {avail?.available && <p className="flex items-center gap-1.5 text-sm font-semibold text-score-good"><Check size={15} aria-hidden="true" /> {slug}.{HOST} is yours</p>}
                {avail && !avail.available && <p className="text-sm font-semibold text-score-low">{avail.reason ?? 'That address is taken.'}</p>}
              </div>
            </>
          )}

          {step === 1 && (
            <OrgContext.Provider value={{ org, orgId: org.id }}>
              <Head title="Add your logo" text="It shows in the header and when your link is shared." />
              <ImageField label="Logo" value={logo} onChange={setLogo} upload={(f) => wsApi.uploadSiteImage(org.id, f)} />
            </OrgContext.Provider>
          )}

          {step === 2 && (
            <>
              <Head title="Use your own domain?" text={`You already have ${slug}.${HOST}. A domain you own is optional.`} />
              {domain ? <DomainCard domain={domain} /> : (
                <Field label="Your domain" hint="For example exams.mybrand.com"><Input value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="exams.mybrand.com" inputMode="url" autoCapitalize="none" autoCorrect="off" spellCheck={false} /></Field>
              )}
            </>
          )}

          {step === 3 && (
            <OrgContext.Provider value={{ org, orgId: org.id }}>
              <Head title="Add your wallet" text="Where students' payments go. Skip it if you are not charging yet." />
              <PayoutCard org={org} bare />
            </OrgContext.Provider>
          )}

          <p className="hidden text-center text-xs text-muted sm:block">You can change all of this later in your workspace.</p>
        </Card>

        {/* Pinned to the bottom on phones so the main button is always in thumb reach; sits inside the card flow from sm up. */}
        <div className="sticky bottom-0 z-10 border-t border-border bg-background/95 px-4 pb-[calc(0.75rem+var(--safe-bottom))] pt-3 backdrop-blur sm:static sm:border-0 sm:bg-transparent sm:pb-8 sm:pt-0 sm:backdrop-blur-none">
          <div className="flex flex-col gap-1 sm:flex-row-reverse sm:items-center sm:justify-between sm:gap-2">
            <Button size="lg" className="w-full sm:w-auto" loading={busy} disabled={actions.disabled} onClick={actions.onClick}>{actions.label}</Button>
            {actions.skip && <Button variant="ghost" size="lg" className="w-full sm:w-auto" onClick={actions.skip.onClick} disabled={busy}>{actions.skip.label}</Button>}
          </div>
          <p className="mt-2 text-center text-xs text-muted sm:hidden">You can change all of this later in your workspace.</p>
        </div>
      </div>
    </main>
  );
}

const Head = ({ title, text }) => (
  <div><h1 className="font-heading text-2xl font-extrabold tracking-tight text-foreground-strong">{title}</h1><p className="mt-1.5 text-sm text-muted">{text}</p></div>
);

export default OnboardingPage;

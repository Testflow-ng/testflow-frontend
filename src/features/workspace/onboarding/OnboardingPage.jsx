import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Banner, Button, Card, Field, Input, Stepper, useToast } from '../../../components/ui/index.js';
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
  const check = async () => { try { setAvail(await wsApi.checkSubdomain(slug)); } catch (e) { setAvail({ available: false, reason: e.message }); } };

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

  return (
    <main className="flex min-h-svh flex-col items-center bg-background px-4 py-8">
      <Logo size={30} />
      <div className="mt-8 w-full max-w-[34rem]">
        <Stepper current={step} steps={STEPS} />
        <Card padding="lg" className="mt-6 space-y-6">
          {error && <Banner variant="danger">{error}</Banner>}

          {step === 0 && (
            <>
              <Head title={`What is your CBT called, ${user?.fullName?.split(' ')[0] ?? ''}?`} text="This is the name your students see." />
              <Field label="Name of your CBT"><Input value={name} onChange={(e) => onName(e.target.value)} placeholder="Grace CBT" maxLength={60} autoFocus /></Field>
              <Field label="Your address" hint={avail ? undefined : 'Letters, numbers and dashes.'}>
                <div className="flex items-center gap-2"><Input value={slug} onChange={(e) => onSlug(e.target.value)} aria-label="Address" placeholder="grace" /><span className="shrink-0 text-sm text-muted">.{HOST}</span></div>
              </Field>
              <div className="flex flex-wrap items-center gap-3">
                {!org && <Button variant="outline" size="sm" disabled={slug.length < 3} onClick={check}>Check name</Button>}
                {avail?.available && <p className="flex items-center gap-1.5 text-sm font-semibold text-score-good"><Check size={15} aria-hidden="true" /> {slug}.{HOST} is yours</p>}
                {avail && !avail.available && <p className="text-sm font-semibold text-score-low">{avail.reason ?? 'That address is taken.'}</p>}
              </div>
              <Button size="lg" className="w-full" loading={busy} disabled={!canName} onClick={saveName}>Continue</Button>
            </>
          )}

          {step === 1 && (
            <OrgContext.Provider value={{ org, orgId: org.id }}>
              <Head title="Add your logo" text="It shows in the header and when your link is shared." />
              <ImageField label="Logo" value={logo} onChange={setLogo} upload={(f) => wsApi.uploadSiteImage(org.id, f)} />
              <Footer busy={busy} onSkip={next} onContinue={saveLogo} disabled={!logo} />
            </OrgContext.Provider>
          )}

          {step === 2 && (
            <>
              <Head title="Use your own domain?" text={`You already have ${slug}.${HOST}. A domain you own is optional.`} />
              {domain ? <DomainCard domain={domain} /> : (
                <Field label="Your domain" hint="For example exams.mybrand.com"><Input value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="exams.mybrand.com" /></Field>
              )}
              {domain ? <Button size="lg" className="w-full" onClick={next}>Continue</Button> : <Footer busy={busy} onSkip={next} onContinue={saveDomain} disabled={!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(custom.trim().toLowerCase())} continueLabel="Add domain" />}
            </>
          )}

          {step === 3 && (
            <OrgContext.Provider value={{ org, orgId: org.id }}>
              <Head title="Add your wallet" text="Where students' payments go. Skip it if you are not charging yet." />
              <PayoutCard org={org} bare />
              <Footer busy={busy} onSkip={finish} onContinue={finish} continueLabel="Finish" skipLabel="Skip for now" />
            </OrgContext.Provider>
          )}
        </Card>
        <p className="mt-4 text-center text-xs text-muted">You can change all of this later in your workspace.</p>
      </div>
    </main>
  );
}

const Head = ({ title, text }) => (
  <div><h1 className="font-heading text-2xl font-extrabold tracking-tight text-foreground-strong">{title}</h1><p className="mt-1.5 text-sm text-muted">{text}</p></div>
);

function Footer({ busy, onSkip, onContinue, disabled, continueLabel = 'Continue', skipLabel = 'Skip for now' }) {
  return (
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
      <Button variant="ghost" size="lg" onClick={onSkip} disabled={busy}>{skipLabel}</Button>
      <Button size="lg" loading={busy} disabled={disabled} onClick={onContinue}>{continueLabel}</Button>
    </div>
  );
}

export default OnboardingPage;

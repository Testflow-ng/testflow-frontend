import { useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { Banner, Button, Field, GoogleButton, Input, PasswordInput } from '../../components/ui/index.js';
import TenantBrand from './TenantBrand.jsx';
import { useTenant } from './TenantContext.js';
import { googleStartUrl } from './googleUrl.js';
import { startTestflowLogin } from './testflowLogin.js';

const ERRORS = {
  INVALID_CREDENTIALS: 'Wrong email or password.',
  ACCOUNT_SUSPENDED: 'Your access to this organisation has been suspended. Contact them for help.',
  cancelled: 'You cancelled the Testflow login.',
  EMAIL_TAKEN: 'An account with this email already exists. Sign in instead.',
};

/** The organisation's own sign-in and sign-up page. Anyone can join; the organisation can suspend a student later. */
function TenantAuthPage({ mode = 'login' }) {
  const { brand, user, login, register, hostname } = useTenant();
  const [params] = useSearchParams();
  const signup = mode === 'register';
  const [f, setF] = useState({ fullName: '', email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));

  if (user) return <Navigate to="/" replace />;

  const ready = f.email.includes('@') && f.password.length >= 8 && (!signup || f.fullName.trim().length >= 2);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (signup) await register({ fullName: f.fullName.trim(), email: f.email.trim(), password: f.password });
      else await login({ email: f.email.trim(), password: f.password });
    } catch (err) {
      setError(ERRORS[err.code] || err.message || 'Something went wrong. Try again.');
      setBusy(false);
    }
  };

  return (
    <main className="grid min-h-svh lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <aside className="hidden flex-col justify-between bg-primary p-10 text-primary-foreground lg:flex">
        <TenantBrand light size={40} />
        <div>
          <h2 className="font-heading text-4xl font-extrabold leading-tight tracking-tight text-primary-foreground">{brand.tagline || 'Practise. Improve. Pass.'}</h2>
          <p className="mt-3 max-w-[32ch] text-primary-foreground/80">{`${signup ? 'Welcome to' : 'Welcome back to'} ${brand.name}.`}</p>
        </div>
        <p className="text-xs text-primary-foreground/70">Powered by <a href="https://testflow.com.ng" className="font-semibold underline" target="_blank" rel="noopener noreferrer">Testflow</a></p>
      </aside>

      <section className="flex flex-col justify-center px-6 py-10 sm:px-12">
        <div className="mx-auto w-full max-w-[26rem]">
          <TenantBrand className="mb-8 lg:hidden" />
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground-strong">{signup ? 'Create your account' : 'Sign in'}</h1>
          <p className="mt-1.5 text-sm text-muted">{signup ? `Join ${brand.name} to take their exams.` : `Continue to ${brand.name}.`}</p>

          <div className="mt-8 flex flex-col gap-4">
            {params.get('error') && <Banner variant="danger">{ERRORS[params.get('error')] || 'Google sign-in did not finish. Try again.'}</Banner>}
            <GoogleButton href={googleStartUrl(hostname)} />
            <Button variant="outline" size="lg" className="w-full" onClick={() => startTestflowLogin(hostname)}>Log in with Testflow</Button>
            <div className="flex items-center gap-3 text-xs text-muted"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>
          </div>

          <form onSubmit={submit} className="mt-4 space-y-4" noValidate>
            {error && <Banner variant="danger">{error}</Banner>}
            {signup && <Field label="Full name"><Input value={f.fullName} onChange={set('fullName')} autoComplete="name" /></Field>}
            <Field label="Email"><Input type="email" value={f.email} onChange={set('email')} autoComplete="email" /></Field>
            <Field label="Password"><PasswordInput value={f.password} onChange={set('password')} autoComplete={signup ? 'new-password' : 'current-password'} /></Field>
            <Button type="submit" size="lg" className="w-full" loading={busy} disabled={!ready}>{signup ? 'Create account' : 'Sign in'}</Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            {signup ? 'Already have an account?' : 'New here?'}{' '}
            <Link to={signup ? '/signin' : '/register'} className="font-semibold text-primary underline">{signup ? 'Sign in' : 'Create an account'}</Link>
          </p>
          <p className="mt-10 text-center text-xs text-muted lg:hidden">Powered by <a href="https://testflow.com.ng" className="font-semibold underline" target="_blank" rel="noopener noreferrer">Testflow</a></p>
        </div>
      </section>
    </main>
  );
}

export default TenantAuthPage;

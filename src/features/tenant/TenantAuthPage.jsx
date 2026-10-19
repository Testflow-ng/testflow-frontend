import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Banner, Button, Field, Input, PasswordInput } from '../../components/ui/index.js';
import TenantBrand from './TenantBrand.jsx';
import { useTenant } from './TenantContext.js';

/** The organisation's own sign-in and create-account page. After either, the student lands on the organisation's site. */
function TenantAuthPage({ mode }) {
  const { brand, user, login, register } = useTenant();
  const isRegister = mode === 'register';
  const [f, setF] = useState({ fullName: '', email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));

  if (user) return <Navigate to="/" replace />;

  const ready = f.email.includes('@') && f.password.length >= 8 && (!isRegister || f.fullName.trim().length >= 2);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (isRegister) await register({ fullName: f.fullName.trim(), email: f.email.trim(), password: f.password });
      else await login({ email: f.email.trim(), password: f.password });
    } catch (err) {
      setError(err.code === 'EMAIL_TAKEN' ? 'That email already has an account here. Sign in instead.' : err.code === 'INVALID_CREDENTIALS' ? 'Wrong email or password.' : err.message || 'Something went wrong. Try again.');
      setBusy(false);
    }
  };

  return (
    <main className="grid min-h-svh lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <aside className="hidden flex-col justify-between bg-primary p-10 text-primary-foreground lg:flex">
        <TenantBrand light size={40} />
        <div>
          <h2 className="font-heading text-4xl font-extrabold leading-tight tracking-tight text-primary-foreground">{brand.tagline || 'Practise. Improve. Pass.'}</h2>
          <p className="mt-3 max-w-[32ch] text-primary-foreground/80">{isRegister ? `Create your ${brand.name} account to start your exams.` : `Welcome back to ${brand.name}.`}</p>
        </div>
        <p className="text-xs text-primary-foreground/70">Powered by <a href="https://testflow.com.ng" className="font-semibold underline" target="_blank" rel="noopener noreferrer">Testflow</a></p>
      </aside>

      <section className="flex flex-col justify-center px-6 py-10 sm:px-12">
        <div className="mx-auto w-full max-w-[26rem]">
          <TenantBrand className="mb-8 lg:hidden" />
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground-strong">{isRegister ? 'Create your account' : 'Sign in'}</h1>
          <p className="mt-1.5 text-sm text-muted">{isRegister ? `Join ${brand.name}.` : `Continue to ${brand.name}.`}</p>

          <form onSubmit={submit} className="mt-8 space-y-4" noValidate>
            {error && <Banner variant="danger">{error}</Banner>}
            {isRegister && <Field label="Full name"><Input value={f.fullName} onChange={set('fullName')} autoComplete="name" /></Field>}
            <Field label="Email"><Input type="email" value={f.email} onChange={set('email')} autoComplete="email" /></Field>
            <Field label="Password" hint={isRegister ? 'At least 8 characters.' : undefined}><PasswordInput value={f.password} onChange={set('password')} autoComplete={isRegister ? 'new-password' : 'current-password'} /></Field>
            <Button type="submit" size="lg" className="w-full" loading={busy} disabled={!ready}>{isRegister ? 'Create account' : 'Sign in'}</Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            {isRegister ? 'Already have an account?' : 'New here?'}{' '}
            <Link to={isRegister ? '/signin' : '/register'} className="font-semibold text-primary hover:underline">{isRegister ? 'Sign in' : 'Create an account'}</Link>
          </p>
          <p className="mt-10 text-center text-xs text-muted lg:hidden">Powered by <a href="https://testflow.com.ng" className="font-semibold underline" target="_blank" rel="noopener noreferrer">Testflow</a></p>
        </div>
      </section>
    </main>
  );
}

export default TenantAuthPage;

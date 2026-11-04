import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Banner, Button, Field, PasswordInput } from '../../components/ui/index.js';
import { authApi } from '../auth/api.js';
import TenantBrand from './TenantBrand.jsx';
import { useTenant } from './TenantContext.js';

/** Where a student lands from the email their organisation sent: choose a password, then sign in. */
function TenantSetPasswordPage() {
  const { brand } = useTenant();
  const [params] = useSearchParams();
  const token = params.get('token');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await authApi.resetPassword({ token, password });
      setDone(true);
    } catch (err) {
      setError(err.code === 'INVALID_OR_EXPIRED_TOKEN' ? 'This link has expired. Ask your organisation to add you again.' : err.message || 'Could not set your password. Try again.');
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-svh flex-col justify-center px-6 py-10">
      <div className="mx-auto w-full max-w-[26rem]">
        <TenantBrand className="mb-8" />
        {!token ? (
          <Banner variant="danger">This link is incomplete. Open it again from the email {brand.name} sent you.</Banner>
        ) : done ? (
          <>
            <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground-strong">You are all set</h1>
            <p className="mt-1.5 text-sm text-muted">Your password is saved. Sign in to see your exams.</p>
            <Link to="/signin" className="mt-6 block"><Button size="lg" className="w-full">Sign in</Button></Link>
          </>
        ) : (
          <>
            <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground-strong">Choose a password</h1>
            <p className="mt-1.5 text-sm text-muted">{`Welcome to ${brand.name}. Pick a password to finish setting up your account.`}</p>
            <form onSubmit={submit} className="mt-8 flex flex-col gap-4" noValidate>
              {error && <Banner variant="danger">{error}</Banner>}
              <Field label="Password" hint="At least 8 characters."><PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" /></Field>
              <Button type="submit" size="lg" className="w-full" loading={busy} disabled={password.length < 8}>Save password</Button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}

export default TenantSetPasswordPage;

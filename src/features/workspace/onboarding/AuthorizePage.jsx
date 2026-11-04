import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Lock, Users, X } from 'lucide-react';
import { Avatar, Banner, Button, Card } from '../../../components/ui/index.js';
import Logo from '../../../components/Logo.jsx';
import { authApi } from '../../auth/api.js';
import { useAuth } from '../../auth/useAuth.js';

const WILL = ['See your name, email and profile picture', 'Create a workspace for you, linked to this Testflow account', 'Keep you signed in with the same session, no new password'];
const WONT = ['See or change your password', 'Touch your student account, scores or history'];

/** "Authorize Testflow for Everyone", like authorizing an app on GitHub. Shown instead of a sign-up form when you are already signed in. */
function AuthorizePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, refreshUser, logout } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/everybody/register" replace />;

  const firstName = user.fullName?.split(' ')[0] ?? 'My';
  const alreadyMember = user.memberships?.some((m) => m.product === 'everybody');

  const authorize = async () => {
    setBusy(true);
    setError(null);
    try {
      // A first name for the workspace; the next screen asks for the real one.
      if (!alreadyMember) await authApi.addMembership({ product: 'everybody', profile: { organizationName: `${firstName}'s CBT` } });
      await refreshUser();
      navigate('/everybody/start', { replace: true });
    } catch (e) {
      if (e.code === 'ALREADY_MEMBER') navigate('/everybody/start', { replace: true });
      else {
        setError(e.message || 'Could not authorize. Try again.');
        setBusy(false);
      }
    }
  };

  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-[28rem]">
        <div className="mb-6 flex items-center justify-center gap-4" aria-hidden="true">
          <span className="flex size-16 items-center justify-center rounded-2xl border border-border bg-surface shadow-sm"><Logo size={36} withWordmark={false} /></span>
          <ArrowRight size={22} className="text-muted" />
          <span className="flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm"><Users size={30} strokeWidth={1.5} /></span>
        </div>
        <h1 className="text-center font-heading text-[1.65rem] font-extrabold leading-tight tracking-tight text-foreground-strong">Authorize <span className="tf-accent font-normal">Testflow for Everyone</span></h1>
        <p className="mt-2 text-center text-sm text-muted">to use your Testflow account</p>

        <Card padding="lg" className="mt-6 space-y-5">
          <div className="flex items-center gap-3 rounded-2xl bg-surface-strong/60 p-3">
            <Avatar name={user.fullName} size="md" />
            <div className="min-w-0"><p className="truncate font-semibold text-foreground-strong">{user.fullName}</p><p className="truncate text-sm text-muted">{user.email}</p></div>
          </div>
          {error && <Banner variant="danger">{error}</Banner>}
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-muted">This will let it</p>
            <ul className="space-y-2.5">{WILL.map((t) => <li key={t} className="flex items-start gap-2.5 text-sm text-foreground-strong"><span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-success/15 text-score-good"><Check size={12} strokeWidth={2.5} aria-hidden="true" /></span>{t}</li>)}</ul>
          </div>
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-muted">It will not</p>
            <ul className="space-y-2.5">{WONT.map((t) => <li key={t} className="flex items-start gap-2.5 text-sm text-muted"><span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-danger/10 text-score-low"><X size={12} strokeWidth={2.5} aria-hidden="true" /></span>{t}</li>)}</ul>
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button variant="outline" size="lg" className="sm:flex-1" onClick={() => navigate('/dashboard')} disabled={busy}>Cancel</Button>
            <Button size="lg" className="sm:flex-1" loading={busy} onClick={authorize}>Authorize</Button>
          </div>
        </Card>

        <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-xs text-muted"><Lock size={12} aria-hidden="true" /> Not you? <button type="button" className="font-semibold text-primary hover:underline" onClick={async () => { await logout(); navigate('/everybody/register'); }}>Use another account</button> · <Link to="/dashboard" className="font-semibold text-primary hover:underline">Back to Testflow</Link></p>
      </div>
    </main>
  );
}

export default AuthorizePage;

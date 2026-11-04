import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Lock, MailX, Users } from 'lucide-react';
import { Avatar, Banner, Button, Card, EmptyState, Skeleton } from '../../../components/ui/index.js';
import { ICON } from '../../../components/ui/iconProps.js';
import Logo from '../../../components/Logo.jsx';
import { wsApi } from '../api.js';
import { useAuth } from '../../auth/useAuth.js';
import { AUTH_ENABLED, EVERYBODY_AUTH_PATHS, LOGIN_PATH, REGISTER_PATH } from '../../auth/paths.js';
import LandingNav from '../../../components/landing/LandingNav.jsx';
import { everybodyConfig } from '../../../content/landing/everybody.js';
import '../../../pages/landing.css';

const STORE_KEY = 'tf_invite_token';
const ACCEPT_PATH = '/invitations/accept';

// The sign-in page keeps only the path of where you were going, so the token waits here meanwhile.
const readStored = () => {
  try { return sessionStorage.getItem(STORE_KEY); } catch { return null; }
};
const writeStored = (value) => {
  try { if (value) sessionStorage.setItem(STORE_KEY, value); else sessionStorage.removeItem(STORE_KEY); } catch { /* storage can be blocked */ }
};

const STAFF = new Set(['owner', 'admin', 'examiner']);

/** The page an invitation email links to: accept it with the signed-in account, or sign in first. */
function AcceptInvitePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const token = searchParams.get('token') || readStored();
  const cameWithToken = Boolean(searchParams.get('token'));

  // The same clean landing nav the sign-in screens use, in place of the app header.
  const shell = (children) => (
    <div className="tfl tfl-page">
      <LandingNav links={everybodyConfig.nav.links} loginTo={EVERYBODY_AUTH_PATHS.login} primary={{ to: EVERYBODY_AUTH_PATHS.register, label: 'Create your platform' }} />
      <main className="flex min-h-[calc(100svh-5rem)] items-center justify-center px-4 py-10">
        <div className="w-full max-w-[28rem]">{children}</div>
      </main>
    </div>
  );

  if (isLoading) return shell(<Card padding="lg" className="space-y-4"><Skeleton className="h-6 w-2/3" /><Skeleton className="h-12 w-full" /><Skeleton className="h-11 w-full" /></Card>);

  if (!token) {
    return shell(
      <EmptyState
        icon={MailX}
        title="This invitation link is incomplete"
        description="Open the link from your invitation email again, or ask the organisation to send a new one."
        action={<Link to="/" className="text-sm font-semibold text-primary hover:underline">Back to Testflow</Link>}
      />,
    );
  }

  const accept = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await wsApi.acceptInvite(token);
      writeStored(null);
      navigate(STAFF.has(res?.member?.role) ? '/workspace' : '/dashboard', { replace: true });
    } catch (e) {
      if (e.code === 'ALREADY_MEMBER') {
        writeStored(null);
        navigate('/workspace', { replace: true });
        return;
      }
      setError(e.message || 'Could not accept this invitation. Try again.');
      setBusy(false);
    }
  };

  const heading = (
    <>
      <div className="mb-6 flex items-center justify-center gap-4" aria-hidden="true">
        <span className="flex size-16 items-center justify-center rounded-2xl border border-border bg-surface shadow-sm"><Logo size={36} withWordmark={false} /></span>
        <ArrowRight size={22} className="text-muted" />
        <span className="flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm"><Users size={30} strokeWidth={1.5} /></span>
      </div>
      <h1 style={{ fontSize: '1.65rem', lineHeight: 1.2 }} className="text-center font-heading font-extrabold tracking-tight text-foreground-strong">You have been <span className="tf-accent font-normal">invited</span></h1>
    </>
  );

  if (!isAuthenticated) {
    const keepToken = () => { if (cameWithToken) writeStored(token); };
    const state = { from: { pathname: ACCEPT_PATH } };
    return shell(
      <>
        {heading}
        <p style={{ marginTop: '0.6rem' }} className="text-center text-sm text-muted">Sign in with the email address the invitation was sent to.</p>
        <Card padding="lg" raised={false} style={{ marginTop: '1.75rem', boxShadow: 'none' }} className="flex flex-col gap-4">
          {!AUTH_ENABLED && <Banner variant="info">Sign-in opens soon. Keep this email, the link will still work.</Banner>}
          <Link to={LOGIN_PATH} state={state} onClick={keepToken} className="block"><Button size="lg" className="w-full">Sign in to accept</Button></Link>
          <Link to={REGISTER_PATH} state={state} onClick={keepToken} className="block"><Button variant="outline" size="lg" className="w-full">Create an account</Button></Link>
        </Card>
      </>,
    );
  }

  return shell(
    <>
      {heading}
      <p style={{ marginTop: '0.6rem' }} className="text-center text-sm text-muted">Accept to join the organisation as the account below.</p>
      <Card padding="lg" raised={false} style={{ marginTop: '1.75rem', boxShadow: 'none' }} className="flex flex-col gap-5">
        <div className="flex items-center gap-3 rounded-2xl bg-surface-strong/60 p-3">
          <Avatar name={user.fullName} size="md" />
          <div className="min-w-0"><p className="truncate font-semibold text-foreground-strong">{user.fullName}</p><p className="truncate text-sm text-muted">{user.email}</p></div>
        </div>
        {error && <Banner variant="danger">{error}</Banner>}
        <div className="flex flex-col-reverse gap-2 sm:flex-row">
          <Button variant="outline" size="lg" className="sm:flex-1" onClick={() => { writeStored(null); navigate('/dashboard'); }} disabled={busy}>Not now</Button>
          <Button size="lg" className="sm:flex-1" loading={busy} onClick={accept}>Accept invitation</Button>
        </div>
      </Card>
      <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-xs text-muted">
        <Lock {...ICON} size={12} aria-hidden="true" /> Invitation sent to someone else?{' '}
        <button type="button" className="font-semibold text-primary hover:underline" onClick={async () => { writeStored(token); await logout(); navigate(LOGIN_PATH, { state: { from: { pathname: ACCEPT_PATH } } }); }}>Use another account</button>
      </p>
    </>,
  );
}

export default AcceptInvitePage;

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ArrowRight, Check, Globe, X } from 'lucide-react';
import { Avatar, Banner, Button, Card, Spinner } from '../../../components/ui/index.js';
import Logo from '../../../components/Logo.jsx';
import apiClient from '../../../api/client.js';
import { useAuth } from '../useAuth.js';

const KEY = 'tf_oauth_pending';
const WILL = ['See your name and email address', 'Make you a student of this organisation', 'Keep you signed in on their site, no new password'];
const WONT = ['See or change your Testflow password', 'See your Testflow scores or history'];

const readParams = (search) => {
  const p = new URLSearchParams(search);
  const get = (k) => p.get(k) ?? '';
  return { clientId: get('client_id'), redirectUri: get('redirect_uri'), codeChallenge: get('code_challenge'), state: get('state') };
};

/**
 * "Log in with Testflow", like authorizing an app on GitHub. The first time for a site it lists what
 * the site gets and waits for Authorize; once approved, later logins go straight through.
 */
function TestflowAuthorizePage() {
  const location = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [consent, setConsent] = useState(null); // { site, name, granted }
  const started = useRef(false);

  const req = useMemo(() => {
    const fromUrl = readParams(location.search);
    if (fromUrl.clientId) {
      try { sessionStorage.setItem(KEY, location.search); } catch { /* the page still works without it */ }
      return fromUrl;
    }
    try { return readParams(sessionStorage.getItem(KEY) ?? ''); } catch { return readParams(''); }
  }, [location.search]);

  const ready = !isLoading && isAuthenticated && Boolean(req.clientId && req.redirectUri && req.codeChallenge);

  useEffect(() => {
    if (!ready) return;
    apiClient.get('/api/auth/testflow/consent', { params: { state: req.state } })
      .then((r) => setConsent(r.data))
      .catch(() => setError('This sign-in link is not valid. Go back to the site and try again.'));
  }, [ready, req.state]);

  const authorize = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const { data } = await apiClient.post('/api/auth/oauth/authorize', {
        clientId: req.clientId, redirectUri: req.redirectUri, codeChallenge: req.codeChallenge, codeChallengeMethod: 'S256', ...(req.state ? { state: req.state } : {}),
      });
      try { sessionStorage.removeItem(KEY); } catch { /* ignore */ }
      window.location.assign(data.redirectTo);
    } catch (e) {
      setError(e.message || 'Could not authorize. Try again.');
      setBusy(false);
    }
  }, [req]);

  // Approved before: go straight through.
  useEffect(() => {
    if (!consent?.granted || started.current) return;
    started.current = true;
    authorize();
  }, [consent, authorize]);

  // Reject goes back through the registered callback, which sends the person to the organisation's site.
  const reject = () => {
    try { sessionStorage.removeItem(KEY); } catch { /* ignore */ }
    const url = new URL(req.redirectUri);
    url.searchParams.set('error', 'access_denied');
    if (req.state) url.searchParams.set('state', req.state);
    window.location.assign(url.toString());
  };

  if (isLoading) return null;
  if (!req.clientId || !req.redirectUri || !req.codeChallenge) {
    return <main className="flex min-h-svh items-center justify-center px-4"><Banner variant="danger">This sign-in link is incomplete. Go back to the site and try again.</Banner></main>;
  }
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: { pathname: '/oauth/authorize' } }} replace />;

  const name = consent?.name || 'this site';
  const quick = consent?.granted && !error;

  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-[28rem]">
        <div className="mb-6 flex items-center justify-center gap-4" aria-hidden="true">
          <span className="flex size-16 items-center justify-center rounded-2xl border border-border bg-surface shadow-sm"><Logo size={36} withWordmark={false} /></span>
          <ArrowRight size={22} className="text-muted" />
          <span className="flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm"><Globe size={30} strokeWidth={1.5} /></span>
        </div>
        <h1 className="text-center font-heading text-[1.65rem] font-extrabold leading-tight tracking-tight text-foreground-strong">Authorize <span className="tf-accent font-normal">{name}</span></h1>
        <p className="mt-2 text-center text-sm text-muted">to sign you in with your Testflow account</p>

        <Card padding="lg" className="mt-6 space-y-5">
          <div className="flex items-center gap-3 rounded-2xl bg-surface-strong/60 p-3">
            <Avatar name={user.fullName} size="md" />
            <div className="min-w-0"><p className="truncate font-semibold text-foreground-strong">{user.fullName}</p><p className="truncate text-sm text-muted">{user.email}</p></div>
          </div>
          {error && <Banner variant="danger">{error}</Banner>}

          {!consent && !error ? (
            <div className="flex items-center gap-3 text-sm text-muted" role="status"><Spinner className="text-primary" />One moment…</div>
          ) : quick ? (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-sm text-muted" role="status"><Spinner className="text-primary" />Signing you in…</div>
              <Button variant="outline" onClick={reject}>Reject</Button>
            </div>
          ) : consent ? (
            <>
              <div>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-muted">This will let it</p>
                <ul className="space-y-2.5">{WILL.map((t) => <li key={t} className="flex items-start gap-2.5 text-sm text-foreground-strong"><span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-success/15 text-score-good"><Check size={12} strokeWidth={2.5} aria-hidden="true" /></span>{t}</li>)}</ul>
              </div>
              <div>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-muted">It will not</p>
                <ul className="space-y-2.5">{WONT.map((t) => <li key={t} className="flex items-start gap-2.5 text-sm text-muted"><span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-danger/10 text-score-low"><X size={12} strokeWidth={2.5} aria-hidden="true" /></span>{t}</li>)}</ul>
              </div>
              <div className="flex flex-col-reverse gap-2 sm:flex-row">
                <Button variant="outline" size="lg" className="sm:flex-1" onClick={reject} disabled={busy}>Reject</Button>
                <Button size="lg" className="sm:flex-1" loading={busy} onClick={authorize}>Authorize</Button>
              </div>
            </>
          ) : (
            <Button variant="outline" size="lg" onClick={reject}>Back</Button>
          )}
        </Card>
      </div>
    </main>
  );
}

export default TestflowAuthorizePage;

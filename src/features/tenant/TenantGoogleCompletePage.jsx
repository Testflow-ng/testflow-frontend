import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Banner, Button, Spinner } from '../../components/ui/index.js';
import TenantBrand from './TenantBrand.jsx';
import { useTenant } from './TenantContext.js';
import { takeVerifier, testflowRedirectUri } from './testflowLogin.js';

/** Where Google (or "Log in with Testflow") sends the browser back to this site: trade the one-time code for a student session. */
function TenantGoogleCompletePage({ via = 'google' }) {
  const { completeGoogle, completeTestflow } = useTenant();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const code = params.get('code');
  const [error, setError] = useState(null);
  const ran = useRef(false);

  useEffect(() => {
    if (!code || ran.current) return;
    ran.current = true;
    let run;
    if (via === 'testflow') {
      const codeVerifier = takeVerifier(params.get('state'));
      run = codeVerifier ? completeTestflow({ code, codeVerifier, redirectUri: testflowRedirectUri() }) : Promise.reject(new Error('state'));
    } else run = completeGoogle(code);
    run
      .then(() => navigate('/', { replace: true }))
      .catch((err) => setError(err.code === 'ACCOUNT_SUSPENDED' ? 'Your access to this organisation has been suspended. Contact them for help.' : 'This sign-in link has expired. Try again.'));
  }, [code, via, params, completeGoogle, completeTestflow, navigate]);

  if (!code) return <Navigate to="/signin" replace />;
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-[26rem] flex-col justify-center gap-6 px-6">
      <TenantBrand />
      {error ? (
        <>
          <Banner variant="danger">{error}</Banner>
          <Button size="lg" onClick={() => navigate('/signin', { replace: true })}>Back to sign in</Button>
        </>
      ) : (
        <div className="flex items-center gap-3 text-sm text-muted"><Spinner className="text-primary" />Signing you in…</div>
      )}
    </main>
  );
}

export default TenantGoogleCompletePage;

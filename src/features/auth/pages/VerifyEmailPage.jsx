import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Alert, Spinner } from '../../../components/ui/index.js';
import { authApi } from '../api.js';
import { useAuth } from '../useAuth.js';
import AuthScreen from '../AuthScreen.jsx';

function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { isAuthenticated, setUser } = useAuth();
  // Derive the no-token case up front so we don't setState synchronously in the effect.
  const [state, setState] = useState(token ? 'verifying' : 'error');

  useEffect(() => {
    if (!token) {
      return undefined;
    }
    let active = true;
    authApi
      .verifyEmail(token)
      .then((res) => {
        if (!active) return;
        // Keep the in-memory user in sync if this browser is already signed in.
        if (isAuthenticated && res?.user) {
          setUser(res.user);
        }
        setState('success');
      })
      .catch(() => {
        if (active) setState('error');
      });
    return () => {
      active = false;
    };
  }, [token, isAuthenticated, setUser]);

  const footer = (
    <Link className="font-medium text-primary hover:underline" to={isAuthenticated ? '/dashboard' : '/login'}>
      {isAuthenticated ? 'Go to dashboard' : 'Continue to sign in'}
    </Link>
  );

  return (
    <AuthScreen title="Email verification" footer={state !== 'verifying' ? footer : undefined}>
      {state === 'verifying' ? (
        <div className="flex items-center justify-center gap-3 py-2 text-sm text-muted">
          <Spinner size="sm" label="Verifying your email" className="text-primary" />
          Verifying your email…
        </div>
      ) : state === 'success' ? (
        <Alert variant="success">Your email has been verified. Thank you!</Alert>
      ) : (
        <Alert variant="danger">
          This verification link is invalid or has expired. You can request a new one from your
          dashboard after signing in.
        </Alert>
      )}
    </AuthScreen>
  );
}

export default VerifyEmailPage;

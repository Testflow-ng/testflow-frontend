import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authApi } from '../api.js';
import { useAuth } from '../useAuth.js';
import AuthShell from '../ui/AuthShell.jsx';

function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { isAuthenticated } = useAuth();
  const [state, setState] = useState(token ? 'verifying' : 'error');
  const attempted = useRef(false);

  useEffect(() => {
    if (!token || attempted.current) return undefined;
    attempted.current = true;
    let active = true;
    authApi
      .verifyEmail(token)
      .then(() => active && setState('success'))
      .catch(() => active && setState('error'));
    return () => {
      active = false;
    };
  }, [token]);

  const footer = <Link to={isAuthenticated ? '/dashboard' : '/login'}>{isAuthenticated ? 'Go to dashboard' : 'Continue to sign in'}</Link>;

  if (state === 'verifying') {
    return (
      <AuthShell title="Verifying your" accent="email." subtitle="We’re confirming your email address.">
        <p className="auth-alert auth-alert-success" role="status">
          Verifying your email…
        </p>
      </AuthShell>
    );
  }
  if (state === 'success') {
    return (
      <AuthShell title="Email" accent="verified." subtitle="Your email address has been confirmed." footer={footer}>
        <p className="auth-alert auth-alert-success" role="status">
          You can now continue using TestFlow.
        </p>
      </AuthShell>
    );
  }
  return (
    <AuthShell title="Verification" accent="failed." subtitle="We couldn’t verify this email address." footer={footer}>
      <p className="auth-alert auth-alert-danger" role="alert">
        This verification link is invalid or has expired. You can request a new one after signing in.
      </p>
    </AuthShell>
  );
}

export default VerifyEmailPage;

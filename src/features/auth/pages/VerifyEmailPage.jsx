import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Alert, Spinner } from '../../../components/ui/index.js';
import { authApi } from '../api.js';
import { useAuth } from '../useAuth.js';
import AuthScreen from '../AuthScreen.jsx';

function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { isAuthenticated } = useAuth();

  const [state, setState] = useState(token ? 'verifying' : 'error');
  const attempted = useRef(false);

  useEffect(() => {
    if (!token || attempted.current) {
      return undefined;
    }

    attempted.current = true;
    let active = true;

    authApi
      .verifyEmail(token)
      .then(() => {
        if (active) {
          setState('success');
        }
      })
      .catch(() => {
        if (active) {
          setState('error');
        }
      });

    return () => {
      active = false;
    };
  }, [token]);

  const footer = (
    <Link
      to={isAuthenticated ? '/dashboard' : '/login'}
      className="
        font-semibold text-link
        underline-offset-4
        hover:underline
      "
    >
      {isAuthenticated ? 'Go to dashboard' : 'Continue to sign in'}
    </Link>
  );

  if (state === 'verifying') {
    return (
      <AuthScreen
        title="Verify your email"
        subtitle="We're confirming your email address."
      >
        <div
          className="
            flex items-center gap-3
            rounded-lg border border-border/70
            bg-surface/50 px-4 py-4
            text-sm text-muted
          "
        >
          <Spinner
            size="sm"
            label="Verifying your email"
            className="shrink-0 text-primary"
          />
          <span>Verifying your email...</span>
        </div>
      </AuthScreen>
    );
  }

  if (state === 'success') {
    return (
      <AuthScreen
        title="Email verified"
        subtitle="Your email address has been successfully verified."
        footer={footer}
      >
        <Alert variant="success">
          Your email has been verified. You can now continue using TestFlow.
        </Alert>
      </AuthScreen>
    );
  }

  return (
    <AuthScreen
      title="Verification failed"
      subtitle="We couldn't verify this email address."
      footer={footer}
    >
      <Alert variant="danger">
        This verification link is invalid or has expired. You can request a
        new one from your dashboard after signing in.
      </Alert>
    </AuthScreen>
  );
}

export default VerifyEmailPage;

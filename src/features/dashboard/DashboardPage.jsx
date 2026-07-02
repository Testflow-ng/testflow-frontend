import { useState } from 'react';
import { Alert, Button, Card } from '../../components/ui/index.js';
import { authApi } from '../auth/api.js';
import { useAuth } from '../auth/useAuth.js';

function DashboardPage() {
  const { user, logout } = useAuth();
  const [resent, setResent] = useState(false);
  const [resending, setResending] = useState(false);

  const handleResend = async () => {
    setResending(true);
    try {
      await authApi.resendVerification({ email: user.email });
      setResent(true);
    } catch {
      // Response is intentionally generic; surface success either way.
      setResent(true);
    } finally {
      setResending(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-2xl flex-1 px-5 py-10">
      <p className="text-sm text-muted">Signed in as {user.email}</p>
      <h1 className="mt-1 text-2xl text-foreground-strong">Welcome, {user.fullName}</h1>

      {!user.isEmailVerified && (
        <div className="mt-6 flex flex-col items-start gap-3">
          <Alert variant="warning">
            Verify your email to start exams. Check your inbox for the verification link.
          </Alert>
          {resent ? (
            <p className="text-sm text-muted">
              If your account is unverified, a new link is on its way.
            </p>
          ) : (
            <Button variant="outline" size="sm" loading={resending} onClick={handleResend}>
              Resend verification email
            </Button>
          )}
        </div>
      )}

      <Card padding="lg" className="mt-8">
        <h2 className="text-lg text-foreground-strong">Your dashboard</h2>
        <p className="mt-1 text-sm text-muted">
          Subjects, exams, and results will appear here as they come online.
        </p>
      </Card>

      <div className="mt-8">
        <Button variant="outline" onClick={logout}>
          Sign out
        </Button>
      </div>
    </section>
  );
}

export default DashboardPage;

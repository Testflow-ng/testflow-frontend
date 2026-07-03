import { Link } from 'react-router-dom';
import { Alert, Avatar } from '../../components/ui/index.js';
import { useAuth } from '../auth/useAuth.js';
import SubjectGrid from '../subjects/SubjectGrid.jsx';

function DashboardPage() {
  const { user } = useAuth();

  return (
    <section className="mx-auto w-full max-w-5xl flex-1 px-5 py-6">
      <div className="flex items-center gap-3">
        <Avatar name={user.fullName} size="md" />
        <div className="min-w-0">
          <p className="text-xs text-muted">Welcome back</p>
          <p className="truncate text-base font-semibold text-foreground-strong">
            {user.fullName}
          </p>
        </div>
      </div>

      {!user.isEmailVerified && (
        <div className="mt-6">
          <Alert variant="warning">
            Verify your email to start exams. Open the link we sent, or resend it from your{' '}
            <Link to="/profile" className="font-medium underline">
              profile
            </Link>
            .
          </Alert>
        </div>
      )}

      <div className="mt-8">
        <h1 className="text-lg font-semibold text-foreground-strong">Practice a subject</h1>
        <p className="mt-1 text-sm text-muted">Pick a subject to start a timed exam.</p>
        <div className="mt-4">
          <SubjectGrid />
        </div>
      </div>
    </section>
  );
}

export default DashboardPage;

import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import AuthShell from '../auth/ui/AuthShell.jsx';
import { authApi } from '../auth/api.js';
import { adsAuthApi } from './adsAuthApi.js';
import { ADS_AUTH_PATHS } from '../auth/paths.js';

/** Temporary landing spot after advertiser sign-in until the dashboard is built. */
function AdsDashboardPlaceholder() {
  const navigate = useNavigate();
  const { data, isPending, isError } = useQuery({ queryKey: ['ads', 'me'], queryFn: adsAuthApi.me, retry: false });

  const signOut = async () => {
    try {
      await authApi.logout();
    } finally {
      navigate(ADS_AUTH_PATHS.login, { replace: true });
    }
  };

  if (isPending) {
    return <AuthShell product="ads" title="Loading your" accent="account." />;
  }
  if (isError) {
    return (
      <AuthShell
        product="ads"
        title="Please"
        accent="sign in."
        subtitle="Your session has ended."
        footer={<Link to={ADS_AUTH_PATHS.login}>Go to advertiser sign-in</Link>}
      />
    );
  }
  const name = data?.profile?.businessName ?? data?.user?.fullName ?? 'there';
  return (
    <AuthShell product="ads" title={`Welcome, ${name}.`} accent="You’re in." subtitle="Your campaign dashboard is on its way. Check back soon.">
      <button type="button" className="btn btn-ghost" onClick={signOut}>
        Sign out
      </button>
    </AuthShell>
  );
}

export default AdsDashboardPlaceholder;

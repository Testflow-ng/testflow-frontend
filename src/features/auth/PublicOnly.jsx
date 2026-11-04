import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth.js';
import PageLoader from '../../components/PageLoader.jsx';

const pathOf = (from) => `${from?.pathname ?? ''}${from?.search ?? ''}${from?.hash ?? ''}`;

/** Keeps already-authenticated users out of auth pages (login, register, ...). */
function PublicOnly() {
  const { isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <PageLoader />;
  }
  if (isAuthenticated) {
    // If an invite link sent them here, finish that trip instead of the dashboard.
    const from = pathOf(location.state?.from);
    return <Navigate to={from || '/dashboard'} replace />;
  }
  return <Outlet />;
}

export default PublicOnly;

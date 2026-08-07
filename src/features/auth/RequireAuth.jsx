import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth.js';
import PageLoader from '../../components/PageLoader.jsx';

/** Gate for authenticated-only routes. Redirects to /login, preserving intent. */
function RequireAuth() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <PageLoader />;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (user && !user.username && location.pathname !== '/setup') {
    return <Navigate to="/setup" replace />;
  }
  return <Outlet />;
}

export default RequireAuth;

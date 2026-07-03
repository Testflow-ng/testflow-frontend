import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/useAuth.js';
import PageLoader from '../../components/PageLoader.jsx';

/** Gate for admin-only routes. Redirects to /dashboard if not an admin. */
function RequireAdmin() {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default RequireAdmin;

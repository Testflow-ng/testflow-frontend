import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './useAuth.js';
import PageLoader from '../../components/PageLoader.jsx';

/** Keeps already-authenticated users out of auth pages (login, register, ...). */
function PublicOnly() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}

export default PublicOnly;

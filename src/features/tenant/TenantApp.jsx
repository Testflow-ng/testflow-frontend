import { useMemo } from 'react';
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom';
import { EmptyState, Spinner } from '../../components/ui/index.js';
import { Globe } from 'lucide-react';
import TenantAuthPage from './TenantAuthPage.jsx';
import TenantPortal from './TenantPortal.jsx';
import TenantProvider from './TenantProvider.jsx';
import { TenantResultDetail, TenantResultsList } from './TenantResults.jsx';
import { useTenant } from './TenantContext.js';

function Gate() {
  const { status, hostname } = useTenant();
  if (status === 'loading') return <div className="flex min-h-svh items-center justify-center"><Spinner size="xl" className="text-primary" /></div>;
  if (status === 'missing') return <div className="mx-auto flex min-h-svh max-w-[30rem] items-center px-5"><EmptyState icon={Globe} title="This site is not available" description={`${hostname} is not set up yet, or it is temporarily unavailable.`} /></div>;
  return status === 'signed-in' ? <TenantPortal /> : <Navigate to="/signin" replace />;
}

function Guard({ children }) {
  const { status } = useTenant();
  if (status === 'loading') return null;
  return status === 'signed-in' ? children : <Navigate to="/signin" replace />;
}

/** The whole app when it is opened on an organisation's address: its own sign-in, sign-up and student site. */
function TenantApp({ hostname }) {
  const router = useMemo(() => createBrowserRouter([
    { path: '/', element: <Gate /> },
    { path: '/results', element: <Guard><TenantResultsList /></Guard> },
    { path: '/results/:id', element: <Guard><TenantResultDetail /></Guard> },
    { path: '/signin', element: <TenantAuthPage mode="signin" /> },
    { path: '/register', element: <TenantAuthPage mode="register" /> },
    { path: '*', element: <Navigate to="/" replace /> },
  ]), []);
  return <TenantProvider hostname={hostname}><RouterProvider router={router} /></TenantProvider>;
}

export default TenantApp;

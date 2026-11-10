import { useMemo } from 'react';
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom';
import { EmptyState, Spinner } from '../../components/ui/index.js';
import { Globe } from 'lucide-react';
import TenantGoogleCompletePage from './TenantGoogleCompletePage.jsx';
import TenantAuthPage from './TenantAuthPage.jsx';
import TenantSetPasswordPage from './TenantSetPasswordPage.jsx';
import TenantExamPage from './TenantExamPage.jsx';
import TenantPaymentComplete from './TenantPaymentComplete.jsx';
import TenantPortal from './TenantPortal.jsx';
import TenantErrorBoundary, { TenantCrash } from './TenantErrorBoundary.jsx';
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

/** The whole app when it is opened on an organisation's address: its own sign-in, sign-up and student site. Anyone can sign up; the organisation can suspend a student. */
function TenantApp({ hostname }) {
  const router = useMemo(() => createBrowserRouter([
    { path: '/', element: <Gate />, errorElement: <TenantCrash /> },
    { path: '/results', errorElement: <TenantCrash />, element: <Guard><TenantResultsList /></Guard> },
    { path: '/results/:id', errorElement: <TenantCrash />, element: <Guard><TenantResultDetail /></Guard> },
    { path: '/exam/complete', errorElement: <TenantCrash />, element: <Guard><TenantPaymentComplete /></Guard> },
    { path: '/exam/:id', errorElement: <TenantCrash />, element: <Guard><TenantExamPage /></Guard> },
    { path: '/signin', element: <TenantAuthPage /> },
    { path: '/set-password', element: <TenantSetPasswordPage /> },
    { path: '/register', element: <TenantAuthPage mode="register" /> },
    { path: '/auth/testflow', element: <TenantGoogleCompletePage via="testflow" /> },
    { path: '/auth/complete', element: <TenantGoogleCompletePage /> },
    { path: '*', element: <Navigate to="/" replace /> },
  ]), []);
  return <TenantErrorBoundary><TenantProvider hostname={hostname}><RouterProvider router={router} /></TenantProvider></TenantErrorBoundary>;
}

export default TenantApp;

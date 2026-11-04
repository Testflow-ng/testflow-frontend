import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { queryClient } from './queryClient.js';
import { router } from '../routes/router.jsx';
import AuthProvider from '../features/auth/AuthProvider.jsx';
import AppBoot from './AppBoot.jsx';
import { ToastProvider } from '../components/ui/Toast.jsx';
import TenantApp from '../features/tenant/TenantApp.jsx';
import { detectTenant } from '../features/tenant/detect.js';

// On an organisation's own address (grace.testflow.com.ng or their domain) the whole app is that organisation's site.
const tenant = detectTenant();

function Providers() {
  if (tenant) {
    return (
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <TenantApp hostname={tenant.hostname} />
        </ToastProvider>
      </QueryClientProvider>
    );
  }
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppBoot>
          <ToastProvider>
            <RouterProvider router={router} />
          </ToastProvider>
        </AppBoot>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default Providers;

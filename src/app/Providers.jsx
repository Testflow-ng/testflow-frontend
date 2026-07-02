import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { queryClient } from './queryClient.js';
import { router } from '../routes/router.jsx';
import AuthProvider from '../features/auth/AuthProvider.jsx';
import AppBoot from './AppBoot.jsx';

function Providers() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppBoot>
          <RouterProvider router={router} />
        </AppBoot>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default Providers;

import { createBrowserRouter } from 'react-router-dom';
import RootLayout from '../layouts/RootLayout.jsx';
import HomePage from '../pages/HomePage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';
import RequireAuth from '../features/auth/RequireAuth.jsx';
import PublicOnly from '../features/auth/PublicOnly.jsx';
import LoginPage from '../features/auth/pages/LoginPage.jsx';
import RegisterPage from '../features/auth/pages/RegisterPage.jsx';
import ForgotPasswordPage from '../features/auth/pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from '../features/auth/pages/ResetPasswordPage.jsx';
import VerifyEmailPage from '../features/auth/pages/VerifyEmailPage.jsx';
import DashboardPage from '../features/dashboard/DashboardPage.jsx';
import ExamRuntimePage from '../features/exam/ExamRuntimePage.jsx';
import ExamResultPage from '../features/exam/ExamResultPage.jsx';
import HistoryPage from '../features/exam/HistoryPage.jsx';

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      // Reachable whether signed in or not (the link comes from an email).
      { path: 'verify-email', element: <VerifyEmailPage /> },
      {
        element: <PublicOnly />,
        children: [
          { path: 'login', element: <LoginPage /> },
          { path: 'register', element: <RegisterPage /> },
          { path: 'forgot-password', element: <ForgotPasswordPage /> },
          { path: 'reset-password', element: <ResetPasswordPage /> },
        ],
      },
      {
        element: <RequireAuth />,
        children: [
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'history', element: <HistoryPage /> },
          { path: 'exam/:id', element: <ExamRuntimePage /> },
          { path: 'exam/:id/result', element: <ExamResultPage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

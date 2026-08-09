import { createBrowserRouter } from 'react-router-dom';
import RootLayout from '../layouts/RootLayout.jsx';
import HomePage from '../pages/HomePage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';
import ErrorState from '../components/ErrorState.jsx';
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
import ProgressPage from '../features/analytics/ProgressPage.jsx';
import AchievementsPage from '../features/analytics/AchievementsPage.jsx';
import ProfilePage from '../features/profile/ProfilePage.jsx';
import LiveCBTPage from '../features/live/LiveCBTPage.jsx';
import AIStudyPage from '../features/ai/AIStudyPage.jsx';
import PostUtmeHub from '../features/post-utme/pages/PostUtmeHub.jsx';
import CoursesPage from '../features/subjects/CoursesPage.jsx';
import SetupPage from '../features/auth/pages/SetupPage.jsx';
import SettingsPage from '../features/settings/SettingsPage.jsx';
import NotificationPreferencesPage from '../features/settings/NotificationPreferencesPage.jsx';
import RequireAdmin from '../features/admin/RequireAdmin.jsx';
import AdminDashboardPage from '../features/admin/pages/AdminDashboardPage.jsx';
import QuestionBankPage from '../features/admin/pages/QuestionBankPage.jsx';
import EditQuestionPage from '../features/admin/pages/EditQuestionPage.jsx';
import SubjectManagementPage from '../features/admin/pages/SubjectManagementPage.jsx';
import StudentManagementPage from '../features/admin/pages/StudentManagementPage.jsx';
import AdminRosterPage from '../features/admin/pages/AdminRosterPage.jsx';
import VerificationQueuePage from '../features/admin/pages/VerificationQueuePage.jsx';
import PostUtmeRankingsPage from '../features/admin/pages/PostUtmeRankingsPage.jsx';
import AdminSettingsPage from '../features/admin/pages/AdminSettingsPage.jsx';
import AdminActivityPage from '../features/admin/pages/AdminActivityPage.jsx';

export const router = createBrowserRouter([
  {
    // Replaces React Router's default error element, which renders a raw
    // stack trace on a blank white page.
    errorElement: <ErrorState />,
    element: <RequireAuth />,
    children: [
      { path: 'setup', element: <SetupPage /> },
    ],
  },
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      {
        element: <PublicOnly />,
        children: [
          { path: 'login', element: <LoginPage /> },
          { path: 'register', element: <RegisterPage /> },
          { path: 'forgot-password', element: <ForgotPasswordPage /> },
          { path: 'reset-password', element: <ResetPasswordPage /> },
          { path: 'verify-email', element: <VerifyEmailPage /> },
        ],
      },
      {
        element: <RequireAuth />,
        children: [
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'progress', element: <ProgressPage /> },
          { path: 'achievements', element: <AchievementsPage /> },
          { path: 'courses', element: <CoursesPage /> },
          { path: 'history', element: <HistoryPage /> },
          { path: 'profile', element: <ProfilePage /> },
          { path: 'settings', element: <SettingsPage /> },
          { path: 'settings/notifications', element: <NotificationPreferencesPage /> },
          { path: 'live', element: <LiveCBTPage /> },
          { path: 'ai-study', element: <AIStudyPage /> },
          { path: 'post-utme', element: <PostUtmeHub /> },
          { path: 'exam/:id', element: <ExamRuntimePage /> },
          { path: 'exam/:id/result', element: <ExamResultPage /> },
          {
            element: <RequireAdmin />,
            children: [
              { path: 'admin', element: <AdminDashboardPage /> },
              { path: 'admin/questions', element: <QuestionBankPage /> },
              { path: 'admin/questions/new', element: <EditQuestionPage /> },
              { path: 'admin/questions/:id/edit', element: <EditQuestionPage /> },
              { path: 'admin/subjects', element: <SubjectManagementPage /> },
              { path: 'admin/students', element: <StudentManagementPage /> },
              { path: 'admin/rankings', element: <PostUtmeRankingsPage /> },
              { path: 'admin/verifications', element: <VerificationQueuePage /> },
              { path: 'admin/activity', element: <AdminActivityPage /> },
              { path: 'admin/settings', element: <AdminSettingsPage /> },
              { path: 'admin/roster', element: <AdminRosterPage /> },
            ],
          },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

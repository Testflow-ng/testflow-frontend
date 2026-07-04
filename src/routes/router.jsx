import { createBrowserRouter } from 'react-router-dom';
import RootLayout from '../layouts/RootLayout.jsx';
import HomePage from '../pages/HomePage.jsx';
import FeaturesPage from '../pages/FeaturesPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';
import RequireAuth from '../features/auth/RequireAuth.jsx';
import PublicOnly from '../features/auth/PublicOnly.jsx';
import LoginPage from '../features/auth/pages/LoginPage.jsx';
import RegisterPage from '../features/auth/pages/RegisterPage.jsx';
import DashboardPage from '../features/dashboard/DashboardPage.jsx';
import ExamRuntimePage from '../features/exam/ExamRuntimePage.jsx';
import ExamResultPage from '../features/exam/ExamResultPage.jsx';
import HistoryPage from '../features/exam/HistoryPage.jsx';
import ProgressPage from '../features/analytics/ProgressPage.jsx';
import AchievementsPage from '../features/analytics/AchievementsPage.jsx';
import ProfilePage from '../features/profile/ProfilePage.jsx';
import RequireAdmin from '../features/admin/RequireAdmin.jsx';
import AdminDashboardPage from '../features/admin/pages/AdminDashboardPage.jsx';
import QuestionBankPage from '../features/admin/pages/QuestionBankPage.jsx';
import EditQuestionPage from '../features/admin/pages/EditQuestionPage.jsx';
import SubjectManagementPage from '../features/admin/pages/SubjectManagementPage.jsx';
import StudentManagementPage from '../features/admin/pages/StudentManagementPage.jsx';
import AdminRosterPage from '../features/admin/pages/AdminRosterPage.jsx';

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'features', element: <FeaturesPage /> },
      {
        element: <PublicOnly />,
        children: [
          { path: 'login', element: <LoginPage /> },
          { path: 'register', element: <RegisterPage /> },
        ],
      },
      {
        element: <RequireAuth />,
        children: [
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'progress', element: <ProgressPage /> },
          { path: 'achievements', element: <AchievementsPage /> },
          { path: 'history', element: <HistoryPage /> },
          { path: 'profile', element: <ProfilePage /> },
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
              { path: 'admin/roster', element: <AdminRosterPage /> },
            ],
          },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

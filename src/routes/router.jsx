import { createBrowserRouter, Navigate } from 'react-router-dom';
import RootLayout from '../layouts/RootLayout.jsx';
import HomePage from '../pages/HomePage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';
import PrivacyPage from '../pages/PrivacyPage.jsx';
import TermsPage from '../pages/TermsPage.jsx';
import HelpCenterPage from '../pages/HelpCenterPage.jsx';
import ErrorState from '../components/ErrorState.jsx';
import RequireAuth from '../features/auth/RequireAuth.jsx';
import ComingSoonPage from '../pages/ComingSoonPage.jsx';
import LoginPage from '../features/auth/pages/LoginPage.jsx';
import RegisterPage from '../features/auth/pages/RegisterPage.jsx';
import ForgotPasswordPage from '../features/auth/pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from '../features/auth/pages/ResetPasswordPage.jsx';
import VerifyEmailPage from '../features/auth/pages/VerifyEmailPage.jsx';
import PublicOnly from '../features/auth/PublicOnly.jsx';
import AdsDashboardPlaceholder from '../features/ads/AdsDashboardPlaceholder.jsx';
import { AUTH_ENABLED, WAITLIST_PATH } from '../features/auth/paths.js';
import PageLoader from '../components/PageLoader.jsx';
import { ORG_SLUG, PRODUCT_NAME_PUBLIC, PRODUCT_PATH, PRODUCT_SLUG } from '../constants/products.js';
import DashboardPage from '../features/dashboard/DashboardPage.jsx';
import ExamRuntimePage from '../features/exam/ExamRuntimePage.jsx';
import ExamResultPage from '../features/exam/ExamResultPage.jsx';
import ExamReportPage from '../features/exam/ExamReportPage.jsx';
import ProgressPage from '../features/analytics/ProgressPage.jsx';
import AchievementsPage from '../features/analytics/AchievementsPage.jsx';
import ProfilePage from '../features/profile/ProfilePage.jsx';
import BookmarksPage from '../features/bookmarks/BookmarksPage.jsx';
import HallOfFamePage from '../features/hall-of-fame/HallOfFamePage.jsx';
import LiveRedirect from '../features/live/LiveRedirect.jsx';
import LiveRoomPage from '../features/live/LiveRoomPage.jsx';
import LiveCBTPage from '../features/live/LiveCBTPage.jsx';
import AIStudyPage from '../features/ai/AIStudyPage.jsx';
import PostUtmeComingSoon from '../features/post-utme/pages/PostUtmeComingSoon.jsx';
import LibraryPage from '../features/library/LibraryPage.jsx';
import ReaderPage from '../features/library/ReaderPage.jsx';
import CoursesPage from '../features/subjects/CoursesPage.jsx';
import SettingsPage from '../features/settings/SettingsPage.jsx';
import NotificationPreferencesPage from '../features/settings/NotificationPreferencesPage.jsx';
import FeedbackPage from '../features/feedback/FeedbackPage.jsx';
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
import FlaggedQuestionsPage from '../features/admin/pages/FlaggedQuestionsPage.jsx';
import AdminFeedbackPage from '../features/admin/pages/FeedbackPage.jsx';
import PublicQuestionPage from '../features/public-questions/pages/PublicQuestionPage.jsx';

const uiKit = async () => ({ Component: (await import('../features/ui-kit/UiKitPage.jsx')).default });

export const router = createBrowserRouter([
  {
    // Replaces React Router's default error element, which renders a raw
    // stack trace on a blank white page.
    errorElement: <ErrorState />,
    element: <RequireAuth />,
    children: [
      { path: 'setup', element: <Navigate to="/dashboard" replace /> },
    ],
  },
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'privacy', element: <PrivacyPage /> },
      { path: 'terms', element: <TermsPage /> },
      { path: 'help', element: <HelpCenterPage /> },
      { path: 'question/:id', element: <PublicQuestionPage /> },
      { path: 'coming-soon', element: <ComingSoonPage /> },
      { path: 'ui-kit', lazy: uiKit },
      { path: 'ui-kit/:id', lazy: uiKit },
      // Eddyrus Media: who is behind Testflow.
      { path: ORG_SLUG, lazy: async () => ({ Component: (await import('../pages/EddyrusLandingPage.jsx')).default }), HydrateFallback: PageLoader },
      // Testflow for Everyone (marketing only). Sign-in and register stay on the waitlist.
      { path: PRODUCT_SLUG, lazy: async () => ({ Component: (await import('../pages/EverybodyLandingPage.jsx')).default }), HydrateFallback: PageLoader },
      ...(AUTH_ENABLED
        ? [
            { path: `${PRODUCT_SLUG}/signin`, element: <LoginPage product="everybody" /> },
            { path: `${PRODUCT_SLUG}/register`, element: <RegisterPage product="everybody" /> },
          ]
        : [
            { path: `${PRODUCT_SLUG}/signin`, element: <ComingSoonPage title="Sign-in is" accent="coming soon." lead={`We’re getting ${PRODUCT_NAME_PUBLIC} ready. Join the waitlist to hear when it opens.`} backTo={PRODUCT_PATH} backLabel={`← Back to ${PRODUCT_NAME_PUBLIC}`} /> },
            { path: `${PRODUCT_SLUG}/register`, element: <ComingSoonPage title="Your platform is" accent="coming soon." lead={`We’re getting ${PRODUCT_NAME_PUBLIC} ready. Join the waitlist to hear when it opens.`} backTo={PRODUCT_PATH} backLabel={`← Back to ${PRODUCT_NAME_PUBLIC}`} /> },
          ]),
      // TestFlow Ads: lazy-loaded so the main bundle is unaffected.
      { path: 'ads', lazy: async () => ({ Component: (await import('../pages/AdsLandingPage.jsx')).default }), HydrateFallback: PageLoader },
      { path: 'ads/terms', lazy: async () => ({ Component: (await import('../pages/AdsTermsPage.jsx')).default }), HydrateFallback: PageLoader },
      { path: 'ads/rules', lazy: async () => ({ Component: (await import('../pages/AdsRulesPage.jsx')).default }), HydrateFallback: PageLoader },
      ...(AUTH_ENABLED
        ? [
            { path: 'ads/signin', element: <LoginPage product="ads" /> },
            { path: 'ads/register', element: <RegisterPage product="ads" /> },
            { path: 'ads/dashboard', element: <AdsDashboardPlaceholder /> },
          ]
        : [
            {
              path: 'ads/signin',
              element: (
                <ComingSoonPage
                  title="Advertiser sign-in is"
                  accent="coming soon."
                  lead="We’re getting the advertiser dashboard ready. Join the waitlist to hear when it opens."
                  backTo="/ads"
                  backLabel="← Back to TestFlow Ads"
                />
              ),
            },
            {
              path: 'ads/register',
              element: (
                <ComingSoonPage
                  title="Advertiser sign-up is"
                  accent="coming soon."
                  lead="We’re getting the advertiser dashboard ready. Join the waitlist to hear when it opens."
                  backTo="/ads"
                  backLabel="← Back to TestFlow Ads"
                />
              ),
            },
          ]),
      // Authentication is paused: every entry point lands on the waitlist.
      ...(AUTH_ENABLED
        ? [
            {
              element: <PublicOnly />,
              children: [
                { path: 'login', element: <LoginPage /> },
                { path: 'register', element: <RegisterPage /> },
                { path: 'forgot-password', element: <ForgotPasswordPage /> },
                { path: 'reset-password', element: <ResetPasswordPage /> },
              ],
            },
            { path: 'verify-email', element: <VerifyEmailPage /> },
          ]
        : ['login', 'register', 'forgot-password', 'reset-password', 'verify-email'].map((path) => ({
            path,
            element: <Navigate to={WAITLIST_PATH} replace />,
          }))),
      {
        element: <RequireAuth />,
        children: [
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'progress', element: <ProgressPage /> },
          { path: 'hall-of-fame', element: <HallOfFamePage /> },
          { path: 'achievements', element: <AchievementsPage /> },
          { path: 'courses', element: <CoursesPage /> },
          { path: 'library', element: <LibraryPage /> },
          { path: 'library/:id/read', element: <ReaderPage /> },
          { path: 'history', element: <Navigate to="/progress" replace /> },
          { path: 'profile', element: <ProfilePage /> },
          { path: 'profile/bookmarks', element: <BookmarksPage /> },
          { path: 'settings', element: <SettingsPage /> },
          { path: 'settings/notifications', element: <NotificationPreferencesPage /> },
          { path: 'settings/feedback', element: <FeedbackPage /> },
          { path: 'live', element: <LiveCBTPage /> },
          { path: 'live/:code', element: <LiveRoomPage /> },
          { path: 'live-cbt/:code', element: <LiveRedirect /> },
          { path: 'ai-study', element: <AIStudyPage /> },
          { path: 'post-utme', element: <PostUtmeComingSoon /> },
          { path: 'exam/:id', element: <ExamRuntimePage /> },
          { path: 'exam/:id/result', element: <ExamResultPage /> },
          { path: 'exam/:id/report', element: <ExamReportPage /> },
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
              { path: 'admin/reports', element: <FlaggedQuestionsPage /> },
              { path: 'admin/feedback', element: <AdminFeedbackPage /> },
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

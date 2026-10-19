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
import ExamResultRoute from '../features/exam/ExamResultRoute.jsx';
import BillingPage from '../features/billing/BillingPage.jsx';
import BillingCompletePage from '../features/billing/BillingCompletePage.jsx';
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
import AdminLayout from '../features/admin/AdminLayout.jsx';
import AuthorizePage from '../features/workspace/onboarding/AuthorizePage.jsx';
import OnboardingPage from '../features/workspace/onboarding/OnboardingPage.jsx';
import WorkspaceLayout from '../features/workspace/WorkspaceLayout.jsx';
import WorkspaceOverview from '../features/workspace/screens/OverviewScreen.jsx';
import WorkspaceWebsite from '../features/workspace/screens/WebsiteScreen.jsx';
import WebsiteComingSoon from '../features/workspace/screens/WebsiteComingSoon.jsx';
import LibraryComingSoon from '../features/workspace/screens/LibraryComingSoon.jsx';
import { LIBRARY_ENABLED, WEBSITE_EDITOR_ENABLED } from '../features/workspace/flags.js';
import WorkspaceExams from '../features/workspace/screens/ExamsScreen.jsx';
import ExamDetailScreen from '../features/workspace/screens/ExamDetailScreen.jsx';
import WorkspaceReports from '../features/workspace/screens/ReportsScreen.jsx';
import AnnouncementsScreen from '../features/workspace/screens/AnnouncementsScreen.jsx';
import WorkspaceBanks from '../features/workspace/screens/BanksScreen.jsx';
import WorkspaceBank from '../features/workspace/screens/BankDetailScreen.jsx';
import WorkspaceStudents from '../features/workspace/screens/StudentsScreen.jsx';
import WorkspaceStudentDetail from '../features/workspace/screens/StudentDetailScreen.jsx';
import WorkspaceLibrary from '../features/workspace/screens/LibraryScreen.jsx';
import WorkspacePayments from '../features/workspace/screens/PaymentsScreen.jsx';
import WorkspaceDomains from '../features/workspace/screens/DomainsScreen.jsx';
import WorkspaceBillingComplete from '../features/workspace/screens/BillingCompleteScreen.jsx';
import WorkspaceBilling from '../features/workspace/screens/BillingScreen.jsx';
import OverviewScreen from '../features/admin/screens/OverviewScreen.jsx';
import UsersScreen from '../features/admin/screens/UsersScreen.jsx';
import QuestionsScreen from '../features/admin/screens/QuestionsScreen.jsx';
import QuestionEditorScreen from '../features/admin/screens/QuestionEditorScreen.jsx';
import SubjectsScreen from '../features/admin/screens/SubjectsScreen.jsx';
import ReportsScreen from '../features/admin/screens/ReportsScreen.jsx';
import FeedbackScreen from '../features/admin/screens/FeedbackScreen.jsx';
import VerificationsScreen from '../features/admin/screens/VerificationsScreen.jsx';
import AdsScreen from '../features/admin/screens/AdsScreen.jsx';
import ActivityScreen from '../features/admin/screens/ActivityScreen.jsx';
import SettingsScreen from '../features/admin/screens/SettingsScreen.jsx';
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
          { path: 'exam/:id/result', element: <ExamResultRoute /> },
          { path: 'billing', element: <BillingPage /> },
          { path: 'billing/complete', element: <BillingCompletePage /> },
          { path: 'everybody/authorize', element: <AuthorizePage /> },
          { path: 'everybody/start', element: <OnboardingPage /> },
          {
            element: <WorkspaceLayout />,
            children: [
              { path: 'workspace', element: <WorkspaceOverview /> },
              { path: 'workspace/website', element: WEBSITE_EDITOR_ENABLED ? <WorkspaceWebsite /> : <WebsiteComingSoon /> },
              { path: 'workspace/exams', element: <WorkspaceExams /> },
              { path: 'workspace/exams/:examId', element: <ExamDetailScreen /> },
              { path: 'workspace/announcements', element: <AnnouncementsScreen /> },
              { path: 'workspace/reports', element: <WorkspaceReports /> },
              { path: 'workspace/banks', element: <WorkspaceBanks /> },
              { path: 'workspace/banks/:bankId', element: <WorkspaceBank /> },
              { path: 'workspace/questions', element: <Navigate to="/workspace/banks" replace /> },
              { path: 'workspace/students', element: <WorkspaceStudents /> },
              { path: 'workspace/students/:studentId', element: <WorkspaceStudentDetail /> },
              { path: 'workspace/library', element: LIBRARY_ENABLED ? <WorkspaceLibrary /> : <LibraryComingSoon /> },
              { path: 'workspace/payments', element: <WorkspacePayments /> },
              { path: 'workspace/domains', element: <WorkspaceDomains /> },
              { path: 'workspace/billing', element: <WorkspaceBilling /> },
              { path: 'workspace/billing/complete', element: <WorkspaceBillingComplete /> },
            ],
          },
          { path: 'exam/:id/report', element: <ExamReportPage /> },
          {
            element: <RequireAdmin />,
            children: [
              {
                element: <AdminLayout />,
                children: [
                  { path: 'admin', element: <OverviewScreen /> },
                  { path: 'admin/users', element: <UsersScreen /> },
                  { path: 'admin/questions', element: <QuestionsScreen /> },
                  { path: 'admin/questions/new', element: <QuestionEditorScreen /> },
                  { path: 'admin/questions/:id/edit', element: <QuestionEditorScreen /> },
                  { path: 'admin/subjects', element: <SubjectsScreen /> },
                  { path: 'admin/reports', element: <ReportsScreen /> },
                  { path: 'admin/feedback', element: <FeedbackScreen /> },
                  { path: 'admin/verifications', element: <VerificationsScreen /> },
                  { path: 'admin/ads', element: <AdsScreen /> },
                  { path: 'admin/activity', element: <ActivityScreen /> },
                  { path: 'admin/settings', element: <SettingsScreen /> },
                  // Old addresses, kept so bookmarks still work.
                  { path: 'admin/students', element: <Navigate to="/admin/users" replace /> },
                  { path: 'admin/roster', element: <Navigate to="/admin/users" replace /> },
                  { path: 'admin/rankings', element: <Navigate to="/admin" replace /> },
                ],
              },
            ],
          },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

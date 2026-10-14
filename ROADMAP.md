# Redesign roadmap

How every screen moves onto the Testflow design system (`DESIGN_SYSTEM.md`). Order matters: smaller, safer
screens first so the pattern is proven before the exam flow, and the exam flow before admin.

**See the building blocks:** open `/ui-kit` (footer link; sidebar link in development).

Sizes: **S** under 150 lines, **M** 150 to 400, **L** over 400 or high risk. Line counts are today's.

---

## How every screen is done (definition of done)

1. **Audit first** (30 minutes): list what the screen shows, its data hooks, and every state it can be in.
2. **Rebuild on the shared components.** `Screen` + `PageHeader`, then the components in the table. No raw colours,
   no hand-rolled buttons, inputs, modals or tables, no native selects.
3. **All states**: loading (skeleton), empty (`EmptyState`), error, success feedback (`toast`), busy and disabled.
4. **Keep behaviour.** Same routes, same API calls, same data. Only the interface changes. If a change needs a
   behaviour change, split it into its own PR.
5. **Check** at 360px, tablet and desktop; keyboard only; no sideways scroll; `npm run build` and no new lint errors.
6. **One screen (or one piece of the exam flow) per pull request**, with before and after screenshots.
7. Tick it off in the tracker at the bottom.

Never in a redesign PR: touching auth, payments, scoring, timing or anything the server owns.

---

## Phase 0: ground rules (before the first screen)

| Task | Why |
|---|---|
| Fix the `Screen` widths (`max-w-lg`, `xl`, `2xl`) | `global.css` redefines `--container-*` to 44 to 108rem, so these are far wider than intended. Replace with explicit values. |
| Decide the app font | The app uses Inter; landing uses Plus Jakarta Sans. One change in `global.css` when decided (sidebar will change slightly). |
| Mount `ToastProvider` | Done. Use `useToast()` for all feedback. |
| Pick which screens use the sidebar vs header | Signed-in desktop uses `AppSidebar`; phones use `Header` and `BottomNav`. |
| Remove the old Shell pieces as they are replaced | `ThemeToggle`, old account menu code, duplicate card classes. |

---

## Phase 1: small and safe (proves the pattern)

| # | Screen | Route | Files (lines) | Size | Build with | Notes |
|---|---|---|---|---|---|---|
| 1 | Settings | `/settings` | `settings/SettingsPage` (144) | S | `PageHeader`, `Card`, `Switch`, `Select`, `DropdownMenu`, `ConfirmDialog` (sign out all) | Add the theme toggle here at launch (`THEME_SWITCHING_ENABLED`). |
| 2 | Notification settings | `/settings/notifications` | `NotificationPreferencesPage` (119) | S | `Switch`, `FormSection`, `StickyActionBar`, `toast` | Save bar instead of per-toggle saves. |
| 3 | Achievements | `/achievements` | `analytics/AchievementsPage` (32), `Achievements` (51), `AchievementUnlock` (64) | S | `AchievementBadge`, `EmptyState`, Flo, `Confetti` | Unlock popup keeps Flo + confetti, recoloured already. |
| 4 | Progress | `/progress` | `ProgressPage` (76), `SubjectChart` (62), `StatCards` (30) | S | `StatCard`, `BrandBarChart`/`Line`/`Radar`, `ProgressBar` | Replace the recharts setup with the brand charts. |
| 5 | Live CBT | `/live` | `live/LiveCBTPage` (128) | S | `Card`, `StatusBadge`, `CountdownBadge`-style timer, `EmptyState` | Realtime stays as is. |
| 6 | AI Study | `/ai-study` | `ai/AIStudyPage` (104) | S | `Textarea`, `Button`, `Spinner`, `EmptyState` | Keep Flo for thinking states. |
| 7 | Courses | `/courses` | `CoursesPage` (120), `SubjectGrid` (139), `SubjectCard` (153), `CourseSelectionModal` (123) | M | `FilterableList`, `CourseCard`, `SegmentedControl`, `Modal` | Pin toggle feeds the sidebar's pinned list. |
| 8 | First-time setup | `/setup` | `auth/pages/SetupPage` (96), `onboarding/OnboardingFlow` (209) | M | `Stepper`, `Field`, `Input`, `Select`, `FormSection` | Username step must stay (backend `needsUsername`). |

## Phase 2: the main student experience

| # | Screen | Route | Files (lines) | Size | Build with | Notes |
|---|---|---|---|---|---|---|
| 9 | Profile | `/profile` | `profile/ProfilePage` (547) | L | `Avatar`, `Tabs`, `KeyValueList`, `FormSection`, `StickyActionBar`, `ConfirmDialog`, `Modal` | Split into sections; password change modal stays. Remove the hand-made `Switch`. |
| 10 | Dashboard | `/dashboard` | `dashboard/DashboardPage` (599) | L | `StatCard`, `ProgressRing`, `StreakBadge`, `CourseCard`, `LeaderboardRow`, `DashboardSkeleton`, Flo | The most-seen page: do it carefully, one section per PR (hero, stats, quick actions, recent). |
| 11 | History | `/history` | `exam/HistoryPage` (123), `HistoryChart` (71) | S | `DataTable`/list, `FilterableList`, `BrandLineChart`, `StatusBadge`, score bands | Score colours via `utils/score.js`. |
| 12 | Post-UTME hub | `/post-utme` | `PostUtmeHub` (58), `PostUtmeLockScreen` (368), `PostUtmeDashboard` (234), `PostUtmeSubjectSelector` (163), `PostUtmeRadarChart` (162), `AggregateModal` (129), `MigrationModal` (129), `PostUtmeWelcomeFlow` (113), `Calculator` (130) | L | `Stepper`, `BrandRadarChart`, `Modal`, `Select`, `ProgressRing`, `Calculator` | Lock screen is a state, not a page: design all states (locked, welcome, ready). |
| 13 | Public question | `/question/:id` | `public-questions/PublicQuestionPage` (223) | M | `QuestionCard`, `OptionRow`, `Banner`, `SponsoredCard`-style CTA | Public and indexable: keep its SEO. Call to action goes to `REGISTER_PATH`. |

## Phase 3: the exam flow (highest risk, last of the student screens)

Rules: server owns the clock, answers and scoring. Components stay presentational. Each piece is its own PR with a
full manual run-through (start, answer, flag, jump, time warning, submit, result, review) on a phone and a laptop.
Never ship two of these at once.

| # | Piece | File (lines) | Size | Build with | Notes |
|---|---|---|---|---|---|
| 14 | Start dialog | `exam/ExamStartDialog` (333) | M | `Modal`, `SegmentedControl` (question count), `Slider`/`Select` (time), `Field`, `Button` | Same options, same API call. |
| 15 | Countdown | `exam/ExamCountdown` (96) | S | Flo, brand type | Already honours reduced motion. |
| 16 | Runtime shell | `exam/ExamRuntimePage` (798) | L | `QuestionCard`, `OptionRow`, `QuestionNavigator`, `ExamTimer`, `Banner` (offline), `ConfirmDialog` (submit) | Fixed full-screen shell stays. Swap one region per PR: question, options, navigator, timer, submit. |
| 17 | Submit state | `exam/SubmitSuspense` (47) | S | `Spinner`, Flo | |
| 18 | Result and review | `exam/ExamResultPage` (553) | L | `ResultSummary`, `OptionRow` review states, `ProgressBar`, `Tabs` (summary / review), `StatCard`, Flo, `Confetti`, `SponsoredCard` (ad slot) | Review must keep icon + text for correct/wrong (not colour alone). The ad slot calls the Ads serve API after submit. |

## Phase 4: admin (internal, last)

| # | Screen | Route | File (lines) | Size | Build with |
|---|---|---|---|---|---|
| 19 | Admin dashboard | `/admin` | `AdminDashboardPage` (341) + chart parts | M | `StatCard`, brand charts, `DataTable` |
| 20 | Question bank | `/admin/questions` | `QuestionBankPage` (405), `QuestionAnalyticsModal` (141) | L | `DataTable` (server mode, selection, bulk actions), `FilterableList`, `StatusBadge`, `Modal` |
| 21 | Edit question | `/admin/questions/new`, `/:id/edit` | `EditQuestionPage` (280) | M | `QuestionEditor` (live LaTeX preview), `FormSection` |
| 22 | Bulk import | modal | `BulkImportModal` (152) | S | `BulkImport` (reusable) |
| 23 | Subjects | `/admin/subjects` | `SubjectManagementPage` (284) | M | `DataTable`, `ConfirmDialog`, `FormSection` |
| 24 | Students | `/admin/students` | `StudentManagementPage` (347) | M | `DataTable` (server mode), `SearchField`, `DropdownMenu`, `StatusBadge`, `ConfirmDialog` |
| 25 | Roster | `/admin/roster` | `AdminRosterPage` (313) | M | `DataTable`, `BulkImport`, `RoleSelect` |
| 26 | Verifications | `/admin/verifications` | `VerificationQueuePage` (269) | M | Same pattern as the Ads review queue: `Tabs`, `DataTable`, review `Modal`, reject with reason |
| 27 | Post-UTME rankings | `/admin/rankings` | `PostUtmeRankingsPage` (145) | S | `DataTable`, `LeaderboardRow` |
| 28 | Activity | `/admin/activity` | `AdminActivityPage` (62), `AdminActivityFeed` (169) | S | `Timeline`, `FilterableList` |
| 29 | Admin settings | `/admin/settings` | `AdminSettingsPage` (139) | S | `FormSection`, `Switch`, `StickyActionBar` |
| – | Brainstorm | not routed | `AdminBrainstormPage` (325) | – | Confirm it is unused; delete or route it. |

## Phase 5: global pieces (alongside the phases above)

| Piece | File | Notes |
|---|---|---|
| Mobile header | `components/Header` | Uses `AccountMenu`; hamburger panel restyle. |
| Bottom tab bar | `components/BottomNav` | Lavender active pill done; installed-app only. |
| Error, offline, night-owl | `ErrorState`, `OfflineBanner`, `NightOwlPopup` | Use `Banner`/`EmptyState` patterns; copy stays honest. |
| Dark mode | `theme.js` | Parked. Revisit after launch (`THEME_SWITCHING_ENABLED`). |

---

## Other products (after the student app, same method)

### TestFlow Ads (advertiser app, `/ads/*`)
Backend is ready (`backend/docs/ads/FRONTEND.md`). Routes and what each uses:

| Screen | Route | Build with |
|---|---|---|
| Sign in / register | `/ads/signin`, `/ads/register` | Done (behind `VITE_AUTH_ENABLED`) |
| Dashboard | `/ads/dashboard` | `StatCard`, `Tabs` by campaign group, `StatusBadge`, `CountdownBadge`, `EmptyState` |
| Campaign list | `/ads/campaigns` | `FilterableList`/`DataTable`, `StatusBadge`, `DropdownMenu` |
| Create / edit campaign | `/ads/campaigns/new`, `/:id` | `Stepper`, `FormSection`, `FileUpload`, `CharacterCounter`, `TagInput`, `DatePicker`, `Slider`, `AdPreview`, `StickyActionBar` |
| Checkout and return | `/ads/checkout`, `/ads/checkout/return` | `KeyValueList`, `Checkbox` (terms), `PaymentReturnStatus` |
| Analytics | `/ads/campaigns/:id/analytics` | `AnalyticsPanel` |
| Billing | `/ads/billing` | `DataTable` |
| Admin: review, payments | `/admin/ads` | `AdsReviewQueue`, `AdsPaymentsTable` |
| Student ad slot | after an exam | `SponsoredCard` + `useAdImpression` |

Needs the unified sign-in pages wired to the identity API and a routing decision for the advertiser area.

### Testflow for Everyone (organisation app)
Backend design is in `backend/docs/everybody/IMPLEMENTATION.md`; the endpoints are not live yet.

| Screen | Build with |
|---|---|
| Register organisation, pick plan | `Stepper`, `PlanCard`, `PaymentReturnStatus` |
| Overview | `StatCard`, `Banner` (subscription state), `EmptyState` |
| Website builder | `TemplatePicker`, `BlockList`, `BlockEditor`, `ColorPicker`, `DevicePreview`, `PublishBar`, `VersionHistory` |
| Exams (list, create, settings) | `DataTable`, `ExamSettingsForm`, `StatusBadge` |
| Question bank | `QuestionEditor`, `BulkImport`, `DataTable` |
| Students and groups | `DataTable`, `InviteDialog`, `RoleSelect`, `GroupManager` |
| Community | `PostCard`, `PostComposer`, `CommentThread` |
| Results | `BrandBarChart`, `DataTable`, `StatCard` |
| Domains | `DomainCard` |
| Billing | `SubscriptionSummary`, `InvoiceTable`, `PlanChangeDialog` |
| Public tenant site | `SiteRenderer` + `OrgThemeProvider` |
| Student exam taking on a tenant site | the same exam components, inside `OrgThemeProvider` |

Needs the hostname-based tenant detection and the backend routes before wiring; screens can be built with sample data.

---

## Tracker

Tick each box when the screen is merged. Done on the `redesign` branch (not yet merged): Settings, Notifications, Profile, Achievements, Progress + History (one page), AI Study and Post-UTME (coming soon).

**Phase 1** [x] Settings [x] Notifications [x] Achievements [x] Progress and History [x] AI Study (soon) [x] Live CBT [x] Courses [ ] Setup
**Phase 2** [x] Profile [ ] Dashboard [x] Post-UTME (soon) [ ] Public question
**Phase 3** [ ] Start dialog [ ] Countdown [ ] Runtime [ ] Submit state [ ] Result and review
**Phase 4** [ ] Admin dashboard [ ] Question bank [ ] Edit question [ ] Bulk import [ ] Subjects [ ] Students [ ] Roster [ ] Verifications [ ] Rankings [ ] Activity [ ] Admin settings
**Phase 5** [ ] Header [ ] Bottom bar [ ] Error/offline [ ] Dark mode (later)

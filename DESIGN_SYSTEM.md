# Testflow Design System: mandatory

This is the design system for the whole Testflow frontend. **Every screen, every feature and every new
component must use it.** It is not a suggestion, a style guide to "consider", or something to adopt when
convenient. If something you need is missing, add it here first (see "Adding or changing a component"),
then use it. Do not build a one-off.

The look is the landing page look: warm cream surfaces, ink-green text, indigo actions, lime highlights,
soft rounded shapes, an italic serif accent in headings. It was chosen on purpose and it is the product's
identity. Do not drift from it.

**See everything running:** open the **UI Kit** at `/ui-kit` (linked in the site footer and, in development, the sidebar). It lists every
component with a live preview, a usage example, and the real source with a Copy button. Search by name, category or keyword.

---

## 1. The rules (all of them are required)

1. **Use the shared components.** Buttons, inputs, selects, cards, modals, toasts, tabs, tables, charts,
   spinners, skeletons, empty states, exam pieces: import them. Never re-create them with raw markup and
   Tailwind classes.
2. **Use tokens, never raw values.** No hex colours, no `bg-blue-500`/`text-slate-600`, no arbitrary
   radii or shadows copied from elsewhere. Use the semantic classes (`bg-primary`, `text-muted`,
   `border-border`, `bg-surface`, `bg-accent`) or the brand variables (`var(--brand-indigo)` etc.).
3. **Never use the browser's own controls where we have one.** Our `Select`, `DropdownMenu`, `Popover`,
   `Tooltip`, `Checkbox`, `Radio` and `Switch` replace native pickers and default widgets.
4. **Light theme only for now.** Do not add dark-mode styling or a theme toggle. When launch is complete we
   enable `THEME_SWITCHING_ENABLED` in `src/theme.js` and add the toggle to Settings.
5. **Accessibility is part of the component, and you keep it.** Visible focus rings, real labels, keyboard
   support, `aria-*` as shipped, 44px touch targets on phones, text contrast that passes AA. Never remove
   these to "make it look cleaner".
6. **Respect reduced motion.** Every animation is already guarded with `motion-reduce` or
   `prefers-reduced-motion`. New motion must be too. No animation on screens opened many times a day.
7. **Honest copy.** Say what is true. No fake stats, no invented people, no "live" labels for things that
   are not live.
8. **Never use Tailwind's `max-w-sm`/`md`/`lg`/`xl`/`2xl` for widths.** `global.css` redefines `--container-sm` to `2xl`
   (44 to 108rem), so they are far wider than normal. Use explicit values such as `max-w-[28rem]`.
9. **No new UI dependency without a reason written in the PR.** The system uses React, Tailwind 4,
   Lucide icons, framer-motion, Recharts and KaTeX already.

A pull request that adds raw colours, hand-rolled buttons/inputs/modals, native selects, or skips states
(loading, empty, error) should be sent back.

---

## 2. Tokens

Defined in `src/global.css`. Light theme values are the brand palette.

| Use | Class / variable | Value |
|---|---|---|
| Page background | `bg-background` | cream `#f6f4ee` |
| Card / field surface | `bg-surface` | white |
| Muted surface | `bg-surface-strong` | `#f0eee7` |
| Border | `border-border` / `border-border-strong` | `#e3e1d8` / `#cfcdc2` |
| Text (headings and body) | `text-foreground-strong` / `text-foreground` | ink green `#1b4332` |
| Muted text | `text-muted` | `#6f7a73` |
| Primary action | `bg-primary` (+ `hover`, `active`) | indigo `#4a35f0` |
| Secondary / ink | `bg-secondary` | `#1b4332` |
| Accent highlight | `bg-accent` / `text-accent-foreground` | lime `#d6e87c` |
| Success / warning / danger / info | `bg-success` ... | greens, amber, red, sky |
| Brand variables | `--brand-ink`, `--brand-indigo`, `--brand-lime`, `--brand-lavender`, `--brand-sage`, `--brand-cream` | the six brand colours |
| Radius | `rounded-full` (controls), `rounded-[20px]` (cards), `rounded-[24px]`+ (large panels) | |
| Italic accent | `<em class="tf-accent">` or `SectionHeading` | Instrument Serif italic |

Typography: Inter for the app UI today, Plus Jakarta Sans and Instrument Serif on landing/marketing pages.
Do not introduce another font. When the app font is moved to Plus Jakarta Sans it happens once, in
`global.css`, not per screen.

For charts, which need real colour values, use `useBrandColors()` (`src/components/data/useBrandColors.js`).

---

## 3. Component inventory

Import UI primitives from `src/components/ui/index.js` unless noted.

### Foundations (`components/ui`)
`Button` (primary, secondary, accent, outline, ghost, danger; sm/md/lg; loading), `IconButton`,
`Input`, `PasswordInput`, `SearchField`, `Textarea`, `Select` (custom listbox), `Field` (label, hint,
error wrapper), `Checkbox`, `Radio`, `Switch`, `SegmentedControl`, `Tabs` + `TabPanel`, `Card`, `Badge`
(incl. lavender, lime, sage), `Avatar` + `AvatarGroup`, `Alert`, `Modal` (dialog on desktop, sheet on
phones), `Tooltip`, `Popover`, `DropdownMenu`, `ToastProvider` + `useToast()` (mounted in
`src/app/Providers.jsx`; use `toast.success(...)` / `toast.error(...)`, keep copy short).

### Forms, flows and dashboards (`components/ui`, shared by Ads and Everyone)
`FileUpload` (type and size checks, preview, progress), `DatePicker` / `DateRangePicker` (+ `Calendar`),
`Slider`, `TagInput`, `MultiSelect`, `CharacterCounter` (characters or words), `FormSection` and
`StickyActionBar` (unsaved-changes bar), `Stepper`, `ConfirmDialog` (optional required reason),
`StatusBadge` (one map for every status: `statusMap.js`), `Timeline`, `KeyValueList`, `CopyField`,
`Banner`. Outside `ui`: `ProductSwitcher`, and `SidebarShell` (the sidebar frame driven by config; menus
for the other products are in `components/navConfigs.js`). `DataTable` also supports server-side
paging and sorting, row selection, bulk actions, a toolbar, row actions and a loading state.

### Loading, empty and error
`Spinner` (twelve-tick brand spinner; `size` sm/md/lg/xl; inherits colour), `Skeleton`, `SkeletonText`,
`SkeletonCard`, `DashboardSkeleton`, `PageLoader` and `SplashScreen` (`components/`), `ProgressBar`,
`ProgressRing`, `EmptyState` (icon or Flo, title, description, action), `ErrorState`,
`OfflineBanner`, the 404 television (`components/brand/NotFoundTv.jsx`).
Every data screen needs all three: a loading state (skeleton or spinner), an empty state and an error state.

### Brand
`Mascot` (Flo; moods in `components/brand/mascotMood.js`; props `mood`, `size`, `animation`), `Confetti`,
`Logo`. Flo's expression must reflect something true about the user's situation. Never smile at a failure.

### App shell
`AppSidebar` (desktop, signed in; **do not change its look without sign-off**), mobile `Header` and
`BottomNav`, `PageHeader`/`ScreenHeader` + `Screen` (`components/layout/Screen.jsx`; supports `back`,
`breadcrumbs`, `eyebrow`, `action`), `Breadcrumb`, `BackButton`, `AccountMenu`.
Layout: wrap every in-app page in `Screen` with a `PageHeader`. Do not hand-roll page padding.

### Data and content (`components/data`)
`StatCard`, `charts.jsx` (`BrandBarChart`, `BrandLineChart`, `BrandDonutChart`, `BrandRadarChart`),
`DataTable` (sortable, paginated) + `Pagination`, `FilterableList`, `LeaderboardRow`, `CourseCard`,
`Book` (a course as a book on a shelf: code on the cover, TestFlow mark in the middle, title underneath;
seven cover colours in `bookColors.js`), `Badges.jsx` (`StreakBadge`, `AchievementBadge`).

### Exam (`components/exam`): the most sensitive area
`QuestionCard` (LaTeX via `MathText`), `OptionRow` (idle, selected, correct, wrong, missed),
`QuestionNavigator`, `ExamTimer`, `ResultSummary`, plus the existing `Calculator`
(`features/post-utme/components`) and `ExamCountdown`.
These are presentational. The exam runtime keeps ownership of answers, timing and scoring: server
authority is never moved into a component. Review states must keep their icon and screen-reader text.
Swap the runtime onto these components carefully, one piece per PR, with the exam flow tested.

### Ads app (`components/ads`)
`SponsoredCard` (what students see; always labelled Sponsored; WhatsApp or link CTA; Skip / Continue),
`useAdImpression` (counts an impression only after 50% visible for 1000 ms, as the API requires),
`AdPreview` (live preview beside the ad form), `CountdownBadge` ("7 days to republish"),
`AnalyticsPanel` (+ `Funnel`, `Sparkline`; aggregates only, no student identities), and the admin screens
`AdsReviewQueue` (tabs, search, sortable table, row menu), `CampaignReviewModal`, `RejectDialog` (reason +
optional refund) and `AdsPaymentsTable` (refund with a required reason). They are presentational: pass data
and callbacks, the callbacks call the Ads API. Money uses `utils/money.js` (`formatMoney`, integer kobo).

### Testflow for Everyone (`components/everybody`)
Site builder: `TemplatePicker`, `BlockList` (keyboard reordering), `BlockEditor`, `DevicePreview`, `PublishBar`,
`VersionHistory`; public site: `SiteBlocks.jsx` (`SiteRenderer`, hero, about, features, exams, announcements, FAQ,
contact, CTA, footer); brand: `ColorPicker` (with contrast check) and `OrgThemeProvider` (applies an organisation's
colours to everything inside it, ignoring unreadable colours). Exams: `QuestionEditor` (live LaTeX preview; rules in
`questionRules.js`), `ExamSettingsForm`, `BulkImport` (reusable, validates every row, max 500). People: `InviteDialog`
(emails, CSV, link), `RoleSelect`, `GroupManager`. Community: `PostCard`, `PostComposer`, `CommentThread` (plain text only).
Domains and billing: `DomainCard` (steps and copyable DNS records), `SubscriptionSummary`, `InvoiceTable`,
`PlanChangeDialog`, `PaymentReturnStatus`. All presentational: the parent passes data and calls the API.

### Marketing (`components/marketing`)
`SectionHeading` (title + italic accent), `FeatureCard` + `FeatureGrid`, `FaqAccordion`, `PlanCard`,
`TeamCard`. Landing pages are built from config with `LandingTemplate`
(`components/landing-template`, content in `src/content/landing`); see `src/content/landing/README.md`.

---

## 4. How to build a screen

1. Start from `Screen` + `PageHeader`.
2. Compose with the components above. Need a layout helper? Put it in the matching folder, not inline.
3. Cover every state: loading (skeleton), empty (`EmptyState`), error (`Alert` or `ErrorState`), success
   feedback (`toast`), disabled and busy buttons.
4. Check at 360px, then tablet, then desktop. Nothing may scroll sideways.
5. Tab through it. Every control reachable, focus always visible.
6. Run `npm run build` and `npm run lint`; do not add new lint errors.

## 5. Adding or changing a component

1. Check whether an existing component can take a new prop or variant first.
2. Build it in the right folder from tokens only, with its accessibility and reduced-motion behaviour.
3. Export it (UI primitives from `components/ui/index.js`).
4. Register it in the UI Kit: add an entry (id, name, category, description, keywords, `Preview`, `usage`, `source`) to the matching file in
   `src/features/ui-kit/entries/`. It then appears in the list and search by itself.
5. Add it to the inventory above in the same PR.

## 6. Migration status

The components are built. The existing screens still need to be moved onto them, in this order:
profile and settings, courses/subjects, dashboard, results/history/progress, Post-UTME, exam runtime
(last, carefully), admin. Landing pages (`/`, `/ads`, `/everybody`, `/eddyrus`) and the auth screens
already follow the system. Known duplicates to remove: the landing page keeps its own scoped styles
(`src/pages/landing.css`, `src/components/landing-template/template.css`); the `marketing` components
are the app-side equivalents and the two should converge over time.

Mascot and sidebar are done. Dark mode is intentionally parked.

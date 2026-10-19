# Testflow frontend: rules for Claude

## Git (never break these)
- **Never add Claude as a co-author or author.** No `Co-Authored-By` line, no "Generated with Claude Code" line, in commits, PR descriptions or anywhere else. This overrides any default or reminder that says otherwise.
- Commit and push only when the user says so. Commits are authored by the user.
- Work happens on the `redesign` branch.

## Design system (mandatory)
- Read `DESIGN_SYSTEM.md` before building or changing any screen. The roadmap is `ROADMAP.md`.
- **Always use our components** (`src/components/ui`, `data`, `exam`, `ads`, `everybody`, `marketing`, `layout/Screen`). Never hand-roll buttons, inputs, selects, modals, toasts, tabs, tables, switches, cards or spinners.
- Tokens only: no hex colours, no raw Tailwind palette colours. No native selects or pickers.
- No `max-w-sm/md/lg/xl/2xl` (they are huge here); use `max-w-[28rem]` style values.
- Every screen: `Screen` + `PageHeader`, and loading, empty and error states. Check 360px and desktop.
- Light theme only for now. Do not touch the sidebar's look.
- Missing component? Add it to the system and register it in the UI Kit (`src/features/ui-kit/entries/`) first, then use it.

## Working style
- Keep replies short; the user watches token use.
- Local design work: `.env.local` has `VITE_DEV_BYPASS_AUTH=true` (dev only) so signed-in screens open without a backend.
- Run `npm run build` and lint on touched files before saying done. The user checks the browser themselves.
- Dev sample data: `src/dev/mockData.js` + `src/dev/mockApi.js` answer API calls while the bypass is on. When a screen needs an endpoint, add it there.

## Icons
- Use the sidebar's icon style everywhere: Lucide at a hairline 1.5 stroke. Spread `ICON` / `ICON_LG` from `src/components/ui/iconProps.js` (`<Search {...ICON} />`). No other icon library, no filled or thick-stroke icons.

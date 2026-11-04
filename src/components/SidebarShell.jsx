import { Link, NavLink } from 'react-router-dom';
import { LogOut, PanelLeftClose, PanelLeftOpen, Search, SlidersHorizontal } from 'lucide-react';
import { cn } from '../utils/cn.js';
import Logo from './Logo.jsx';
import Mascot from './brand/Mascot.jsx';
import { ICON } from './ui/iconProps.js';
import { useSidebar } from '../hooks/useSidebar.js';

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary';

/**
 * Desktop sidebar frame (lg and up), driven by config so every product (student, ads, everyone) shares
 * the same look. Compact on purpose: 36px rows, 17px hairline Lucide icons, a floating rounded card with
 * Settings tucked underneath. Collapses to an icon rail. Phones keep the header and the bottom tab bar.
 *
 * items:   [{ to, label, Icon }]
 * topSlot: optional node under the logo row (e.g. <ProductSwitcher/>), hidden when collapsed
 * list:    optional { title, searchTo, searchLabel, entries, emptyText }. An entry is { key, label, to, title } for a link
 *          or { key, heading } for a small group title.
 * footer:  optional node replacing the Settings / sign-out row
 */
function SidebarShell({ items, homeTo = '/dashboard', homeLabel = 'TestFlow dashboard', topSlot, list, settingsTo = '/settings', onLogout, footer }) {
  const { collapsed, toggle } = useSidebar();

  const rowBase = cn(
    'flex h-9 items-center rounded-[10px] text-[15px] text-[#3d4a43] transition-colors hover:bg-black/[0.04]',
    focusRing,
    collapsed ? 'justify-center' : 'gap-2.5 px-2',
  );

  return (
    <aside
      aria-label="Sidebar"
      data-tour="sidebar"
      style={{ width: 'var(--sidebar-w)' }}
      className="fixed inset-y-0 left-0 z-40 hidden flex-col p-1.5 transition-[width] duration-200 motion-reduce:transition-none lg:flex"
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[26px] border border-black/[0.06] bg-[#fafaf8] shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className={cn('flex h-[54px] shrink-0 items-center', collapsed ? 'justify-center' : 'justify-between pl-[18px] pr-3.5')}>
          {!collapsed && (
            <Link to={homeTo} aria-label={homeLabel} className={cn('rounded-full', focusRing)}>
              <Logo size={26} withWordmark={false} />
            </Link>
          )}
          <button
            type="button"
            onClick={toggle}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!collapsed}
            className={cn('flex size-8 items-center justify-center rounded-lg text-[#6f7a73] transition-colors hover:bg-black/[0.05]', focusRing)}
          >
            {collapsed ? <PanelLeftOpen {...ICON} size={18} /> : <PanelLeftClose {...ICON} size={18} />}
          </button>
        </div>

        {!collapsed && topSlot ? <div className="px-2.5 pb-2">{topSlot}</div> : null}

        <nav aria-label="Primary" className={cn('min-h-0 flex-1 overflow-y-auto pb-3', collapsed ? 'px-2.5' : 'px-2.5')}>
          <ul className="flex flex-col gap-0.5">
            {items.map(({ to, label, Icon, tag }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  data-tour={`nav-${to}`}
                  title={collapsed ? label : undefined}
                  className={({ isActive }) => cn(rowBase, isActive && 'bg-[var(--brand-lavender)]/70 font-semibold text-[var(--brand-ink)] hover:bg-[var(--brand-lavender)]/70')}
                >
                  {({ isActive }) => (
                    <>
                      <Icon {...ICON} className={cn('shrink-0', isActive && 'text-[var(--brand-indigo)]')} />
                      {collapsed ? <span className="sr-only">{label}</span> : <span className="truncate">{label}</span>}
                      {tag && !collapsed && (
                        <span className="ml-auto rounded-full bg-[var(--brand-lavender)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--brand-indigo)]">{tag}</span>
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>

          {!collapsed && list && (
            <section aria-labelledby="sidebar-list" className="mt-6">
              <div className="flex items-center justify-between pl-3.5 pr-1">
                <h2 id="sidebar-list" className="text-[14px] text-[#6f7a73]">
                  {list.title}
                </h2>
                {list.searchTo && (
                  <Link to={list.searchTo} aria-label={list.searchLabel ?? 'Search'} className={cn('flex size-8 items-center justify-center rounded-lg text-[#6f7a73] hover:bg-black/[0.05]', focusRing)}>
                    <Search {...ICON} size={15} />
                  </Link>
                )}
              </div>
              {list.entries.length > 0 ? (
                <ul className="mt-1.5 flex flex-col">
                  {list.entries.map((e) =>
                    e.heading ? (
                      <li key={e.key} className="px-3.5 pb-1 pt-4 text-[11px] font-bold uppercase tracking-[0.14em] text-[#6f7a73]">{e.heading}</li>
                    ) : (
                      <li key={e.key}>
                        <NavLink
                          to={e.to}
                          data-kit-entry={e.to}
                          title={e.title ?? e.label}
                          className={({ isActive }) => cn('block truncate rounded-[10px] px-3.5 py-[7px] text-[15px] text-[#3d4a43] transition-colors hover:bg-black/[0.04]', focusRing, isActive && e.activeStyle !== false && list.highlightActive && 'bg-[var(--brand-lavender)]/70 font-semibold text-[var(--brand-ink)]')}
                        >
                          {e.label}
                        </NavLink>
                      </li>
                    ),
                  )}
                </ul>
              ) : (
                list.emptyText && <p className="px-3.5 pt-2 text-[13.5px] leading-5 text-[#6f7a73]">{list.emptyText}</p>
              )}
            </section>
          )}
        </nav>
        <div className="flex shrink-0 justify-center pb-3 pt-1" aria-hidden="true">
          <Mascot mood="encouraging" animation="wave" size={collapsed ? 40 : 88} />
        </div>
      </div>

      {footer ?? (
      <div className={cn('flex h-11 shrink-0 items-center', collapsed ? 'flex-col justify-center gap-1' : 'justify-between pl-2.5 pr-2')}>
        <Link to={settingsTo} title={collapsed ? 'Settings' : undefined} className={cn('flex h-9 items-center rounded-[10px] text-[15px] text-[#3d4a43] hover:bg-black/[0.04]', focusRing, collapsed ? 'w-9 justify-center' : 'gap-2.5 px-2')}>
          <SlidersHorizontal {...ICON} />
          {collapsed ? <span className="sr-only">Settings</span> : 'Settings'}
        </Link>
        {!collapsed && (
          <button type="button" onClick={onLogout} aria-label="Sign out" title="Sign out" className={cn('flex size-8 items-center justify-center rounded-lg text-[#6f7a73] hover:bg-danger/10 hover:text-danger', focusRing)}>
            <LogOut {...ICON} />
          </button>
        )}
      </div>
      )}
    </aside>
  );
}

export default SidebarShell;

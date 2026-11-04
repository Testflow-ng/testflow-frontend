import { cn } from '../../utils/cn.js';

/** A titled group of fields: title and help on the left, the fields on the right (stacked on phones). */
export function FormSection({ title, description, children, className }) {
  return (
    <section className={cn('grid gap-6 border-b border-border py-8 first:pt-0 last:border-0 md:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] md:gap-10', className)}>
      <div>
        <h2 className="font-heading text-lg font-bold text-foreground-strong">{title}</h2>
        {description && <p className="mt-1 text-sm leading-relaxed text-muted">{description}</p>}
      </div>
      <div className="flex max-w-[36rem] flex-col gap-5">{children}</div>
    </section>
  );
}

/**
 * Bottom bar for forms: shows when `dirty`, pinned to the bottom of the screen with Discard and Save.
 * `onSave` may be async; pass `saving` to show busy.
 */
export function StickyActionBar({ dirty = true, saving = false, onSave, onDiscard, saveLabel = 'Save changes', discardLabel = 'Discard', message = 'You have unsaved changes' }) {
  if (!dirty) return null;
  return (
    <div role="region" aria-label="Unsaved changes" className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[calc(0.75rem+var(--safe-bottom))] lg:pl-[var(--sidebar-w)]">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 rounded-full border border-border bg-surface py-2 pl-5 pr-2 shadow-[0_12px_40px_-12px_rgba(27,67,50,0.35)]">
        <p className="min-w-0 truncate text-sm font-medium text-foreground-strong">{message}</p>
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={onDiscard} disabled={saving} className="h-10 rounded-full px-4 text-sm font-semibold text-muted hover:bg-surface-strong hover:text-foreground-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50">
            {discardLabel}
          </button>
          <button type="button" onClick={onSave} disabled={saving} aria-busy={saving} className="h-10 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-60">
            {saving ? 'Saving…' : saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

import { cloneElement, isValidElement, useId } from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn.js';

/**
 * A form field rendered as a row on the sheet.
 *
 * Same accessibility contract as `Field` — it owns id generation and wires
 * `htmlFor`, `aria-describedby`, `aria-invalid` and `aria-required` onto its
 * child control — but the control is borderless and the row supplies the
 * boundary. Stack several inside `sheetClasses()` and they read as one ruled
 * form rather than a column of separate boxes.
 *
 * The label is always rendered. A placeholder is a hint, never a label: it
 * disappears the moment someone types, which is exactly when they are most
 * likely to have forgotten which field they are in.
 *
 * Focus is carried by the row via `focus-within`, so the affordance is the
 * full-width row a thumb actually lands on rather than a hairline.
 */
function SheetField({ label, hint, error, required, id, trailing, className, children }) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = (error ? errorId : hintId) || undefined;

  let control = children;
  if (isValidElement(children)) {
    control = cloneElement(children, {
      id: fieldId,
      variant: 'bare',
      'aria-invalid': error ? true : undefined,
      'aria-describedby': describedBy,
      'aria-required': required || undefined,
      required: required ?? children.props?.required,
    });
  }

  return (
    <div
      className={cn(
        'relative px-4 py-2.5 transition-colors duration-[var(--duration-sm)] ease-[var(--ease-out)]',
        'focus-within:bg-primary/[0.04]',
        error && 'bg-danger/[0.04]',
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <label
            htmlFor={fieldId}
            className={cn(
              'block font-mono text-[10px] font-bold uppercase tracking-[0.14em]',
              error ? 'text-danger' : 'text-muted',
            )}
          >
            {label}
            {required && (
              <span className="ml-0.5 text-danger" aria-hidden="true">
                *
              </span>
            )}
          </label>
          {control}
        </div>
        {trailing}
      </div>

      {error ? (
        <p id={errorId} className="mt-1 flex items-center gap-1.5 text-[13px] text-danger">
          <AlertCircle size={13} aria-hidden="true" className="shrink-0" />
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="mt-1 text-[13px] text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export default SheetField;

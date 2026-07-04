import { cloneElement, useId, Children, isValidElement } from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn.js';

/**
 * Label + hint/error wrapper for a single form control. Owns id generation and
 * wires `htmlFor`, `aria-describedby`, `aria-invalid`, and `aria-required` onto
 * its child control. Shows an error XOR a hint.
 */
function Field({ label, hint, error, required, id, className, children }) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = (error ? errorId : hintId) || undefined;

  // Defensive: ensure we only clone if children is a single valid element
  let control = children;
  if (isValidElement(children)) {
    control = cloneElement(children, {
      id: fieldId,
      'aria-invalid': error ? true : undefined,
      'aria-describedby': describedBy,
      'aria-required': required || undefined,
      required: required ?? children.props?.required,
    });
  }

  return (
    <div className={cn('flex flex-col', className)}>
      <label htmlFor={fieldId} className="mb-1.5 text-sm font-medium text-foreground-strong">
        {label}
        {required && (
          <span className="ml-0.5 text-danger" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {control}
      {error ? (
        <p id={errorId} className="mt-1.5 flex items-center gap-1 text-xs text-danger">
          <AlertCircle size={13} aria-hidden="true" className="shrink-0" />
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="mt-1.5 text-xs text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export default Field;

import { useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import './auth.css';

/** Labelled input in the landing style. Works with react-hook-form's register(). */
function AuthField({ label, error, hint, type = 'text', ref, ...props }) {
  const id = useId();
  const noteId = `${id}-note`;
  const [shown, setShown] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>
      <div className="auth-input-wrap">
        <input
          id={id}
          ref={ref}
          type={isPassword && shown ? 'text' : type}
          className="auth-input"
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error || hint ? noteId : undefined}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            className="auth-eye"
            onClick={() => setShown((v) => !v)}
            aria-label={shown ? 'Hide password' : 'Show password'}
            aria-pressed={shown}
          >
            {shown ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
          </button>
        )}
      </div>
      {error ? (
        <p id={noteId} className="auth-error" role="alert">
          {error}
        </p>
      ) : (
        hint && (
          <p id={noteId} className="auth-hint">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

export default AuthField;

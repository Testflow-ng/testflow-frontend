import { useId, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { WAITLIST_EMAIL, WAITLIST_URL, isValidEmail, joinWaitlist } from './waitlist.js';

function WaitlistForm() {
  const inputId = useId();
  const errorId = useId();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | saved | mailto

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!isValidEmail(email)) {
      setError('Enter a valid email address.');
      return;
    }
    setError('');
    setStatus('sending');
    try {
      setStatus(await joinWaitlist(email));
    } catch {
      setStatus('idle');
      setError('Something went wrong. Please try again in a moment.');
    }
  };

  if (status === 'saved') {
    return (
      <p className="wl-done" role="status">
        You’re on the list. We’ll email you when Testflow opens.
      </p>
    );
  }
  if (status === 'mailto') {
    return (
      <p className="wl-done" role="status">
        Your email app should have opened. Send the message to finish joining, or write to{' '}
        <a href={`mailto:${WAITLIST_EMAIL}`}>{WAITLIST_EMAIL}</a>.
      </p>
    );
  }

  return (
    <form className="wl-form" onSubmit={onSubmit} noValidate>
      <label htmlFor={inputId} className="sr-only">
        Email address
      </label>
      <div className="wl-row">
        <input
          id={inputId}
          className="wl-input"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : undefined}
        />
        <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>
          {status === 'sending' ? 'Joining…' : 'Join the waitlist'}
          <ArrowUpRight size={16} aria-hidden="true" />
        </button>
      </div>
      {error && (
        <p id={errorId} className="wl-error" role="alert">
          {error}
        </p>
      )}
      <p className="wl-note">
        {WAITLIST_URL
          ? 'We’ll only use your email to tell you when we launch.'
          : 'This opens your email app so you can send us your request.'}
      </p>
    </form>
  );
}

export default WaitlistForm;

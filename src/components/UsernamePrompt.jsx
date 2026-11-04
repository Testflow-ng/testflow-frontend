import { useState } from 'react';
import UsernameSetupModal from '../features/auth/components/UsernameSetupModal.jsx';
import { useAuth } from '../features/auth/useAuth.js';

const KEY = 'tf_username_prompt_dismissed';
const read = () => {
  try {
    return sessionStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
};

/** Shows the username popup to signed-in users who have none, until they set one or dismiss it for this visit. */
function UsernamePrompt() {
  const { user, isAuthenticated } = useAuth();
  const [dismissed, setDismissed] = useState(read);

  const close = () => {
    try {
      sessionStorage.setItem(KEY, '1');
    } catch {
      /* private mode: it just returns next load */
    }
    setDismissed(true);
    window.dispatchEvent(new Event('tf:username-prompt-closed'));
  };

  const open = Boolean(isAuthenticated && user && !user.username) && !dismissed;
  return <UsernameSetupModal open={open} onClose={close} onComplete={close} />;
}

export default UsernamePrompt;

import { useState } from 'react';
import { Banner, Button, Field, Input, Modal } from '../../../components/ui/index.js';
import { useAuth } from '../useAuth.js';
import { authApi } from '../api.js';

const USERNAME = /^[a-z0-9_]{3,20}$/;

/**
 * The only onboarding: pick a username. It is optional and can be dismissed ("Not now"); the same field
 * lives in Profile, so it can be set or changed later.
 */
function UsernameSetupModal({ open, onClose, onComplete }) {
  const { setUser } = useAuth();
  const [username, setUsername] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const value = username.trim().toLowerCase();
  const invalid = !USERNAME.test(value);

  const submit = async (e) => {
    e.preventDefault();
    if (invalid) return;
    setError(null);
    setLoading(true);
    try {
      const updated = await authApi.setUsername(value);
      setUser(updated);
      onComplete?.();
    } catch (err) {
      setError(err.message || 'Could not set that username. Try another.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={(next) => !next && !loading && onClose?.()}
      size="sm"
      title="Pick a username"
      description="This is how you appear in the Hall of Fame. You can change it later in your profile."
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>Not now</Button>
          <Button type="submit" form="username-setup" loading={loading} disabled={invalid}>Save username</Button>
        </>
      }
    >
      <form id="username-setup" onSubmit={submit} className="space-y-3 py-1">
        {error && <Banner variant="danger">{error}</Banner>}
        <Field label="Username" hint="3 to 20 letters, numbers or underscores.">
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value.replace(/\s/g, '_'))}
            placeholder="scholar_king"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            maxLength={20}
          />
        </Field>
      </form>
    </Modal>
  );
}

export default UsernameSetupModal;

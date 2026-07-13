import { useState } from 'react';
import { useAuth } from '../useAuth.js';
import { authApi } from '../api.js';
import { Modal, Button, Input, Alert } from '../../../components/ui/index.js';
import { Flame, Trophy, User as UserIcon } from 'lucide-react';

function UsernameSetupModal({ open, onComplete }) {
  const { user, setUser } = useAuth();
  const [username, setUsername] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const updatedUser = await authApi.setUsername(username);
      setUser(updatedUser);
      onComplete();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Something went wrong. Try another username.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={() => {}} // Prevent closing without setup
      title="Welcome to the New TestFlow!"
      description="Exams are coming up! We've added new features to help you prepare better."
    >
      <div className="space-y-6 pt-2">
        {/* Features Preview */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
            <Trophy className="w-5 h-5 text-amber-500 mb-2" />
            <p className="text-[11px] font-bold uppercase tracking-tight text-foreground-strong">Leaderboards</p>
            <p className="text-[10px] text-muted">Compete with others in your courses.</p>
          </div>
          <div className="p-3 rounded-xl bg-orange-500/5 border border-orange-500/10">
            <Flame className="w-5 h-5 text-orange-500 mb-2" />
            <p className="text-[11px] font-bold uppercase tracking-tight text-foreground-strong">Study Streaks</p>
            <p className="text-[10px] text-muted">Stay consistent and grow your fire.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground-strong">Pick a Unique Username</label>
            <p className="text-xs text-muted italic">This name will appear on the subject leaderboards.</p>
            <Input
              placeholder="e.g. Scholar_King"
              value={username}
              onChange={(e) => setUsername(e.target.value.replace(/\s/g, '_'))}
              leadingAdornment={<UserIcon size={16} />}
              autoFocus
              required
              minLength={3}
              maxLength={20}
            />
          </div>

          {error && <Alert variant="danger">{error}</Alert>}

          <Button type="submit" className="w-full h-12 text-base font-bold" loading={loading}>
            Save & Enter Dashboard
          </Button>
        </form>
      </div>
    </Modal>
  );
}

export default UsernameSetupModal;

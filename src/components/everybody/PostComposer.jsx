import { useState } from 'react';
import Textarea from '../ui/Textarea.jsx';
import Button from '../ui/Button.jsx';
import CharacterCounter from '../ui/CharacterCounter.jsx';
import SegmentedControl from '../ui/SegmentedControl.jsx';

/** Write a post. Plain text only. `canAnnounce` shows the announcement toggle (staff). `onSubmit({ type, text })` may be async. */
function PostComposer({ onSubmit, canAnnounce = false, max = 2000, placeholder = 'Share something with the community' }) {
  const [text, setText] = useState('');
  const [type, setType] = useState('discussion');
  const [busy, setBusy] = useState(false);
  const over = text.length > max;
  const send = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await onSubmit?.({ type, text: text.trim() });
      setText('');
    } finally {
      setBusy(false);
    }
  };
  return (
    <form onSubmit={send} className="space-y-3 rounded-[20px] border border-border bg-surface p-4">
      <Textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder={placeholder} aria-label="Write a post" aria-invalid={over || undefined} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {canAnnounce && <SegmentedControl size="sm" label="Post type" value={type} onValueChange={setType} options={[{ value: 'discussion', label: 'Discussion' }, { value: 'announcement', label: 'Announcement' }]} />}
          <CharacterCounter value={text} max={max} />
        </div>
        <Button type="submit" size="sm" disabled={!text.trim() || over || busy} aria-busy={busy}>Post</Button>
      </div>
    </form>
  );
}

export default PostComposer;

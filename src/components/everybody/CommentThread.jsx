import { useState } from 'react';
import { Send, Trash2 } from 'lucide-react';
import Avatar from '../ui/Avatar.jsx';
import Input from '../ui/Input.jsx';
import IconButton from '../ui/IconButton.jsx';

/** Comments under a post. `comments` = [{ id, author, time, text, canDelete }]. `onAdd(text)`, `onDelete(id)`. */
function CommentThread({ comments, onAdd, onDelete, max = 500 }) {
  const [text, setText] = useState('');
  const submit = (e) => {
    e.preventDefault();
    if (text.trim() && text.length <= max) (onAdd?.(text.trim()), setText(''));
  };
  return (
    <section aria-label="Comments" className="space-y-4">
      <ul className="space-y-3">
        {comments.map((c) => (
          <li key={c.id} className="flex items-start gap-3">
            <Avatar name={c.author} size="xs" />
            <div className="min-w-0 flex-1 rounded-2xl bg-surface-strong/60 px-3.5 py-2.5">
              <p className="text-sm font-semibold text-foreground-strong">{c.author} <span className="ml-1 text-xs font-normal text-muted">{c.time}</span></p>
              <p className="whitespace-pre-line text-[15px] leading-relaxed text-foreground-strong">{c.text}</p>
            </div>
            {c.canDelete && <IconButton size="sm" variant="ghost" aria-label={`Delete comment by ${c.author}`} onClick={() => onDelete?.(c.id)}><Trash2 size={15} /></IconButton>}
          </li>
        ))}
        {comments.length === 0 && <li className="text-sm text-muted">No comments yet. Be the first.</li>}
      </ul>
      <form onSubmit={submit} className="flex items-center gap-2">
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a comment" aria-label="Write a comment" maxLength={max} />
        <IconButton type="submit" variant="outline" aria-label="Send comment" disabled={!text.trim()}><Send size={17} /></IconButton>
      </form>
    </section>
  );
}

export default CommentThread;

import { MessageSquare, MoreHorizontal, Pin, Trash2, EyeOff } from 'lucide-react';
import Avatar from '../ui/Avatar.jsx';
import Badge from '../ui/Badge.jsx';
import DropdownMenu from '../ui/DropdownMenu.jsx';
import IconButton from '../ui/IconButton.jsx';
import { cn } from '../../utils/cn.js';

/**
 * A community post. `post` = { id, type: 'announcement'|'discussion', author, time, text, pinned, commentCount, hidden }.
 * Pass `moderation` ({ onPin, onHide, onDelete }) to show the staff menu. `onOpen` opens the comment thread.
 */
function PostCard({ post, moderation, onOpen, className }) {
  const items = moderation && [
    { label: post.pinned ? 'Unpin' : 'Pin to top', icon: Pin, onSelect: () => moderation.onPin?.(post) },
    { label: post.hidden ? 'Unhide' : 'Hide', icon: EyeOff, onSelect: () => moderation.onHide?.(post) },
    { separator: true },
    { label: 'Delete', icon: Trash2, danger: true, onSelect: () => moderation.onDelete?.(post) },
  ];
  return (
    <article className={cn('rounded-[20px] border bg-surface p-5', post.pinned ? 'border-primary/40 bg-[var(--brand-lavender)]/30' : 'border-border', post.hidden && 'opacity-60', className)}>
      <header className="flex items-start gap-3">
        <Avatar name={post.author} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold text-foreground-strong">
            {post.author}
            {post.type === 'announcement' && <Badge variant="lavender">Announcement</Badge>}
            {post.pinned && <Badge variant="lime"><Pin size={11} className="mr-1" aria-hidden="true" />Pinned</Badge>}
            {post.hidden && <Badge variant="outline">Hidden</Badge>}
          </p>
          <p className="text-xs text-muted">{post.time}</p>
        </div>
        {items && <DropdownMenu placement="bottom-end" items={items} trigger={(p) => <IconButton aria-label="Post actions" size="sm" variant="ghost" {...p}><MoreHorizontal size={18} /></IconButton>} />}
      </header>
      <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-foreground-strong">{post.text}</p>
      <footer className="mt-3">
        <button type="button" onClick={() => onOpen?.(post)} className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-muted hover:bg-surface-strong hover:text-foreground-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          <MessageSquare size={15} aria-hidden="true" />
          {post.commentCount ?? 0} {post.commentCount === 1 ? 'comment' : 'comments'}
        </button>
      </footer>
    </article>
  );
}

export default PostCard;

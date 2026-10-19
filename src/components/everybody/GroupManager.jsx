import { useState } from 'react';
import { Pencil, Plus, Trash2, Users } from 'lucide-react';
import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';
import MultiSelect from '../ui/MultiSelect.jsx';
import ConfirmDialog from '../ui/ConfirmDialog.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import { cn } from '../../utils/cn.js';

/**
 * Student groups. `groups` is [{ id, name, memberIds[] }]; `people` is [{ value, label }] of every student.
 * Callbacks: onCreate(name), onRename(id, name), onDelete(id), onMembersChange(id, memberIds).
 */
function GroupManager({ groups, people, onCreate, onRename, onDelete, onMembersChange }) {
  const [name, setName] = useState('');
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState('');
  const [deleting, setDeleting] = useState(null);
  const dup = groups.some((g) => g.name.toLowerCase() === name.trim().toLowerCase());
  const add = (e) => {
    e.preventDefault();
    if (name.trim() && !dup) (onCreate?.(name.trim()), setName(''));
  };
  return (
    <div className="space-y-5">
      <form onSubmit={add} className="flex flex-col gap-2 sm:flex-row">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="New group name, e.g. SS3 Science" aria-label="New group name" aria-invalid={dup || undefined} />
        <Button type="submit" disabled={!name.trim() || dup}><Plus size={16} aria-hidden="true" /> Add group</Button>
      </form>
      {dup && <p role="alert" className="-mt-3 text-xs text-danger">A group with that name already exists.</p>}
      {groups.length === 0 ? (
        <EmptyState icon={Users} title="No groups yet" description="Create a group, then add students to give them the same exams." />
      ) : (
        <ul className="space-y-3">
          {groups.map((g) => (
            <li key={g.id} className="rounded-[20px] border border-border bg-surface p-4">
              <div className="mb-3 flex items-center gap-2">
                {editing === g.id ? (
                  <form className="flex flex-1 gap-2" onSubmit={(e) => (e.preventDefault(), draft.trim() && (onRename?.(g.id, draft.trim()), setEditing(null)))}>
                    <Input value={draft} onChange={(e) => setDraft(e.target.value)} aria-label="Group name" autoFocus />
                    <Button type="submit" size="sm">Save</Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
                  </form>
                ) : (
                  <>
                    <h3 className="min-w-0 flex-1 truncate font-heading text-base font-bold text-foreground-strong">{g.name} <span className="ml-1 text-sm font-medium text-muted">{g.memberIds.length} {g.memberIds.length === 1 ? 'student' : 'students'}</span></h3>
                    <button type="button" onClick={() => (setEditing(g.id), setDraft(g.name))} aria-label={`Rename ${g.name}`} className={cn('flex size-9 items-center justify-center rounded-full text-muted hover:bg-surface-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary')}><Pencil size={16} aria-hidden="true" /></button>
                    <button type="button" onClick={() => setDeleting(g)} aria-label={`Delete ${g.name}`} className="flex size-9 items-center justify-center rounded-full text-muted hover:bg-danger/10 hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><Trash2 size={16} aria-hidden="true" /></button>
                  </>
                )}
              </div>
              <MultiSelect label="Students in this group" value={g.memberIds} onValueChange={(ids) => onMembersChange?.(g.id, ids)} options={people} placeholder="Add students" />
            </li>
          ))}
        </ul>
      )}
      <ConfirmDialog open={Boolean(deleting)} onOpenChange={(o) => !o && setDeleting(null)} tone="danger" title={deleting ? `Delete "${deleting.name}"?` : 'Delete group'} description="Students are not removed, only the group." confirmLabel="Delete" onConfirm={() => onDelete?.(deleting.id)} />
    </div>
  );
}

export default GroupManager;

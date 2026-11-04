import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileQuestion, Layers, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react';
import { Button, ConfirmDialog, DropdownMenu, EmptyState, Field, IconButton, Input, Modal, Reveal, SkeletonCard, Textarea, useToast } from '../../../components/ui/index.js';
import PlanLock from '../../../components/everybody/PlanLock.jsx';
import { usePlanFeatures } from '../usePlanFeatures.js';
import Screen, { PageHeader } from '../../../components/layout/Screen.jsx';
import { ICON } from '../../../components/ui/iconProps.js';
import { wsApi } from '../api.js';
import { useQuestionBanks, useWsMutation } from '../useWorkspace.js';

/** Question banks: folders of questions. Make one per subject or topic, then pick it when you build an exam. */
function BanksScreen() {
  const navigate = useNavigate();
  const toast = useToast();
  const { data, isLoading } = useQuestionBanks();
  const [editing, setEditing] = useState(null); // {} for new, bank to rename
  const [removing, setRemoving] = useState(null);
  const del = useWsMutation((id, bankId) => wsApi.deleteBank(id, bankId), { onSuccess: () => toast.success('Question bank deleted') });

  const { canBanks } = usePlanFeatures();
  return (
    <Screen width="full">
      <PageHeader title="Question banks" subtitle="Keep your questions in folders, then use a whole bank in any exam." action={<Button size="sm" onClick={() => setEditing({})} leadingIcon={<Plus size={15} />}>New question bank</Button>} />
      <PlanLock locked={!canBanks} plan="Pro" title="Question banks are part of Pro" description="Keep questions in folders and reuse a whole bank in any exam." className="mt-8">
      <div className="mt-8">
        {isLoading ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"><SkeletonCard className="h-36" /><SkeletonCard className="h-36" /></div> : !data?.length ? (
          <EmptyState icon={Layers} title="Make your first question bank" description="For example Mathematics or JAMB English. Put your questions in it, then pick it when you create an exam." action={<Button onClick={() => setEditing({})}>New question bank</Button>} />
        ) : (
          <Reveal>
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {data.map((b) => (
                <li key={b.id} className="relative">
                  <button type="button" onClick={() => navigate(`/workspace/banks/${b.id}`)} className="tf-pressable block h-full w-full rounded-[24px] border border-border bg-surface p-5 pr-14 text-left transition-colors hover:border-border-strong hover:bg-surface-strong/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                    <span className="flex size-11 items-center justify-center rounded-2xl bg-[var(--brand-lavender)] text-primary"><Layers {...ICON} size={20} /></span>
                    <h2 className="mt-4 font-heading text-lg font-bold leading-snug text-foreground-strong">{b.name}</h2>
                    {b.description && <p className="mt-1 line-clamp-2 text-sm text-muted">{b.description}</p>}
                    <p className="mt-4 flex items-center gap-1.5 text-sm text-muted"><FileQuestion {...ICON} size={15} />{b.questionCount ?? 0} {b.questionCount === 1 ? 'question' : 'questions'}</p>
                  </button>
                  <div className="absolute right-3 top-3">
                    <DropdownMenu placement="bottom-end" trigger={(p) => <IconButton aria-label={`Actions for ${b.name}`} size="sm" variant="ghost" {...p}><MoreHorizontal size={16} /></IconButton>}
                      items={[{ label: 'Rename', icon: Pencil, onSelect: () => setEditing(b) }, { separator: true }, { label: 'Delete', icon: Trash2, danger: true, onSelect: () => setRemoving(b) }]} />
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
        )}
      </div>
      {editing && <BankModal key={editing.id ?? 'new'} initial={editing} onClose={() => setEditing(null)} onCreated={(id) => navigate(`/workspace/banks/${id}`)} />}
      <ConfirmDialog open={Boolean(removing)} onOpenChange={(o) => !o && setRemoving(null)} tone="danger" title={`Delete "${removing?.name}"?`} description="The bank and its questions are deleted. Exams that already used them keep their own copy." confirmLabel="Delete bank" onConfirm={() => del.mutateAsync(removing.id)} />
      </PlanLock>
    </Screen>
  );
}

function BankModal({ initial, onClose, onCreated }) {
  const toast = useToast();
  const isEdit = Boolean(initial.id);
  const [name, setName] = useState(initial.name ?? '');
  const [description, setDescription] = useState(initial.description ?? '');
  const save = useWsMutation((id, body) => wsApi.saveBank(id, body), {
    onSuccess: (bank) => { toast.success(isEdit ? 'Saved' : 'Question bank created', isEdit ? undefined : 'Now add your questions.'); onClose(); if (!isEdit) onCreated(bank.id); },
    onError: (e) => toast.error('Could not save', e.message),
  });
  return (
    <Modal open onOpenChange={(o) => !o && onClose()} title={isEdit ? 'Rename question bank' : 'New question bank'} description="A bank is a folder of questions, like Mathematics or Physics."
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button loading={save.isPending} disabled={name.trim().length < 2} onClick={() => save.mutate({ ...(isEdit ? { id: initial.id } : {}), name: name.trim(), description: description.trim() })}>{isEdit ? 'Save' : 'Create bank'}</Button></>}>
      <div className="space-y-4 py-1">
        <Field label="Name"><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="JAMB Mathematics" maxLength={80} autoFocus /></Field>
        <Field label="What is it for?" hint="Optional"><Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={200} /></Field>
      </div>
    </Modal>
  );
}

export default BanksScreen;

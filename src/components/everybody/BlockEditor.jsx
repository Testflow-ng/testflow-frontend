import { Plus, Trash2 } from 'lucide-react';
import Field from '../ui/Field.jsx';
import Input from '../ui/Input.jsx';
import Textarea from '../ui/Textarea.jsx';
import Button from '../ui/Button.jsx';
import CharacterCounter from '../ui/CharacterCounter.jsx';
import { BLOCK_TYPES } from './blockTypes.js';

const set = (block, patch, onChange) => onChange({ ...block, ...patch });

function Repeater({ label, items, onChange, make, render, addLabel, max = 8 }) {
  return (
    <fieldset className="space-y-3">
      <legend className="mb-1 text-sm font-medium text-foreground-strong">{label}</legend>
      {items.map((it, i) => (
        <div key={i} className="space-y-3 rounded-2xl border border-border bg-surface-strong/40 p-3.5">
          {render(it, (patch) => onChange(items.map((x, j) => (j === i ? { ...x, ...patch } : x))))}
          <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="inline-flex items-center gap-1 text-sm font-semibold text-danger hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
            <Trash2 size={14} aria-hidden="true" /> Remove
          </button>
        </div>
      ))}
      {items.length < max && (
        <Button size="sm" variant="outline" onClick={() => onChange([...items, make()])}>
          <Plus size={15} aria-hidden="true" /> {addLabel}
        </Button>
      )}
    </fieldset>
  );
}

/**
 * Edit one block. Fields depend on `block.type` (hero, about, features, exams, announcements, faq, contact, cta).
 * Plain text only: the API rejects HTML. Controlled: `block` + `onChange(nextBlock)`.
 */
function BlockEditor({ block, onChange, className }) {
  if (!block) return <p className="text-sm text-muted">Select a section to edit it.</p>;
  const label = BLOCK_TYPES.find((b) => b.type === block.type)?.label ?? block.type;
  const on = (patch) => set(block, patch, onChange);
  const t = (key, lab, max, area) => (
    <Field label={lab}>
      {area ? <Textarea rows={4} value={block[key] ?? ''} onChange={(e) => on({ [key]: e.target.value })} maxLength={max} /> : <Input value={block[key] ?? ''} onChange={(e) => on({ [key]: e.target.value })} maxLength={max} />}
    </Field>
  );
  return (
    <div className={className}>
      <h3 className="mb-4 font-heading text-lg font-bold text-foreground-strong">Edit {label}</h3>
      <div className="space-y-5">
        {block.type === 'hero' && (
          <>
            {t('heading', 'Heading', 80)}
            {t('subheading', 'Sub-heading', 160, true)}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Button text"><Input value={block.cta?.label ?? ''} onChange={(e) => on({ cta: { ...block.cta, label: e.target.value } })} /></Field>
              <Field label="Button link" hint="https only"><Input value={block.cta?.url ?? ''} onChange={(e) => on({ cta: { ...block.cta, url: e.target.value } })} inputMode="url" /></Field>
            </div>
          </>
        )}
        {block.type === 'about' && (<>{t('title', 'Title', 60)}{t('text', 'Text', 1200, true)}<CharacterCounter value={block.text ?? ''} max={1200} /></>)}
        {(block.type === 'exams' || block.type === 'announcements' || block.type === 'faq' || block.type === 'features') && t('title', 'Section title', 60)}
        {block.type === 'features' && (
          <Repeater label="Features" items={block.items ?? []} onChange={(items) => on({ items })} make={() => ({ title: '', text: '' })} addLabel="Add feature" render={(it, up) => (<><Field label="Title"><Input value={it.title} onChange={(e) => up({ title: e.target.value })} /></Field><Field label="Text"><Textarea rows={2} value={it.text} onChange={(e) => up({ text: e.target.value })} /></Field></>)} />
        )}
        {block.type === 'faq' && (
          <Repeater label="Questions" items={block.items ?? []} onChange={(items) => on({ items })} make={() => ({ q: '', a: '' })} addLabel="Add question" render={(it, up) => (<><Field label="Question"><Input value={it.q} onChange={(e) => up({ q: e.target.value })} /></Field><Field label="Answer"><Textarea rows={2} value={it.a} onChange={(e) => up({ a: e.target.value })} /></Field></>)} />
        )}
        {block.type === 'contact' && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Email"><Input type="email" value={block.email ?? ''} onChange={(e) => on({ email: e.target.value })} /></Field>
            <Field label="Phone"><Input type="tel" value={block.phone ?? ''} onChange={(e) => on({ phone: e.target.value })} /></Field>
            <Field label="WhatsApp number"><Input type="tel" value={block.whatsapp ?? ''} onChange={(e) => on({ whatsapp: e.target.value })} /></Field>
            <Field label="Address"><Input value={block.address ?? ''} onChange={(e) => on({ address: e.target.value })} /></Field>
          </div>
        )}
        {block.type === 'cta' && (
          <>
            {t('heading', 'Heading', 80)}
            {t('text', 'Text', 160)}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Button text"><Input value={block.cta?.label ?? ''} onChange={(e) => on({ cta: { ...block.cta, label: e.target.value } })} /></Field>
              <Field label="Button link"><Input value={block.cta?.url ?? ''} onChange={(e) => on({ cta: { ...block.cta, url: e.target.value } })} inputMode="url" /></Field>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default BlockEditor;

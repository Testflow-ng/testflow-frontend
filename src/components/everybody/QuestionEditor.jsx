import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Field from '../ui/Field.jsx';
import Textarea from '../ui/Textarea.jsx';
import Input from '../ui/Input.jsx';
import Select from '../ui/Select.jsx';
import Button from '../ui/Button.jsx';
import MathText from '../MathText.jsx';
import { cn } from '../../utils/cn.js';
import { questionProblems } from './questionRules.js';
import ImageField from './ImageField.jsx';

const LETTERS = 'ABCDEF';

/**
 * Write one question: stem with a live LaTeX preview (`$x^2$` inline, `$$...$$` block), 2-6 options with one marked
 * correct, topic, difficulty and an explanation. Controlled: `value` = { stem, options[], correctIndex, topic,
 * difficulty, explanation, stemImageUrl?, optionImages?[] } and `onChange(next)`. Pass `upload(file) => url` to allow pictures
 * in the question and in each option.
 */
function QuestionEditor({ value, onChange, upload, className }) {
  const set = (patch) => onChange({ ...value, ...patch });
  const setOption = (i, text) => set({ options: value.options.map((o, j) => (j === i ? text : o)) });
  const remove = (i) => {
    const options = value.options.filter((_, j) => j !== i);
    set({ options, correctIndex: value.correctIndex === i ? 0 : value.correctIndex > i ? value.correctIndex - 1 : value.correctIndex });
  };
  const problems = questionProblems(value);
  return (
    <div className={cn('space-y-5', className)}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Field label="Question" hint="Use $...$ for maths, e.g. $x^2 - 5x + 6 = 0$"><Textarea rows={5} value={value.stem} onChange={(e) => set({ stem: e.target.value })} /></Field>
        <div>
          <p className="mb-1.5 text-sm font-medium text-foreground-strong">Preview</p>
          <div className="min-h-[7.5rem] rounded-[20px] border border-border bg-surface-strong/40 p-4 text-[1.05rem] leading-relaxed text-foreground-strong" aria-live="polite">
            {value.stem.trim() ? <MathText>{value.stem}</MathText> : <span className="text-muted">Your question appears here as students will see it.</span>}
          </div>
        </div>
      </div>

      {upload && <ImageField label="Picture for the question (optional)" value={value.stemImageUrl} onChange={(url) => set({ stemImageUrl: url })} upload={upload} />}

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-foreground-strong">Options (mark the correct one)</legend>
        <div className="space-y-2.5">
          {value.options.map((o, i) => (
            <div key={i} className="space-y-2">
            <div className="flex items-center gap-2.5">
              <label className="flex shrink-0 cursor-pointer items-center" title="Correct answer">
                <input type="radio" name="correct" checked={value.correctIndex === i} onChange={() => set({ correctIndex: i })} className="peer sr-only" aria-label={`Option ${LETTERS[i]} is correct`} />
                <span className={cn('flex size-9 items-center justify-center rounded-full border-2 text-sm font-bold peer-focus-visible:ring-4 peer-focus-visible:ring-primary/20', value.correctIndex === i ? 'border-success bg-success text-white' : 'border-border-strong text-muted')}>{LETTERS[i]}</span>
              </label>
              <Input value={o} onChange={(e) => setOption(i, e.target.value)} aria-label={`Option ${LETTERS[i]}`} placeholder={`Option ${LETTERS[i]}`} />
              {value.options.length > 2 && <button type="button" onClick={() => remove(i)} aria-label={`Remove option ${LETTERS[i]}`} className="flex size-10 shrink-0 items-center justify-center rounded-full text-muted hover:bg-danger/10 hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><Trash2 size={16} aria-hidden="true" /></button>}
            </div>
            {upload && <OptionPicture value={value.optionImages?.[i]} onChange={(url) => set({ optionImages: Object.assign([...(value.optionImages ?? [])], { [i]: url }) })} upload={upload} label={`Picture for option ${LETTERS[i]}`} />}
            </div>
          ))}
        </div>
        {value.options.length < 6 && <Button className="mt-3" size="sm" variant="outline" onClick={() => set({ options: [...value.options, ''] })}><Plus size={15} aria-hidden="true" /> Add option</Button>}
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Topic"><Input value={value.topic ?? ''} onChange={(e) => set({ topic: e.target.value })} /></Field>
        <Field label="Difficulty"><Select value={value.difficulty ?? 'medium'} onValueChange={(v) => set({ difficulty: v })} options={[{ value: 'easy', label: 'Easy' }, { value: 'medium', label: 'Medium' }, { value: 'hard', label: 'Hard' }]} /></Field>
      </div>
      <Field label="Explanation (shown in review)"><Textarea rows={3} value={value.explanation ?? ''} onChange={(e) => set({ explanation: e.target.value })} /></Field>

      {problems.length > 0 && (
        <ul role="status" className="space-y-1 rounded-2xl bg-warning/15 px-4 py-3 text-sm text-[#8a5a00]">{problems.map((p) => <li key={p}>{p}</li>)}</ul>
      )}
    </div>
  );
}

/** A picture for one option, folded away until it is wanted. */
function OptionPicture({ value, onChange, upload, label }) {
  const [open, setOpen] = useState(Boolean(value));
  if (!open) return <button type="button" onClick={() => setOpen(true)} className="ml-[2.9rem] text-sm font-semibold text-primary hover:underline">Add a picture</button>;
  return <div className="ml-[2.9rem]"><ImageField label={label} value={value} onChange={onChange} upload={upload} /></div>;
}

export default QuestionEditor;

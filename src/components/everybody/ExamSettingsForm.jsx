import Field from '../ui/Field.jsx';
import Input from '../ui/Input.jsx';
import Textarea from '../ui/Textarea.jsx';
import Select from '../ui/Select.jsx';
import Switch from '../ui/Switch.jsx';
import SegmentedControl from '../ui/SegmentedControl.jsx';
import { DateRangePicker } from '../ui/DatePicker.jsx';
import { FormSection } from '../ui/FormSection.jsx';

/**
 * All the settings of an exam in grouped sections. `value` = { title, instructions, durationMinutes, window: {start,end},
 * access: 'enrolled'|'assigned'|'code', accessCode, attemptsAllowed, shuffleQuestions, shuffleOptions, marksPerQuestion,
 * negativeMarking, resultsVisibility }. Controlled via `onChange(next)`. `errors` is { field: message }.
 */
function ExamSettingsForm({ value, onChange, errors = {} }) {
  const set = (patch) => onChange({ ...value, ...patch });
  const num = (key) => (e) => set({ [key]: e.target.value === '' ? '' : Number(e.target.value) });
  return (
    <div>
      <FormSection title="Basics" description="What students see before they start.">
        <Field label="Title" error={errors.title} required><Input value={value.title} onChange={(e) => set({ title: e.target.value })} /></Field>
        <Field label="Instructions"><Textarea rows={4} value={value.instructions} onChange={(e) => set({ instructions: e.target.value })} /></Field>
      </FormSection>

      <FormSection title="Timing" description="How long it runs and when it is open.">
        <Field label="Duration (minutes)" error={errors.durationMinutes} required><Input type="number" inputMode="numeric" min={1} value={value.durationMinutes} onChange={num('durationMinutes')} /></Field>
        <DateRangePicker label="Open between" value={value.window ?? {}} onChange={(w) => set({ window: w })} placeholder="Always open" />
      </FormSection>

      <FormSection title="Who can take it" description="Enrolled students, assigned students, or anyone with a code.">
        <SegmentedControl label="Access" value={value.access} onValueChange={(v) => set({ access: v })} options={[{ value: 'enrolled', label: 'Enrolled' }, { value: 'assigned', label: 'Assigned' }, { value: 'code', label: 'Code' }]} />
        {value.access === 'code' && <Field label="Access code" hint="Share it with students. Stored securely, shown once." error={errors.accessCode}><Input value={value.accessCode ?? ''} onChange={(e) => set({ accessCode: e.target.value })} autoComplete="off" /></Field>}
        <Field label="Attempts allowed"><Input type="number" inputMode="numeric" min={1} value={value.attemptsAllowed} onChange={num('attemptsAllowed')} /></Field>
      </FormSection>

      <FormSection title="Marking and results">
        <Field label="Marks per question"><Input type="number" inputMode="decimal" min={0} step="0.5" value={value.marksPerQuestion} onChange={num('marksPerQuestion')} /></Field>
        <Field label="Negative marking" hint="Marks taken off for a wrong answer. 0 turns it off."><Input type="number" inputMode="decimal" min={0} step="0.25" value={value.negativeMarking} onChange={num('negativeMarking')} /></Field>
        <Switch label="Shuffle questions" checked={value.shuffleQuestions} onCheckedChange={(v) => set({ shuffleQuestions: v })} id="shuffle-q" />
        <Switch label="Shuffle options" checked={value.shuffleOptions} onCheckedChange={(v) => set({ shuffleOptions: v })} id="shuffle-o" />
        <Field label="Show results"><Select value={value.resultsVisibility} onValueChange={(v) => set({ resultsVisibility: v })} options={[{ value: 'immediate', label: 'Immediately after submitting' }, { value: 'after_window', label: 'After the exam closes' }, { value: 'manual', label: 'When I release them' }]} /></Field>
      </FormSection>
    </div>
  );
}

export default ExamSettingsForm;

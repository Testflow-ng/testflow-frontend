import { useState } from 'react';
import {
  Button, CharacterCounter, Checkbox, DatePicker, DateRangePicker, Field, FileUpload, FormSection, Input, MultiSelect, PasswordInput, Radio, SearchField,
  SegmentedControl, Select, Slider, Switch, TagInput, Textarea,
} from '../../../components/ui/index.js';


import { W } from './helpers.jsx';

export default [
  {
    id: 'input', name: 'Input, password and search', category: 'Forms', source: ['ui/Input.jsx', 'ui/PasswordInput.jsx', 'ui/SearchField.jsx', 'ui/Field.jsx'],
    description: 'Text fields wrapped in Field for label, hint and error. Pill shaped.',
    keywords: ['text', 'email', 'password', 'search', 'field', 'error', 'form'],
    Preview: function Demo() {
      const [q, setQ] = useState('');
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email" hint="We never share it."><Input placeholder="you@example.com" /></Field>
          <Field label="Password"><PasswordInput placeholder="Your password" /></Field>
          <Field label="With an error" error="Enter a valid email"><Input defaultValue="nope" /></Field>
          <SearchField value={q} onChange={(e) => setQ(e.target.value)} onClear={() => setQ('')} placeholder="Search courses" />
        </div>
      );
    },
    usage: `import { Field, Input, PasswordInput, SearchField } from '../components/ui/index.js';

<Field label="Email" hint="We never share it." error={errors.email}>
  <Input type="email" placeholder="you@example.com" />
</Field>
<Field label="Password"><PasswordInput autoComplete="current-password" /></Field>
<SearchField value={q} onChange={(e) => setQ(e.target.value)} onClear={() => setQ('')} />`,
  },
  {
    id: 'select', name: 'Select', category: 'Forms', source: 'ui/Select.jsx',
    description: 'A custom listbox, not the browser picker. Accepts options or option children.',
    keywords: ['dropdown', 'picker', 'choose', 'listbox', 'combobox'],
    Preview: function Demo() {
      const [v, setV] = useState('100');
      return (
        <W>
          <Field label="Level"><Select value={v} onValueChange={setV} options={[{ value: '100', label: '100 level' }, { value: '200', label: '200 level' }, { value: '300', label: '300 level' }, { value: '500', label: '500 level (soon)', disabled: true }]} /></Field>
        </W>
      );
    },
    usage: `import { Field, Select } from '../components/ui/index.js';

<Field label="Level">
  <Select
    value={level}
    onValueChange={setLevel}
    options={[{ value: '100', label: '100 level' }, { value: '200', label: '200 level' }]}
    placeholder="Pick a level"
  />
</Field>`,
  },
  {
    id: 'textarea', name: 'Textarea and counter', category: 'Forms', source: ['ui/Textarea.jsx', 'ui/CharacterCounter.jsx'],
    description: 'Multi-line input with an optional character or word counter.',
    keywords: ['multiline', 'description', 'limit', 'words', 'characters'],
    Preview: function Demo() {
      const [v, setV] = useState('Fresh stock, student prices.');
      return (
        <W w={360}>
          <Field label="Description"><Textarea rows={3} value={v} onChange={(e) => setV(e.target.value)} /></Field>
          <div className="mt-1.5"><CharacterCounter value={v} max={12} unit="words" /></div>
        </W>
      );
    },
    usage: `import { Field, Textarea, CharacterCounter } from '../components/ui/index.js';

<Field label="Description"><Textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} /></Field>
<CharacterCounter value={text} max={200} />            {/* characters */}
<CharacterCounter value={text} max={12} unit="words" />`,
  },
  {
    id: 'choices', name: 'Checkbox, radio, switch and segmented', category: 'Forms', source: ['ui/Checkbox.jsx', 'ui/Radio.jsx', 'ui/Switch.jsx', 'ui/SegmentedControl.jsx'],
    description: 'Choice controls. Switch is controlled; SegmentedControl suits 2 to 6 options.',
    keywords: ['toggle', 'option', 'boolean', 'on off', 'radio', 'tick'],
    Preview: function Demo() {
      const [on, setOn] = useState(true);
      const [seg, setSeg] = useState('20');
      const [c, setC] = useState(true);
      return (
        <div className="flex flex-wrap items-start gap-6">
          <Checkbox label="Remember me" hint="On this device" checked={c} onChange={(e) => setC(e.target.checked)} />
          <fieldset className="grid gap-2.5"><legend className="sr-only">Plan</legend><Radio name="plan" label="Pro" defaultChecked /><Radio name="plan" label="Studio" /></fieldset>
          <Switch checked={on} onCheckedChange={setOn} label="Email reminders" />
          <SegmentedControl label="Questions" value={seg} onValueChange={setSeg} options={[{ value: '10', label: '10' }, { value: '20', label: '20' }, { value: '40', label: '40' }]} />
        </div>
      );
    },
    usage: `import { Checkbox, Radio, Switch, SegmentedControl } from '../components/ui/index.js';

<Checkbox label="Remember me" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
<Radio name="plan" label="Pro" defaultChecked />
<Switch checked={on} onCheckedChange={setOn} label="Email reminders" />
<SegmentedControl
  label="Questions"
  value={value}
  onValueChange={setValue}
  options={[{ value: '10', label: '10' }, { value: '20', label: '20' }]}
/>`,
  },
  {
    id: 'slider', name: 'Slider', category: 'Forms', source: 'ui/Slider.jsx',
    description: 'Range input with a live readout and an optional formatter.',
    keywords: ['range', 'duration', 'amount', 'days'],
    Preview: function Demo() {
      const [d, setD] = useState(7);
      return <W w={340}><Slider label="Campaign length" min={1} max={30} value={d} onValueChange={setD} format={(v) => `${v} ${v === 1 ? 'day' : 'days'}`} /></W>;
    },
    usage: `import { Slider } from '../components/ui/index.js';

<Slider label="Campaign length" min={1} max={30} value={days} onValueChange={setDays}
  format={(v) => \`\${v} \${v === 1 ? 'day' : 'days'}\`} />`,
  },
  {
    id: 'tags', name: 'Tag input and multi-select', category: 'Forms', source: ['ui/TagInput.jsx', 'ui/MultiSelect.jsx'],
    description: 'Type-and-enter tags with a limit, and a searchable multi-select.',
    keywords: ['keywords', 'chips', 'assign', 'groups', 'multiple'],
    Preview: function Demo() {
      const [tags, setTags] = useState(['laptops', 'oau']);
      const [group, setGroup] = useState(['a']);
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <TagInput label="Keywords (max 3)" max={3} value={tags} onChange={setTags} />
          <MultiSelect label="Assign to groups" value={group} onValueChange={setGroup} options={[{ value: 'a', label: 'SS3 Science' }, { value: 'b', label: 'SS3 Arts' }, { value: 'c', label: 'JAMB 2026' }]} />
        </div>
      );
    },
    usage: `import { TagInput, MultiSelect } from '../components/ui/index.js';

<TagInput label="Keywords (max 3)" max={3} value={tags} onChange={setTags} />
<MultiSelect label="Groups" value={ids} onValueChange={setIds}
  options={[{ value: 'a', label: 'SS3 Science' }]} />`,
  },
  {
    id: 'dates', name: 'Date pickers', category: 'Forms', source: ['ui/DatePicker.jsx', 'ui/Calendar.jsx'],
    description: 'Custom calendar for a single date or a range.',
    keywords: ['calendar', 'date', 'range', 'schedule'],
    Preview: function Demo() {
      const [date, setDate] = useState('');
      const [range, setRange] = useState({});
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <DatePicker label="Start date" value={date} onChange={setDate} min="2026-01-01" />
          <DateRangePicker label="Analytics range" value={range} onChange={setRange} />
        </div>
      );
    },
    usage: `import { DatePicker, DateRangePicker } from '../components/ui/index.js';

<DatePicker label="Start date" value={date} onChange={setDate} min="2026-01-01" />
<DateRangePicker label="Range" value={range} onChange={setRange} />   {/* { from, to } */}`,
  },
  {
    id: 'upload', name: 'File upload', category: 'Forms', source: 'ui/FileUpload.jsx',
    description: 'Drop zone with type and size checks, preview and progress.',
    keywords: ['image', 'upload', 'drop', 'attachment', 'file'],
    Preview: function Demo() {
      const [file, setFile] = useState(null);
      return (
        <W w={380}>
          <FileUpload label="Ad image" accept="image/png,image/jpeg,image/webp" hint="JPEG, PNG or WebP, up to 2 MB" previewUrl={file?.url} fileName={file?.name} progress={file ? 100 : undefined} onFile={(f) => setFile({ name: f.name, url: URL.createObjectURL(f) })} onRemove={() => setFile(null)} />
        </W>
      );
    },
    usage: `import { FileUpload } from '../components/ui/index.js';

<FileUpload
  label="Ad image"
  accept="image/png,image/jpeg,image/webp"
  hint="JPEG, PNG or WebP, up to 2 MB"
  previewUrl={file?.url}
  fileName={file?.name}
  onFile={(f) => setFile({ name: f.name, url: URL.createObjectURL(f) })}
  onRemove={() => setFile(null)}
/>`,
  },
  {
    id: 'form-section', name: 'Form section and save bar', category: 'Forms', source: 'ui/FormSection.jsx',
    description: 'Group related fields, and show a sticky save bar when something changed.',
    keywords: ['settings', 'unsaved', 'dirty', 'save', 'discard', 'section'],
    Preview: function Demo() {
      const [dirty, setDirty] = useState(false);
      return (
        <FormSection title="Domain" description="Point your own domain at your site.">
          <Field label="Hostname"><Input defaultValue="exams.advance.ng" onChange={() => setDirty(true)} /></Field>
          <Button size="sm" variant="outline" onClick={() => setDirty(true)}>Edit something</Button>
          {dirty && <p className="text-sm text-muted">The save bar appears at the bottom of the screen.</p>}
        </FormSection>
      );
    },
    usage: `import { FormSection, StickyActionBar } from '../components/ui/index.js';

<FormSection title="Domain" description="Point your own domain at your site.">
  {/* fields */}
</FormSection>
<StickyActionBar dirty={dirty} onDiscard={reset} onSave={save} />`,
  },
];

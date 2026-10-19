import { Field, Input, Select, Slider, Switch } from '../../components/ui/index.js';

/** Props playground: turns an entry's `controls` into real inputs. Values flow into the preview and the usage snippet. */
function Controls({ controls, values, onChange }) {
  return (
    <div className="grid gap-4 rounded-[18px] border border-border bg-surface-strong/50 p-4 sm:grid-cols-2" role="group" aria-label="Try the props">
      {controls.map((c) => {
        const set = (v) => onChange({ ...values, [c.key]: v });
        if (c.type === 'switch') return <Switch key={c.key} label={c.label} checked={Boolean(values[c.key])} onCheckedChange={set} className="self-end" />;
        if (c.type === 'range') return <Slider key={c.key} label={c.label} min={c.min ?? 0} max={c.max ?? 100} step={c.step ?? 1} value={values[c.key]} onValueChange={set} />;
        if (c.type === 'text') return <Field key={c.key} label={c.label}><Input value={values[c.key]} onChange={(e) => set(e.target.value)} /></Field>;
        return <Field key={c.key} label={c.label}><Select value={values[c.key]} onValueChange={set} options={c.options.map((o) => ({ value: o, label: o }))} /></Field>;
      })}
    </div>
  );
}

export default Controls;

import { useState } from 'react';
import { Download } from 'lucide-react';
import { Alert, Banner, Button, FileUpload, Modal, useToast } from '../../components/ui/index.js';
import QuestionEditor from '../../components/everybody/QuestionEditor.jsx';
import { questionProblems, validateQuestionRow } from '../../components/everybody/questionRules.js';
import { wsApi } from './api.js';
import { CSV_TEMPLATE, PICTURE_CSV_TEMPLATE, picturesNeeded, questionsFromCsv } from './csv.js';
import { useWsMutation } from './useWorkspace.js';

/** Write or edit one question. Pass `examId` or `bankId` to put a new question straight into that exam or question bank. */
export function QuestionModal({ initial, onClose, orgId, examId, bankId }) {
  const toast = useToast();
  const [q, setQ] = useState(initial);
  const save = useWsMutation((id, body) => wsApi.saveQuestion(id, body), { onSuccess: () => { toast.success('Question saved'); onClose(); }, onError: (e) => toast.error('Could not save', e.message) });
  const problems = questionProblems(q);
  const upload = (file) => wsApi.uploadQuestionImage(orgId, file);
  return (
    <Modal open onOpenChange={(o) => !o && onClose()} size="lg" title={initial.id ? 'Edit question' : 'New question'} description="Maths works with $...$. Add a picture to the question or to any option."
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button loading={save.isPending} disabled={problems.length > 0} onClick={() => save.mutate({ ...q, options: q.options.map((o) => o.trim()), ...(examId ? { examId } : {}), ...(bankId ? { bankId } : {}) })}>Save question</Button></>}>
      <div className="py-1"><QuestionEditor value={q} onChange={setQ} upload={upload} /></div>
    </Modal>
  );
}

const MAX_PICTURE_BYTES = 1024 * 1024;
const MAX_PICTURES = 60;
const downloadText = (text, name) => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'text/csv' })); a.download = name; a.click(); };

/**
 * Import questions into an exam or a question bank from a CSV or JSON file. A CSV that names pictures
 * (stemImage / optionImages columns) asks for those pictures next: pick them all at once, they are matched by
 * file name, and each must be 1 MB or less.
 */
export function ImportModal({ open, onOpenChange, examId, bankId }) {
  const toast = useToast();
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const [sheet, setSheet] = useState(null);
  const [needed, setNeeded] = useState(null);
  const [pics, setPics] = useState([]);
  const [problems, setProblems] = useState([]);
  const reset = () => { setRows(null); setFileName(''); setSheet(null); setNeeded(null); setPics([]); setProblems([]); setError(''); };
  const done = (r) => { toast.success('Questions imported', `${r?.imported ?? rows?.length ?? 0} added.`); reset(); onOpenChange(false); };
  const bulk = useWsMutation((id, list) => wsApi.bulkQuestions(id, list, { examId, bankId }), { onSuccess: done, onError: (e) => setError(e.message || 'Import failed.') });
  // Check everything first (nothing is saved); only a clean check goes on to the real import.
  const withPics = useWsMutation(async (id, vars) => {
    const dry = await wsApi.importWithImages(id, { ...vars, dryRun: true });
    if (dry.failed?.length) return { stopped: dry.failed };
    return wsApi.importWithImages(id, vars);
  }, { onSuccess: (r) => (r.stopped ? setProblems(r.stopped) : done(r)), onError: (e) => setError(e.message || 'Import failed.') });

  const read = async (file) => {
    setError('');
    setProblems([]);
    try {
      const text = await file.text();
      const isJson = file.name.toLowerCase().endsWith('.json');
      const wanted = isJson ? null : picturesNeeded(text);
      if (wanted) {
        setRows(null); setSheet(file); setNeeded(wanted); setFileName(file.name);
        return;
      }
      setSheet(null); setNeeded(null);
      const list = isJson ? JSON.parse(text) : questionsFromCsv(text);
      if (!Array.isArray(list) || list.length === 0) throw new Error('No questions found in that file.');
      if (list.length > 500) throw new Error(`Too many rows (${list.length}). The limit is 500 at a time.`);
      setFileName(file.name);
      setRows(list.map((r, i) => ({ n: i + 1, data: r, problems: validateQuestionRow(r) })));
    } catch (e) {
      reset();
      setError(e instanceof SyntaxError ? 'That JSON file is not valid.' : e.message);
    }
  };
  const addPics = (files) => {
    setProblems([]);
    setPics((current) => {
      const byName = new Map(current.map((f) => [f.name, f]));
      files.forEach((f) => byName.set(f.name, f));
      return [...byName.values()].slice(0, MAX_PICTURES);
    });
  };

  const bad = rows?.filter((r) => r.problems.length) ?? [];
  const have = new Set(pics.map((f) => f.name));
  const missing = (needed ?? []).filter((n) => !have.has(n));
  const unused = needed ? pics.filter((f) => !needed.includes(f.name)) : [];
  const picturesMode = Boolean(sheet);
  const canImport = picturesMode ? pics.length > 0 && missing.length === 0 : Boolean(rows) && bad.length === 0;
  const submit = () => (picturesMode ? withPics.mutate({ csv: sheet, images: pics, examId, bankId }) : bulk.mutate(rows.map((r) => r.data)));

  return (
    <Modal open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }} size="lg" title="Import questions" description="A CSV or JSON file. Every row is checked before anything is added."
      footer={<><Button variant="ghost" onClick={() => { reset(); onOpenChange(false); }}>Cancel</Button><Button loading={bulk.isPending || withPics.isPending} disabled={!canImport} onClick={submit}>Import {picturesMode ? '' : rows?.length ?? ''}</Button></>}>
      <div className="space-y-4 py-1">
        {error && <Banner variant="danger">{error}</Banner>}
        <FileUpload label="1. Choose your sheet" accept="text/csv,application/json,.csv,.json" maxBytes={5 * 1024 * 1024} hint="CSV or JSON, up to 500 questions" fileName={fileName || undefined} onFile={read} onRemove={reset} />
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" size="sm" onClick={() => downloadText(CSV_TEMPLATE, 'questions-template.csv')} leadingIcon={<Download size={14} />}>CSV template</Button>
          <Button variant="ghost" size="sm" onClick={() => downloadText(PICTURE_CSV_TEMPLATE, 'questions-with-pictures-template.csv')} leadingIcon={<Download size={14} />}>Template with pictures</Button>
        </div>

        {picturesMode && (
          <div className="space-y-3">
            <FileUpload multiple label={`2. Choose the pictures (${needed.length} named in your sheet)`} accept="image/png,image/jpeg,image/webp" maxBytes={MAX_PICTURE_BYTES} hint={`PNG, JPEG or WebP, each 1 MB or less, up to ${MAX_PICTURES}`} onFiles={addPics} />
            {pics.length > 0 && (missing.length === 0
              ? <Alert variant="success">All {needed.length} pictures found{unused.length ? `. ${unused.length} not used by the sheet: ${unused.slice(0, 3).map((f) => f.name).join(', ')}${unused.length > 3 ? '…' : ''}` : '.'}</Alert>
              : <Alert variant="danger"><p className="font-semibold">{missing.length} picture{missing.length === 1 ? '' : 's'} still missing:</p><p className="mt-1 break-words">{missing.slice(0, 8).join(', ')}{missing.length > 8 ? '…' : ''}</p></Alert>)}
            {problems.length > 0 && (
              <Alert variant="danger"><p className="font-semibold">{problems.length} rows need fixing. Nothing was added.</p><ul className="mt-1 list-disc pl-5">{problems.slice(0, 6).map((r) => <li key={r.row}>Row {r.row}: {r.problems.join(', ')}</li>)}</ul></Alert>
            )}
          </div>
        )}

        {rows && (bad.length === 0 ? <Alert variant="success">{rows.length} questions look good.</Alert> : (
          <Alert variant="danger"><p className="font-semibold">{bad.length} rows need fixing:</p><ul className="mt-1 list-disc pl-5">{bad.slice(0, 6).map((r) => <li key={r.n}>Row {r.n}: {r.problems.join(', ')}</li>)}</ul></Alert>
        ))}
      </div>
    </Modal>
  );
}

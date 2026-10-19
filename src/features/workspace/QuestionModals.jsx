import { useState } from 'react';
import { Download } from 'lucide-react';
import { Alert, Banner, Button, FileUpload, Modal, useToast } from '../../components/ui/index.js';
import QuestionEditor from '../../components/everybody/QuestionEditor.jsx';
import { questionProblems, validateQuestionRow } from '../../components/everybody/questionRules.js';
import { wsApi } from './api.js';
import { CSV_TEMPLATE, questionsFromCsv } from './csv.js';
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

/** Import a CSV or JSON file of questions into an exam or a question bank. */
export function ImportModal({ open, onOpenChange, examId, bankId }) {
  const toast = useToast();
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const bulk = useWsMutation((id, list) => wsApi.bulkQuestions(id, list, { examId, bankId }), { onSuccess: (r) => { toast.success('Questions imported', `${r?.imported ?? rows.length} added.`); setRows(null); setFileName(''); onOpenChange(false); }, onError: (e) => setError(e.message || 'Import failed.') });

  const read = async (file) => {
    setError('');
    try {
      const text = await file.text();
      const list = file.name.toLowerCase().endsWith('.json') ? JSON.parse(text) : questionsFromCsv(text);
      if (!Array.isArray(list) || list.length === 0) throw new Error('No questions found in that file.');
      if (list.length > 500) throw new Error(`Too many rows (${list.length}). The limit is 500 at a time.`);
      setFileName(file.name);
      setRows(list.map((r, i) => ({ n: i + 1, data: r, problems: validateQuestionRow(r) })));
    } catch (e) {
      setRows(null);
      setError(e instanceof SyntaxError ? 'That JSON file is not valid.' : e.message);
    }
  };
  const bad = rows?.filter((r) => r.problems.length) ?? [];
  const download = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([CSV_TEMPLATE], { type: 'text/csv' })); a.download = 'questions-template.csv'; a.click(); };

  return (
    <Modal open={open} onOpenChange={onOpenChange} size="lg" title="Import questions" description="A CSV or JSON file. Every row is checked before anything is added."
      footer={<><Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button><Button loading={bulk.isPending} disabled={!rows || bad.length > 0} onClick={() => bulk.mutate(rows.map((r) => r.data))}>Import {rows?.length ?? ''}</Button></>}>
      <div className="space-y-4 py-1">
        {error && <Banner variant="danger">{error}</Banner>}
        <FileUpload label="Choose a file" accept="text/csv,application/json,.csv,.json" maxBytes={5 * 1024 * 1024} hint="CSV or JSON, up to 500 questions" fileName={fileName || undefined} onFile={read} onRemove={() => { setRows(null); setFileName(''); }} />
        <Button variant="ghost" size="sm" onClick={download} leadingIcon={<Download size={14} />}>Download the CSV template</Button>
        {rows && (bad.length === 0 ? <Alert variant="success">{rows.length} questions look good.</Alert> : (
          <Alert variant="danger"><p className="font-semibold">{bad.length} rows need fixing:</p><ul className="mt-1 list-disc pl-5">{bad.slice(0, 6).map((r) => <li key={r.n}>Row {r.n}: {r.problems.join(', ')}</li>)}</ul></Alert>
        ))}
      </div>
    </Modal>
  );
}


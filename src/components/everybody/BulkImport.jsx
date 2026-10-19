import { useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import FileUpload from '../ui/FileUpload.jsx';
import Button from '../ui/Button.jsx';
import Alert from '../ui/Alert.jsx';
import { cn } from '../../utils/cn.js';
import { validateQuestionRow } from './questionRules.js';

/**
 * Reusable bulk importer: choose a JSON file (an array), see every row validated, import only if all rows pass.
 * `validateRow(row) => string[]`, `columns` = [{ key, header }] for the preview, `onImport(rows)` may be async.
 * `maxRows` defaults to 500 (the API limit).
 */
function BulkImport({ validateRow = validateQuestionRow, columns = [{ key: 'stem', header: 'Question' }], maxRows = 500, onImport, label = 'Import file (JSON)' }) {
  const [rows, setRows] = useState(null);
  const [fileError, setFileError] = useState('');
  const [busy, setBusy] = useState(false);

  const read = async (file) => {
    setFileError('');
    try {
      const data = JSON.parse(await file.text());
      if (!Array.isArray(data)) throw new Error('The file must contain a list.');
      if (data.length === 0) throw new Error('The file is empty.');
      if (data.length > maxRows) throw new Error(`Too many rows (${data.length}). Maximum is ${maxRows} at a time.`);
      setRows(data.map((r, i) => ({ n: i + 1, data: r, problems: validateRow(r) })));
    } catch (e) {
      setRows(null);
      setFileError(e instanceof SyntaxError ? 'That is not valid JSON.' : e.message);
    }
  };

  const bad = rows?.filter((r) => r.problems.length) ?? [];
  const run = async () => {
    setBusy(true);
    try {
      await onImport?.(rows.map((r) => r.data));
      setRows(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <FileUpload label={label} accept="application/json,.json" maxBytes={2 * 1024 * 1024} hint="A JSON list, up to 500 rows" error={fileError} onFile={read} />
      {rows && (
        <>
          {bad.length > 0 ? <Alert variant="danger">{bad.length} of {rows.length} rows need fixing. Fix the file and choose it again.</Alert> : <Alert variant="success">All {rows.length} rows look good.</Alert>}
          <div className="max-h-72 overflow-auto rounded-[20px] border border-border bg-surface">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Import preview</caption>
              <thead><tr className="border-b border-border text-xs uppercase tracking-wide text-muted"><th className="px-3 py-2">#</th>{columns.map((c) => <th key={c.key} className="px-3 py-2">{c.header}</th>)}<th className="px-3 py-2">Check</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.n} className={cn('border-b border-border/70 last:border-0', r.problems.length && 'bg-danger/5')}>
                    <td className="px-3 py-2 tabular-nums text-muted">{r.n}</td>
                    {columns.map((c) => <td key={c.key} className="max-w-[18rem] truncate px-3 py-2">{String(r.data[c.key] ?? '')}</td>)}
                    <td className="px-3 py-2">{r.problems.length ? <span className="flex items-start gap-1.5 text-score-low"><XCircle size={15} className="mt-0.5 shrink-0" aria-hidden="true" />{r.problems.join('; ')}</span> : <span className="flex items-center gap-1.5 text-score-good"><CheckCircle2 size={15} aria-hidden="true" />OK</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button onClick={run} disabled={bad.length > 0 || busy} aria-busy={busy}>Import {rows.length} {rows.length === 1 ? 'row' : 'rows'}</Button>
        </>
      )}
    </div>
  );
}

export default BulkImport;

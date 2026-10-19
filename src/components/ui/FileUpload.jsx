import { useId, useRef, useState } from 'react';
import { FileImage, Trash2, UploadCloud } from 'lucide-react';
import { cn } from '../../utils/cn.js';

const fmtBytes = (n) => (n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`);

/**
 * Drag-and-drop or click-to-choose file field. Validates type (`accept`, e.g. "image/png,image/jpeg,image/webp")
 * and size (`maxBytes`) before calling `onFile(file)`. Show the chosen file with `previewUrl` + `fileName`,
 * `progress` (0-100) while uploading and `error` from the server. The caller does the actual upload.
 */
function FileUpload({ label, accept = 'image/*', maxBytes = 2 * 1024 * 1024, hint, onFile, onRemove, previewUrl, fileName, progress, error, disabled = false, className }) {
  const id = useId();
  const inputRef = useRef(null);
  const [drag, setDrag] = useState(false);
  const [localError, setLocalError] = useState('');

  const accepted = accept.split(',').map((a) => a.trim());
  const typeOk = (file) => accepted.some((a) => (a.endsWith('/*') ? file.type.startsWith(a.slice(0, -1)) : file.type === a));

  const take = (file) => {
    if (!file) return;
    if (!typeOk(file)) return setLocalError('That file type is not supported.');
    if (file.size > maxBytes) return setLocalError(`File is too large (${fmtBytes(file.size)}). Maximum is ${fmtBytes(maxBytes)}.`);
    setLocalError('');
    onFile?.(file);
  };

  const shownError = error || localError;
  const uploading = typeof progress === 'number' && progress < 100;

  return (
    <div className={className}>
      {label && <p className="mb-1.5 text-sm font-medium text-foreground-strong">{label}</p>}
      {previewUrl || fileName ? (
        <div className="flex items-center gap-3 rounded-[20px] border border-border bg-surface p-3">
          {previewUrl ? <img src={previewUrl} alt="" className="size-16 shrink-0 rounded-xl object-cover" /> : <span className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-surface-strong text-muted"><FileImage size={24} aria-hidden="true" /></span>}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground-strong">{fileName ?? 'Uploaded file'}</p>
            {uploading ? (
              <div role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Upload progress" className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-strong">
                <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${progress}%` }} />
              </div>
            ) : (
              <p className="text-xs text-muted">Ready</p>
            )}
          </div>
          {onRemove && !uploading && (
            <button type="button" onClick={onRemove} aria-label="Remove file" className="flex size-10 shrink-0 items-center justify-center rounded-full text-muted hover:bg-danger/10 hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <Trash2 size={18} aria-hidden="true" />
            </button>
          )}
        </div>
      ) : (
        <label
          htmlFor={id}
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled) setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            if (!disabled) take(e.dataTransfer.files?.[0]);
          }}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[20px] border-2 border-dashed px-6 py-8 text-center transition-colors focus-within:ring-4 focus-within:ring-primary/15',
            drag ? 'border-primary bg-[var(--brand-lavender)]/60' : 'border-border-strong bg-surface hover:bg-surface-strong/50',
            shownError && 'border-danger',
            disabled && 'cursor-not-allowed opacity-50',
          )}
        >
          <span className="flex size-12 items-center justify-center rounded-full bg-[var(--brand-lavender)] text-primary">
            <UploadCloud size={24} strokeWidth={1.6} aria-hidden="true" />
          </span>
          <span className="text-sm font-semibold text-foreground-strong">
            <span className="text-primary">Choose a file</span> or drag it here
          </span>
          <span className="text-xs text-muted">{hint ?? `Up to ${fmtBytes(maxBytes)}`}</span>
          <input ref={inputRef} id={id} type="file" accept={accept} disabled={disabled} className="sr-only" onChange={(e) => take(e.target.files?.[0])} />
        </label>
      )}
      {shownError && <p role="alert" className="mt-1.5 text-xs text-danger">{shownError}</p>}
    </div>
  );
}

export default FileUpload;

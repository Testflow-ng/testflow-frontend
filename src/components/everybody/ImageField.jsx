import { useState } from 'react';
import FileUpload from '../ui/FileUpload.jsx';

/**
 * An image the owner can add, replace or remove. `upload(file)` does the real upload and resolves to the image URL;
 * `value` is the current URL (or empty). Used for site images, logos and pictures inside questions.
 */
function ImageField({ label = 'Image', value, onChange, upload, hint = 'PNG, JPEG or WebP, up to 2 MB', className }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const pick = async (file) => {
    setError('');
    setBusy(true);
    try {
      onChange(await upload(file));
    } catch (e) {
      setError(e?.message ?? 'Could not upload that image.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <FileUpload
      className={className}
      label={label}
      accept="image/png,image/jpeg,image/webp"
      hint={hint}
      previewUrl={value || undefined}
      fileName={value ? 'Image added' : undefined}
      progress={busy ? 50 : value ? 100 : undefined}
      error={error}
      onFile={pick}
      onRemove={() => onChange('')}
    />
  );
}

export default ImageField;

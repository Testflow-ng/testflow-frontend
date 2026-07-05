import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api.js';
import {
  Button,
  Modal,
  Alert,
} from '../../../components/ui/index.js';
import { FileCode, AlertCircle } from 'lucide-react';

const EXAMPLE_JSON = `[
  {
    "subject": "PHY102",
    "stem": "What is the unit of force?",
    "options": ["Newton", "Joule", "Watt", "Pascal"],
    "correctIndex": 0,
    "difficulty": "easy"
  }
]`;

function BulkImportModal({ open, onOpenChange }) {
  const [json, setJson] = useState('');
  const [error, setError] = useState(null);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data) => adminApi.bulkCreateQuestions(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['questions']);
      onOpenChange(false);
      setJson('');
      setError(null);
      alert(`Successfully imported ${res.count} questions.`);
    },
    onError: (err) => {
      const serverError = err.response?.data?.error;
      if (serverError?.details?.fieldErrors?.body) {
        // Zod array error: body is the key for the array
        const arrayErrors = serverError.details.fieldErrors.body;
        setError(`Import failed: ${arrayErrors.join(' | ')}`);
      } else if (serverError?.details?.fieldErrors) {
        // Standard object error
        const details = Object.entries(serverError.details.fieldErrors)
          .map(([key, val]) => `${key}: ${val.join(', ')}`)
          .join(' | ');
        setError(`Validation Error: ${details}`);
      } else {
        setError(serverError?.message || 'Import failed. Ensure all fields are correct and question indices are within range.');
      }
    }
  });

  const handleImport = () => {
    setError(null);
    try {
      const data = JSON.parse(json);
      if (!Array.isArray(data)) {
        throw new Error('Data must be an array of questions.');
      }
      mutation.mutate(data);
    } catch (e) {
      setError(e.message === 'Data must be an array of questions.' ? e.message : 'Invalid JSON format.');
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Bulk Import Questions"
      description="Paste a JSON array of questions to import them in bulk."
      size="lg"
    >
      <div className="space-y-4">
        {error && (
          <Alert variant="danger">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          </Alert>
        )}

        <div className="relative">
          <textarea
            className="w-full h-64 font-mono text-xs p-3 rounded-md border border-border bg-surface-strong focus:ring-2 focus:ring-primary focus:outline-none"
            placeholder={EXAMPLE_JSON}
            value={json}
            onChange={(e) => setJson(e.target.value)}
          />
          <div className="absolute top-2 right-2 opacity-50">
            <FileCode className="w-4 h-4" />
          </div>
        </div>

        <div className="text-[10px] text-muted leading-relaxed">
          <p className="font-bold mb-1 uppercase tracking-wider">Required Format:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li><strong>subject</strong>: Subject code (e.g., "PHY102") or ID</li>
            <li><strong>stem</strong>: The question text</li>
            <li><strong>options</strong>: Array of 2-6 strings</li>
            <li><strong>correctIndex</strong>: 0-based index of the correct option</li>
            <li><strong>difficulty</strong>: "easy", "medium", or "hard" (optional)</li>
            <li><strong>LaTeX Support</strong>: Wrap math in <code>$...$</code> for inline or <code>$$...$$</code> for blocks.</li>
          </ul>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            className="flex-1"
            onClick={handleImport}
            loading={mutation.isPending}
            disabled={!json.trim() || mutation.isPending}
          >
            Import Questions
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default BulkImportModal;

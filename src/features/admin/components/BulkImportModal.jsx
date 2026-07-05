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
      const issues = serverError?.details?.issues;
      const details = serverError?.details;

      if (issues && Array.isArray(issues)) {
        const questionIndex = issues[0].path.findIndex(p => typeof p === 'number');
        const questionNum = questionIndex !== -1 ? issues[0].path[questionIndex] + 1 : 'General';
        const field = issues[0].path[issues[0].path.length - 1];
        setError(`Error in Question #${questionNum}: The "${field}" field is ${issues[0].message}.`);
      } else if (details && typeof details === 'object') {
        // Mongoose validation errors
        const firstErrorKey = Object.keys(details)[0];
        const firstError = details[firstErrorKey];
        // Key might be like "0.options" or "questions.0.stem"
        const match = firstErrorKey.match(/\d+/);
        const qNum = match ? parseInt(match[0]) + 1 : 'Unknown';
        setError(`Error in Question #${qNum}: ${firstError.message || 'Validation failed'}`);
      } else {
        setError(serverError?.message || 'Import failed. Ensure all fields are present and options are unique.');
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

      // Pre-validation logic
      for (let i = 0; i < data.length; i++) {
        const q = data[i];
        if (!q.subject || !q.stem || !q.options || q.correctIndex === undefined) {
          throw new Error(`Question #${i + 1} is missing a required field (subject, stem, options, or correctIndex).`);
        }
        if (!Array.isArray(q.options) || q.options.length < 2) {
          throw new Error(`Question #${i + 1} must have at least 2 options.`);
        }
        if (q.correctIndex < 0 || q.correctIndex >= q.options.length) {
          throw new Error(`Question #${i + 1} has an invalid correctIndex (${q.correctIndex}). It must be between 0 and ${q.options.length - 1}.`);
        }
        // Check for exact duplicates in options
        const uniqueOptions = new Set(q.options.map(o => String(o).trim()));
        if (uniqueOptions.size !== q.options.length) {
          throw new Error(`Question #${i + 1} has duplicate options.`);
        }
      }

      mutation.mutate(data);
    } catch (e) {
      setError(e.message || 'Invalid JSON format.');
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
          <p className="font-bold mb-1 uppercase tracking-wider text-foreground-strong">Required Format:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li><strong>subject</strong>: Subject code (e.g., "PHY102")</li>
            <li><strong>stem</strong>: Wrap math in <code>\\( ... \\)</code> (use double backslashes in JSON)</li>
            <li><strong>options</strong>: Array of 2-6 strings</li>
            <li><strong>correctIndex</strong>: 0-based index of the correct option</li>
            <li><strong>difficulty</strong>: "easy", "medium", or "hard" (optional)</li>
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

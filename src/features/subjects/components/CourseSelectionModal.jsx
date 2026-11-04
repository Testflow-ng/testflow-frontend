import { useState } from 'react';
import { Button, Checkbox, SearchField, SegmentedControl, Spinner } from '../../../components/ui/index.js';
import Modal from '../../../components/ui/Modal.jsx';
import { useAuth } from '../../auth/useAuth.js';
import { useSubjects, useTogglePin } from '../useSubjects.js';

const LEVELS = [
  { value: 'all', label: 'All' },
  { value: '100', label: '100L' },
  { value: '200', label: '200L' },
  { value: '300', label: '300L' },
  { value: '400', label: '400L' },
  { value: '500', label: '500L' },
];

function CourseSelectionModal({ open, onOpenChange }) {
  const { user } = useAuth();
  const { data: subjects, isLoading } = useSubjects();
  const { mutate: togglePin } = useTogglePin();
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');

  const needle = search.trim().toLowerCase();
  const filtered = (subjects ?? []).filter(
    (s) =>
      (!needle || s.code.toLowerCase().includes(needle) || s.title.toLowerCase().includes(needle)) &&
      (levelFilter === 'all' || String(s.level) === levelFilter),
  );
  const pinnedCount = user?.pinnedSubjects?.length || 0;

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Manage your courses"
      description="Tick the courses you are offering this semester."
      footer={<Button onClick={() => onOpenChange(false)}>Done ({pinnedCount} selected)</Button>}
    >
      <div className="space-y-4 py-1">
        <div className="sticky top-0 z-10 -mx-1 flex flex-col gap-2.5 bg-surface px-1 pb-2 pt-1">
          <SearchField value={search} onChange={(e) => setSearch(e.target.value)} onClear={() => setSearch('')} placeholder="Search course code or title" />
          <div className="overflow-x-auto pb-0.5">
            <SegmentedControl label="Level" size="sm" value={levelFilter} onValueChange={setLevelFilter} options={LEVELS} />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {isLoading ? (
            <div className="flex justify-center py-10"><Spinner /></div>
          ) : filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted">No courses match your search.</p>
          ) : (
            filtered.map((s) => (
              <div key={s.id} className="rounded-xl border border-border bg-surface p-3">
                <Checkbox
                  label={s.code}
                  hint={s.title}
                  checked={Boolean(user?.pinnedSubjects?.includes(s.id))}
                  onChange={() => togglePin(s.id)}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}

export default CourseSelectionModal;

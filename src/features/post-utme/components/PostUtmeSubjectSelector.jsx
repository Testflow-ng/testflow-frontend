import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check, Info, Search, Target, Zap } from 'lucide-react';
import { Button, Modal, Card, SkeletonCard, Alert } from '../../../components/ui/index.js';
import { cn } from '../../../utils/cn.js';

import { adminApi } from '../../admin/api.js';
import apiClient from '../../../api/client.js';

function PostUtmeSubjectSelector({ open, onOpenChange, onStart }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch] = useState('');

  const { data: subjects, isLoading, isError } = useQuery({
    queryKey: ['subjects', 'post-utme'],
    queryFn: async () => {
      const res = await apiClient.get('/api/subjects', { params: { level: 'post-utme' } });
      return res.data.subjects;
    },
  });

  const compulsory = useMemo(() =>
    subjects?.find(s => s.isCompulsoryUtme),
  [subjects]);

  const electives = useMemo(() =>
    subjects?.filter(s => !s.isCompulsoryUtme) || [],
  [subjects]);

  const filteredElectives = useMemo(() =>
    electives.filter(s =>
      s.code.toLowerCase().includes(search.toLowerCase()) ||
      s.title.toLowerCase().includes(search.toLowerCase())
    ),
  [electives, search]);

  const toggleSubject = (id) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) return prev.filter(i => i !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const handleStart = () => {
    if (selectedIds.length !== 3) return;
    onStart([...selectedIds, compulsory.id]);
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Mock Test Setup"
      description="Choose your 3 elective subjects. Use of English is compulsory."
      size="lg"
    >
      <div className="space-y-6 pt-2">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} className="h-20" />
            ))}
          </div>
        ) : isError ? (
          <Alert variant="danger">Failed to load subjects. Please try again.</Alert>
        ) : (
          <>
            {/* Compulsory Subject Card */}
            {compulsory && (
              <div className="relative overflow-hidden rounded-2xl border-2 border-primary bg-primary/5 p-4 shadow-sm">
                <div className="absolute -right-2 -top-2 rotate-12 text-primary/10">
                   <Zap size={64} className="fill-current" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                      <Zap size={20} className="fill-current" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary">Compulsory Subject</p>
                      <h4 className="text-sm font-black text-foreground-strong">{compulsory.title} ({compulsory.code})</h4>
                    </div>
                  </div>
                  <Check size={20} className="text-primary" />
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-widest text-muted">Select 3 Electives ({selectedIds.length}/3)</h3>
                <div className="relative w-48">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-9 w-full rounded-full border border-border bg-surface-strong pl-9 pr-4 text-xs outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                {filteredElectives.map((subject) => {
                  const isSelected = selectedIds.includes(subject.id);
                  const isDisabled = !isSelected && selectedIds.length >= 3;

                  return (
                    <button
                      key={subject.id}
                      disabled={isDisabled}
                      onClick={() => toggleSubject(subject.id)}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left",
                        isSelected
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border bg-surface hover:border-border-strong",
                        isDisabled && "opacity-50 cursor-not-allowed grayscale"
                      )}
                    >
                      <div>
                        <p className="text-[10px] font-bold text-muted uppercase tracking-tighter">{subject.code}</p>
                        <h5 className="text-xs font-bold text-foreground-strong leading-tight mt-0.5">{subject.title}</h5>
                      </div>
                      <div className={cn(
                        "size-5 rounded-lg border-2 flex items-center justify-center transition-colors",
                        isSelected ? "bg-primary border-primary text-primary-foreground" : "border-border"
                      )}>
                        {isSelected && <Check size={12} strokeWidth={3} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-4 border-t border-border pt-6">
              <div className="flex items-start gap-3 rounded-xl bg-amber-500/5 p-3 border border-amber-500/10">
                <Info size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[10px] leading-relaxed text-amber-700 dark:text-amber-300">
                  Ensure these subjects match your JAMB UTME combination. Incorrect subjects may result in an inaccurate aggregate score.
                </p>
              </div>
              <Button
                fullWidth
                disabled={selectedIds.length !== 3}
                onClick={handleStart}
                className="h-12 rounded-2xl shadow-xl shadow-primary/20"
                leadingIcon={<Target size={20} />}
              >
                Start Examination
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

export default PostUtmeSubjectSelector;

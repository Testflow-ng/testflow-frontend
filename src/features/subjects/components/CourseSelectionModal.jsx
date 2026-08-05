import { useState } from 'react';
import { useAuth } from '../../auth/useAuth.js';
import { useSubjects, useTogglePin } from '../useSubjects.js';
import { Modal, Button, Spinner, Input } from '../../../components/ui/index.js';
import { Star, Search, CheckCircle2 } from 'lucide-react';
import { cn } from '../../../utils/cn.js';

function CourseSelectionModal({ open, onOpenChange }) {
  const { user } = useAuth();
  const { data: subjects, isLoading } = useSubjects();
  const { mutate: togglePin } = useTogglePin();
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');

  const filtered = subjects?.filter(s => {
    const matchesSearch = s.code.toLowerCase().includes(search.toLowerCase()) ||
                          s.title.toLowerCase().includes(search.toLowerCase());
    const matchesLevel = levelFilter === 'all' || s.level === levelFilter;
    return matchesSearch && matchesLevel;
  }) || [];

  const pinnedCount = user?.pinnedSubjects?.length || 0;

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Organize Your Courses"
      description="Select the courses you are offering this semester to pin them to your dashboard."
      footer={
        <Button onClick={() => onOpenChange(false)} className="w-full">
          Done Selecting ({pinnedCount})
        </Button>
      }
    >
      <div className="space-y-6 pt-2">
        {/* Search and Filters */}
        <div className="flex flex-col gap-3">
          <Input
            placeholder="Search course code or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leadingAdornment={<Search size={16} className="text-muted" />}
          />
          <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
            {['all', '100', '200', '300', '400', '500'].map(lvl => (
              <button
                key={lvl}
                onClick={() => setLevelFilter(lvl)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border whitespace-nowrap transition-all",
                  levelFilter === lvl ? "bg-primary border-primary text-white" : "bg-surface-strong border-border text-muted"
                )}
              >
                {lvl === 'all' ? 'All Levels' : `${lvl}L`}
              </button>
            ))}
          </div>
        </div>

        {/* Course List */}
        <div className="max-h-[350px] overflow-y-auto space-y-2 custom-scrollbar">
          {isLoading ? (
            <div className="py-10 flex justify-center"><Spinner /></div>
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center text-muted italic text-sm">No courses match your search.</div>
          ) : (
            filtered.map(subject => {
              const isPinned = user?.pinnedSubjects?.includes(subject.id);
              return (
                <button
                  key={subject.id}
                  onClick={() => togglePin(subject.id)}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left",
                    isPinned
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border bg-surface hover:bg-surface-strong"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs",
                      isPinned ? "bg-primary text-white" : "bg-surface-strong text-muted"
                    )}>
                      {subject.code.substring(0, 3)}
                    </div>
                    <div>
                      <p className="text-xs font-black text-foreground-strong">{subject.code}</p>
                      <p className="text-[10px] text-muted font-medium line-clamp-1">{subject.title}</p>
                    </div>
                  </div>
                  {isPinned ? (
                    <div className="bg-primary rounded-full p-1 text-white shadow-lg shadow-primary/20 scale-110">
                      <CheckCircle2 size={16} />
                    </div>
                  ) : (
                    <Star size={18} className="text-border group-hover:text-muted transition-colors" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </Modal>
  );
}

export default CourseSelectionModal;

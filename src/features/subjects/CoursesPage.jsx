import { useState } from 'react';
import { Settings2 } from 'lucide-react';
import { Button, SearchField, SegmentedControl } from '../../components/ui/index.js';
import Screen, { PageHeader } from '../../components/layout/Screen.jsx';
import { ICON } from '../../components/ui/iconProps.js';
import SubjectGrid from './SubjectGrid.jsx';
import CourseSelectionModal from './components/CourseSelectionModal.jsx';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'pinned', label: 'My courses' },
  { value: '100', label: '100L' },
  { value: '200', label: '200L' },
  { value: '300', label: '300L' },
  { value: '400', label: '400L' },
  { value: '500', label: '500L' },
];

function CoursesPage() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);

  return (
    <Screen width="full">
      <PageHeader
        title="Courses"
        subtitle="Browse and practise your subjects."
        action={
          <Button data-tour="manage-courses" variant="outline" size="sm" onClick={() => setIsSelectionModalOpen(true)} leadingIcon={<Settings2 {...ICON} />}>
            Manage courses
          </Button>
        }
      />

      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <SearchField
          className="lg:max-w-sm lg:flex-1"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch('')}
          placeholder="Search courses"
          aria-label="Search subjects"
        />
        <div className="-mx-1 overflow-x-auto px-1 pb-1">
          <SegmentedControl label="Filter courses" size="sm" value={filter} onValueChange={setFilter} options={FILTERS} />
        </div>
      </div>

      <div className="mt-5" data-tour="course-grid">
        <SubjectGrid filter={filter} search={search} onOpenSelection={() => setIsSelectionModalOpen(true)} />
      </div>

      <CourseSelectionModal open={isSelectionModalOpen} onOpenChange={setIsSelectionModalOpen} />
    </Screen>
  );
}

export default CoursesPage;

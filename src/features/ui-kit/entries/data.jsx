import { useState } from 'react';
import { Award, BookOpen, Target, Users, Zap, Settings, User, LogOut } from 'lucide-react';
import { Badge, Button, DropdownMenu, IconButton, SearchField, useToast } from '../../../components/ui/index.js';
import StatCard from '../../../components/data/StatCard.jsx';
import { BrandBarChart, BrandDonutChart, BrandLineChart, BrandRadarChart } from '../../../components/data/charts.jsx';
import DataTable from '../../../components/data/DataTable.jsx';
import FilterableList from '../../../components/data/FilterableList.jsx';
import LeaderboardRow from '../../../components/data/LeaderboardRow.jsx';
import CourseCard from '../../../components/data/CourseCard.jsx';
import { AchievementBadge, StreakBadge } from '../../../components/data/Badges.jsx';
import { courses, split, students, topics, weekly } from './samples.js';

export default [
  {
    id: 'stat-card', name: 'Stat card and badges', category: 'Data', source: ['data/StatCard.jsx', 'data/Badges.jsx', 'ui/CountUp.jsx'],
    description: 'A number with a trend, a streak badge and achievement tiles. Numbers count up on mount.',
    keywords: ['kpi', 'metric', 'number', 'trend', 'streak', 'achievement', 'badge', 'dashboard'],
    Preview: () => (
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard icon={BookOpen} label="Papers taken" value={128} trend={12} trendLabel="vs last week" />
          <StatCard icon={Target} tone="accent" label="Average score" value="68%" trend={-4} />
          <StatCard icon={Users} tone="sage" label="Active students" value={1342} trend={0} />
        </div>
        <div className="flex flex-wrap items-center gap-3"><StreakBadge days={5} /><StreakBadge days={0} active={false} /></div>
        <div className="grid gap-3 sm:grid-cols-2">
          <AchievementBadge icon={Award} unlocked title="First pass" description="Scored 70% or more" />
          <AchievementBadge icon={Zap} title="Ten in a row" progress="7 of 10 correct" current={7} target={10} />
        </div>
      </div>
    ),
    usage: `import StatCard from '../components/data/StatCard.jsx';
import { AchievementBadge, StreakBadge } from '../components/data/Badges.jsx';

// tone: primary | success | accent | sage | warning   trend is signed percentage points
<StatCard icon={BookOpen} label="Papers taken" value={128} trend={12} trendLabel="vs last week" />
<StreakBadge days={5} />
<AchievementBadge icon={Zap} title="Ten in a row" progress="7 of 10 correct" current={7} target={10} />`,
  },
  {
    id: 'charts', name: 'Charts', category: 'Data', source: ['data/charts.jsx', 'data/useBrandColors.js'],
    description: 'Brand-coloured Recharts: bar, line, donut and radar. Animations are opt-in with `animate`.',
    keywords: ['graph', 'bar', 'line', 'donut', 'pie', 'radar', 'analytics', 'recharts', 'plot'],
    Preview: () => (
      <div className="grid gap-6 md:grid-cols-2">
        <BrandBarChart label="Questions answered this week" data={weekly} height={220} />
        <BrandLineChart label="Score over time" data={weekly} height={220} />
        <BrandDonutChart label="Results split" data={split} centerLabel="62%" height={200} />
        <BrandRadarChart label="Strength by topic" data={topics} height={240} />
      </div>
    ),
    usage: `import { BrandBarChart, BrandLineChart, BrandDonutChart, BrandRadarChart } from '../components/data/charts.jsx';

// data is [{ name, value }]. Pass \`label\` for screen readers and \`animate\` to draw it in.
<BrandBarChart label="Questions answered this week" data={weekly} height={240} animate />
<BrandDonutChart label="Results split" data={split} centerLabel="62%" />`,
  },
  {
    id: 'data-table', name: 'Data table', category: 'Data', source: 'data/DataTable.jsx',
    description: 'Sortable, paginated table. Client mode, or server mode with selection, bulk and row actions.',
    keywords: ['table', 'grid', 'rows', 'sort', 'paginate', 'select', 'bulk', 'admin', 'list'],
    Preview: function Demo() {
      const toast = useToast();
      const [sort, setSort] = useState({ key: 'score', dir: 'desc' });
      const [page, setPage] = useState(1);
      const slice = students.slice((page - 1) * 5, (page - 1) * 5 + 5);
      return (
        <div className="space-y-8">
          <DataTable caption="Students" pageSize={5} initialSort={{ key: 'score', dir: 'desc' }} rows={students} columns={[
            { key: 'name', header: 'Student', sortable: true },
            { key: 'level', header: 'Level', sortable: true },
            { key: 'tests', header: 'Tests', sortable: true, align: 'right' },
            { key: 'score', header: 'Avg score', sortable: true, align: 'right', render: (r) => <Badge variant={r.score >= 70 ? 'success' : r.score >= 50 ? 'warning' : 'danger'}>{r.score}%</Badge> },
          ]} />
          <DataTable
            selectable
            caption="Students (server mode)"
            toolbar={<SearchField value="" onChange={() => {}} placeholder="Search students" className="max-w-xs" />}
            bulkActions={({ selectedIds, clear }) => <Button size="sm" variant="outline" onClick={() => { toast.success(`Removed ${selectedIds.length} (demo)`); clear(); }}>Remove</Button>}
            rowActions={(r) => <DropdownMenu placement="bottom-end" trigger={(p) => <IconButton aria-label={`Actions for ${r.name}`} size="sm" variant="ghost" {...p}><Settings size={16} /></IconButton>} items={[{ label: 'View', icon: User }, { label: 'Remove', danger: true, icon: LogOut }]} />}
            server={{ page, pageCount: 4, total: students.length, onPageChange: setPage, sort, onSortChange: setSort }}
            rows={slice}
            columns={[{ key: 'name', header: 'Student', sortable: true }, { key: 'level', header: 'Level', sortable: true }, { key: 'score', header: 'Avg score', sortable: true, align: 'right' }]}
          />
        </div>
      );
    },
    usage: `import DataTable from '../components/data/DataTable.jsx';

// Client mode: pass every row, it sorts and pages itself. Rows need a unique \`id\`.
<DataTable
  caption="Students"
  pageSize={8}
  initialSort={{ key: 'score', dir: 'desc' }}
  rows={students}
  columns={[
    { key: 'name', header: 'Student', sortable: true },
    { key: 'score', header: 'Avg', sortable: true, align: 'right', render: (r) => <Badge>{r.score}%</Badge> },
  ]}
/>

// Server mode: pass ONE page of rows plus
// server={{ page, pageCount, total, onPageChange, sort, onSortChange }}
// Extras: selectable, toolbar, bulkActions({ selectedIds, clear }), rowActions(row), loading`,
  },
  {
    id: 'filterable-list', name: 'Filterable list and course card', category: 'Data', source: ['data/FilterableList.jsx', 'data/CourseCard.jsx', 'data/LeaderboardRow.jsx'],
    description: 'Search plus filter chips over a list or grid, optional pagination, and ranking rows.',
    keywords: ['search', 'filter', 'courses', 'leaderboard', 'ranking', 'grid', 'list', 'hall of fame'],
    Preview: () => (
      <div className="space-y-6">
        <FilterableList layout="grid" items={courses} searchKeys={['code', 'name']} placeholder="Search courses" filters={[{ value: 'all', label: 'All' }, { value: 'pinned', label: 'Pinned', test: (c) => c.pinned }]} renderItem={(c) => <CourseCard code={c.code} name={c.name} questionCount={c.questions} progress={c.p} pinned={c.pinned} onPin={() => {}} onSelect={() => {}} />} />
        <div className="grid max-w-md gap-2">
          <LeaderboardRow rank={1} name="Chioma A." score={94} detail="MTH101 · 100 level" />
          <LeaderboardRow rank={2} name="Tunde B." score={91} />
          <LeaderboardRow rank={3} name="Feranmi Oresajo" score={88} isYou />
          <LeaderboardRow rank={4} name="Zainab C." score={80} />
        </div>
      </div>
    ),
    usage: `import FilterableList from '../components/data/FilterableList.jsx';
import LeaderboardRow from '../components/data/LeaderboardRow.jsx';

// Items need an \`id\`. pageSize turns on pagination.
<FilterableList
  items={items}
  searchKeys={['code', 'name']}
  pageSize={6}
  filters={[{ value: 'all', label: 'All' }, { value: 'pinned', label: 'Pinned', test: (c) => c.pinned }]}
  renderItem={(c) => <CourseCard code={c.code} name={c.name} onSelect={open} />}
/>
<LeaderboardRow rank={3} name="Feranmi Oresajo" score={88} isYou />`,
  },
];

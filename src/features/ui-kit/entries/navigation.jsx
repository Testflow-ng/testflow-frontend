import { useState } from 'react';
import { LogOut, Megaphone, LayoutTemplate, GraduationCap, Settings, User } from 'lucide-react';
import { BackButton, Breadcrumb, Button, DropdownMenu, TabPanel, Tabs, useToast } from '../../../components/ui/index.js';
import { PageHeader } from '../../../components/layout/Screen.jsx';
import AccountMenu from '../../../components/AccountMenu.jsx';
import ProductSwitcher from '../../../components/ProductSwitcher.jsx';
import Pagination from '../../../components/data/Pagination.jsx';

export default [
  {
    id: 'tabs', name: 'Tabs', category: 'Navigation', source: 'ui/Tabs.jsx',
    description: 'Pill tabs with arrow-key navigation. Pair each tab with a TabPanel.',
    keywords: ['tab', 'sections', 'switch view', 'panel'],
    Preview: function Demo() {
      const [tab, setTab] = useState('a');
      return (
        <div>
          <Tabs idPrefix="kit-demo" label="Sections" value={tab} onValueChange={setTab} items={[{ value: 'a', label: 'Overview' }, { value: 'b', label: 'Papers', count: 12 }, { value: 'c', label: 'Notes' }]} />
          <div className="mt-3 text-sm text-muted">
            <TabPanel idPrefix="kit-demo" value="a" active={tab}>Overview content</TabPanel>
            <TabPanel idPrefix="kit-demo" value="b" active={tab}>Papers content</TabPanel>
            <TabPanel idPrefix="kit-demo" value="c" active={tab}>Notes content</TabPanel>
          </div>
        </div>
      );
    },
    usage: `import { Tabs, TabPanel } from '../components/ui/index.js';

<Tabs idPrefix="progress" label="Sections" value={tab} onValueChange={setTab}
  items={[{ value: 'a', label: 'Overview' }, { value: 'b', label: 'Papers', count: 12 }]} />
<TabPanel idPrefix="progress" value="a" active={tab}>Overview content</TabPanel>`,
  },
  {
    id: 'dropdown', name: 'Dropdown menu', category: 'Navigation', source: 'ui/DropdownMenu.jsx',
    description: 'A custom action menu with icons, links, separators and a danger item.',
    keywords: ['menu', 'actions', 'context', 'more', 'account', 'options'],
    Preview: function Demo() {
      const toast = useToast();
      return (
        <DropdownMenu
          trigger={(p) => <Button variant="outline" {...p}>Account</Button>}
          items={[
            { label: 'Profile', icon: User, to: '/profile' },
            { label: 'Settings', icon: Settings, to: '/settings' },
            { separator: true },
            { label: 'Sign out', icon: LogOut, danger: true, onSelect: () => toast.success('Signed out (demo)') },
          ]}
        />
      );
    },
    usage: `import { DropdownMenu, Button } from '../components/ui/index.js';

<DropdownMenu
  placement="bottom-end"
  trigger={(props) => <Button variant="outline" {...props}>Account</Button>}
  items={[
    { label: 'Profile', icon: User, to: '/profile' },
    { separator: true },
    { label: 'Sign out', icon: LogOut, danger: true, onSelect: signOut },
  ]}
/>`,
  },
  {
    id: 'page-header', name: 'Page header, breadcrumb and back', category: 'Navigation', source: ['layout/Screen.jsx', 'ui/Breadcrumb.jsx', 'ui/BackButton.jsx'],
    description: 'The title block for every in-app screen, with back link, breadcrumbs and actions.',
    keywords: ['title', 'heading', 'screen', 'layout', 'back', 'breadcrumb'],
    Preview: () => (
      <div className="space-y-4">
        <PageHeader back="/" breadcrumbs={[{ label: 'Courses', to: '/courses' }, { label: 'MTH101' }]} eyebrow="Course" title="Elementary Mathematics" subtitle="40 questions across 6 topics" action={<><Button variant="outline" size="sm">Share</Button><Button size="sm">Start paper</Button></>} />
        <Breadcrumb items={[{ label: 'Admin', to: '/admin' }, { label: 'Questions' }]} />
        <BackButton label="Back to courses" />
      </div>
    ),
    usage: `import Screen, { PageHeader } from '../components/layout/Screen.jsx';

// Every in-app page: Screen (width: sm | md | lg | xl | full) + PageHeader.
<Screen width="xl">
  <PageHeader
    back="/courses"
    eyebrow="Course"
    title="Elementary Mathematics"
    subtitle="40 questions across 6 topics"
    action={<Button size="sm">Start paper</Button>}
  />
</Screen>`,
  },
  {
    id: 'pagination', name: 'Pagination', category: 'Navigation', source: 'data/Pagination.jsx',
    description: 'Numbered pages with previous and next. Collapses with ellipses.',
    keywords: ['pages', 'next', 'previous', 'paging', 'list'],
    Preview: function Demo() {
      const [pg, setPg] = useState(2);
      return <Pagination page={pg} pageCount={12} onPageChange={setPg} />;
    },
    usage: `import Pagination from '../components/data/Pagination.jsx';

<Pagination page={page} pageCount={12} onPageChange={setPage} />   {/* page is 1-based */}`,
  },
  {
    id: 'account-menu', name: 'Account menu and product switcher', category: 'Navigation', source: ['AccountMenu.jsx', 'ProductSwitcher.jsx'],
    description: 'The signed-in user menu, and the switcher between Student, Ads and Everyone.',
    keywords: ['profile', 'user', 'sign out', 'switch product', 'header'],
    Preview: function Demo() {
      const [product, setProduct] = useState('student');
      return (
        <div className="flex flex-wrap items-start gap-6">
          <AccountMenu placement="bottom-start" />
          <div className="w-72">
            <ProductSwitcher current={product} products={[
              { key: 'student', label: 'Student', description: 'Practice and exams', icon: GraduationCap, onSelect: () => setProduct('student') },
              { key: 'ads', label: 'TestFlow Ads', description: 'Campaigns', icon: Megaphone, onSelect: () => setProduct('ads') },
              { key: 'everybody', label: 'Testflow for Everyone', description: 'Advance Tutorials', icon: LayoutTemplate, onSelect: () => setProduct('everybody') },
            ]} />
          </div>
        </div>
      );
    },
    usage: `import AccountMenu from '../components/AccountMenu.jsx';
import ProductSwitcher from '../components/ProductSwitcher.jsx';

<AccountMenu placement="bottom-end" />
<ProductSwitcher current="student" products={[
  { key: 'student', label: 'Student', description: 'Practice and exams', icon: GraduationCap, onSelect: () => go('/dashboard') },
]} />`,
  },
];

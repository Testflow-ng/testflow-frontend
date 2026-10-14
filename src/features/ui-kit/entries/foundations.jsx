import { useState } from 'react';
import { Bell, Settings } from 'lucide-react';
import {
  Avatar, AvatarGroup, Badge, Button, Card, IconButton, Popover, ProgressBar, ProgressRing, Skeleton, SkeletonCard, SkeletonText, Spinner, Tooltip, Checkbox,
} from '../../../components/ui/index.js';
import Mascot from '../../../components/brand/Mascot.jsx';


import { Row } from './helpers.jsx';

export default [
  {
    id: 'button', name: 'Button', category: 'Foundations', source: ['ui/Button.jsx', 'ui/buttonClasses.js'],
    description: 'Primary action control with variants, sizes, icons and a loading state. Try the props above.',
    keywords: ['cta', 'action', 'submit', 'loading', 'icon button'],
    controls: [
      { key: 'variant', label: 'Variant', type: 'select', options: ['primary', 'secondary', 'accent', 'outline', 'ghost', 'danger'], default: 'primary' },
      { key: 'size', label: 'Size', type: 'select', options: ['sm', 'md', 'lg'], default: 'md' },
      { key: 'label', label: 'Label', type: 'text', default: 'Save changes' },
      { key: 'loading', label: 'Loading', type: 'switch', default: false },
      { key: 'disabled', label: 'Disabled', type: 'switch', default: false },
    ],
    Preview: ({ variant, size, label, loading, disabled }) => (
      <div className="space-y-8">
        <Button variant={variant} size={size} loading={loading} disabled={disabled}>{label}</Button>
        <div className="space-y-4 border-t border-border pt-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">All variants</p>
          <Row>{['primary', 'secondary', 'accent', 'outline', 'ghost', 'danger'].map((v) => <Button key={v} variant={v}>{v}</Button>)}</Row>
          <Row><IconButton aria-label="Notifications" variant="outline"><Bell size={18} /></IconButton></Row>
        </div>
      </div>
    ),
    usage: (v) => `import { Button, IconButton } from '../components/ui/index.js';

<Button${v.variant !== 'primary' ? ` variant="${v.variant}"` : ''}${v.size !== 'md' ? ` size="${v.size}"` : ''}${v.loading ? ' loading' : ''}${v.disabled ? ' disabled' : ''}>${v.label}</Button>

// Variants: primary | secondary | accent | outline | ghost | danger
// Sizes: sm | md | lg. Add an icon with leadingIcon={<Plus size={16} />}
<IconButton aria-label="Notifications" variant="outline">
  <Bell size={18} />
</IconButton>`,
  },
  {
    id: 'spinner', name: 'Spinner', category: 'Foundations', source: 'ui/Spinner.jsx',
    description: 'The twelve-tick brand spinner. It takes the colour of its parent.',
    keywords: ['loading', 'busy', 'wait', 'progress'],
    controls: [{ key: 'size', label: 'Size', type: 'select', options: ['sm', 'md', 'lg', 'xl'], default: 'lg' }],
    Preview: ({ size }) => (
      <div className="space-y-6">
        <Spinner size={size} className="text-primary" />
        <Row>
          <span className="rounded-full bg-primary p-3 text-primary-foreground"><Spinner size="md" /></span>
          <span className="rounded-full bg-secondary p-3 text-white"><Spinner size="md" /></span>
          <Button disabled><Spinner size="sm" /> Saving</Button>
        </Row>
      </div>
    ),
    usage: (v) => `import { Spinner } from '../components/ui/index.js';

// Sizes: sm | md | lg | xl. Colour comes from the parent (text-primary here).
<Spinner size="${v.size}" className="text-primary" />`,
  },
  {
    id: 'card', name: 'Card', category: 'Foundations', source: 'ui/Card.jsx',
    description: 'The surface everything sits on. Padding steps down on phones.',
    keywords: ['surface', 'panel', 'container', 'box'],
    controls: [
      { key: 'padding', label: 'Padding', type: 'select', options: ['none', 'sm', 'md', 'lg'], default: 'md' },
      { key: 'raised', label: 'Shadow', type: 'switch', default: true },
      { key: 'hover', label: 'Lift on hover', type: 'switch', default: false },
    ],
    Preview: ({ padding, raised, hover }) => (
      <Card padding={padding} raised={raised} hover={hover} className="max-w-xs"><p className="font-bold">MTH101</p><p className="text-sm text-muted">Elementary Mathematics</p></Card>
    ),
    usage: (v) => `import { Card } from '../components/ui/index.js';

<Card padding="${v.padding}"${v.raised ? '' : ' raised={false}'}${v.hover ? ' hover' : ''}>
  <h3 className="font-heading font-bold">MTH101</h3>
  <p className="text-sm text-muted">Elementary Mathematics</p>
</Card>`,
  },
  {
    id: 'badge', name: 'Badge', category: 'Foundations', source: 'ui/Badge.jsx',
    description: 'Small label for status or counts, in the brand tints.',
    keywords: ['tag', 'label', 'pill', 'chip', 'status'],
    controls: [
      { key: 'variant', label: 'Variant', type: 'select', options: ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'lavender', 'lime', 'sage', 'outline'], default: 'lime' },
      { key: 'label', label: 'Text', type: 'text', default: 'Coming soon' },
    ],
    Preview: ({ variant, label }) => (
      <div className="space-y-6">
        <Badge variant={variant}>{label}</Badge>
        <Row>{['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'lavender', 'lime', 'sage', 'outline'].map((v) => <Badge key={v} variant={v}>{v}</Badge>)}</Row>
      </div>
    ),
    usage: (v) => `import { Badge } from '../components/ui/index.js';

<Badge variant="${v.variant}">${v.label}</Badge>`,
  },
  {
    id: 'avatar', name: 'Avatar', category: 'Foundations', source: 'ui/Avatar.jsx',
    description: 'Initials or photo, plus a stacked group with an overflow count.',
    keywords: ['user', 'profile', 'photo', 'people', 'group'],
    controls: [
      { key: 'name', label: 'Name', type: 'text', default: 'Feranmi Oresajo' },
      { key: 'size', label: 'Size', type: 'select', options: ['xs', 'sm', 'md', 'lg'], default: 'md' },
    ],
    Preview: ({ name, size }) => (
      <div className="space-y-6">
        <Avatar name={name || 'A B'} size={size} />
        <AvatarGroup people={[{ name: 'A B' }, { name: 'C D' }, { name: 'E F' }, { name: 'G H' }, { name: 'I J' }, { name: 'K L' }]} max={4} />
      </div>
    ),
    usage: (v) => `import { Avatar, AvatarGroup } from '../components/ui/index.js';

<Avatar name="${v.name}" size="${v.size}" />          {/* xs | sm | md | lg */}
<Avatar name="Owa Edison" src="/team/owa.webp" />
<AvatarGroup people={[{ name: 'A B' }, { name: 'C D' }]} max={4} />`,
  },
  {
    id: 'progress', name: 'Progress bar and ring', category: 'Foundations', source: ['ui/ProgressBar.jsx', 'ui/ProgressRing.jsx'],
    description: 'Linear and circular progress. The bar grows in on mount (not under reduced motion).',
    keywords: ['percent', 'readiness', 'score', 'streak', 'meter'],
    controls: [
      { key: 'value', label: 'Value', type: 'range', min: 0, max: 100, default: 72 },
      { key: 'tone', label: 'Tone', type: 'select', options: ['primary', 'success', 'warning', 'danger', 'accent', 'ink'], default: 'primary' },
      { key: 'size', label: 'Bar height', type: 'select', options: ['sm', 'md', 'lg'], default: 'md' },
    ],
    Preview: ({ value, tone, size }) => (
      <div className="space-y-6">
        <ProgressBar label="Mathematics readiness" value={value} tone={tone} size={size} showValue />
        <ProgressRing value={value} tone={tone} label="Score">{value}%</ProgressRing>
      </div>
    ),
    usage: (v) => `import { ProgressBar, ProgressRing } from '../components/ui/index.js';

<ProgressBar label="Mathematics readiness" value={${v.value}} tone="${v.tone}" size="${v.size}" showValue />
<ProgressRing value={${v.value}} size={96} stroke={9} tone="${v.tone}" label="Score">${v.value}%</ProgressRing>`,
  },
  {
    id: 'skeleton', name: 'Skeleton', category: 'Foundations', source: 'ui/Skeleton.jsx',
    description: 'Shimmering placeholders that match the shape of what is loading.',
    keywords: ['loading', 'placeholder', 'shimmer', 'wait'],
    Preview: () => (
      <Row className="items-start">
        <div className="w-64"><SkeletonCard /></div>
        <div className="w-64"><SkeletonText lines={3} /></div>
        <Skeleton className="h-24 w-40" />
      </Row>
    ),
    usage: `import { Skeleton, SkeletonCard, SkeletonText } from '../components/ui/index.js';

{isLoading ? <SkeletonCard className="h-32" /> : <CourseCard {...course} />}
<SkeletonText lines={3} />
<Skeleton className="h-24 w-40" />`,
  },
  {
    id: 'tooltip', name: 'Tooltip and Popover', category: 'Foundations', source: ['ui/Tooltip.jsx', 'ui/Popover.jsx'],
    description: 'A short hint on hover or focus, and a click-open panel for richer content.',
    keywords: ['hint', 'overlay', 'help', 'popup', 'filter'],
    Preview: function Demo() {
      const [pinned, setPinned] = useState(false);
      return (
        <Row>
          <Tooltip label="Settings"><IconButton aria-label="Settings" variant="outline"><Settings size={18} /></IconButton></Tooltip>
          <Popover trigger={(p) => <Button variant="outline" {...p}>Filters</Button>}>
            <p className="mb-2 font-bold">Filter</p>
            <Checkbox label="Pinned only" checked={pinned} onChange={(e) => setPinned(e.target.checked)} />
          </Popover>
        </Row>
      );
    },
    usage: `import { Tooltip, Popover, Button } from '../components/ui/index.js';

<Tooltip label="Settings">
  <IconButton aria-label="Settings"><Settings size={18} /></IconButton>
</Tooltip>

<Popover trigger={(props) => <Button variant="outline" {...props}>Filters</Button>}>
  <p>Anything here</p>
</Popover>`,
  },
  {
    id: 'mascot', name: 'Mascot (Flo)', category: 'Foundations', source: 'brand/Mascot.jsx',
    description: 'Flo, the brand mascot. His mood should always reflect something true about the user.',
    keywords: ['flo', 'character', 'brand', 'mood', 'animation', 'illustration'],
    Preview: () => (
      <Row>{['happy', 'encouraging', 'thinking', 'excited', 'confident', 'applauding', 'sad', 'sleeping'].map((m) => (
        <div key={m} className="flex flex-col items-center gap-1"><Mascot mood={m} size={64} /><span className="text-xs text-muted">{m}</span></div>
      ))}</Row>
    ),
    usage: `import Mascot from '../components/brand/Mascot.jsx';

// Pick a mood from something true (a score, a streak, an empty list). animation is optional:
// float | bounce | wave | celebrate | breathe | lookAround
<Mascot mood="encouraging" animation="wave" size={96} />`,
  },
];

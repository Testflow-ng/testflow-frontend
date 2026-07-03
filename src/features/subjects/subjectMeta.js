import { Atom, BookOpen, Brain, Calculator, FlaskConical, Landmark, ScrollText, Sigma, TrendingUp } from 'lucide-react';

// Presentational only (icon + tonal accent per subject). Not stored in the DB.
const META = {
  PHY102: { Icon: Atom, accent: 'bg-info/10 text-info' },
  CHM102: { Icon: FlaskConical, accent: 'bg-success/10 text-success' },
  MTH102: { Icon: Calculator, accent: 'bg-primary/10 text-primary' },
  STA112: { Icon: Sigma, accent: 'bg-secondary/10 text-secondary' },
  EGL102: { Icon: BookOpen, accent: 'bg-warning/10 text-warning' },
  GST112: { Icon: Landmark, accent: 'bg-danger/10 text-danger' },
  PHL102: { Icon: Brain, accent: 'bg-info/10 text-info' },
  ACC102: { Icon: ScrollText, accent: 'bg-success/10 text-success' },
  ECO102: { Icon: TrendingUp, accent: 'bg-blue-500/10 text-blue-500' },
};

const DEFAULT = { Icon: BookOpen, accent: 'bg-primary/10 text-primary' };

export const subjectMeta = (code) => META[code] ?? DEFAULT;

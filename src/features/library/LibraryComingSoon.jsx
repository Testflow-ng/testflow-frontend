import { Link } from 'react-router-dom';
import { BookOpen, Sparkles, GraduationCap, Eye } from 'lucide-react';
import { Badge, Button, Card, Reveal } from '../../components/ui/index.js';
import Mascot from '../../components/brand/Mascot.jsx';
import Screen, { PageHeader } from '../../components/layout/Screen.jsx';
import { useAuth } from '../auth/useAuth.js';

/**
 * Displayed when the Library is being stocked with books and study materials.
 */
function LibraryComingSoon() {
  const { user } = useAuth();
  const isAdmin = ['admin', 'super_admin'].includes(user?.role);

  return (
    <Screen width="xl">
      <PageHeader
        title="Library"
        subtitle="Past questions, lecture notes, and study material."
        action={
          <Badge variant="lime">
            <Sparkles size={12} aria-hidden="true" /> Adding books
          </Badge>
        }
      />
      <Reveal className="mt-6">
        <Card
          padding="lg"
          className="flex flex-col items-center gap-6 bg-[var(--brand-lavender)] text-center sm:flex-row sm:text-left"
        >
          <Mascot mood="thinking" animation="float" size={112} />
          <div className="flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">In progress</p>
            <h2 className="mt-1 font-heading text-2xl font-extrabold tracking-tight text-foreground-strong">
              We’re stocking the <em className="tf-accent font-normal">library shelves</em>
            </h2>
            <p className="mt-2 max-w-[54ch] text-sm leading-relaxed text-foreground">
              We are currently curating and uploading past questions, lecture materials, and textbooks for your courses. New books are arriving soon!
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
              <Link to="/courses">
                <Button leadingIcon={<GraduationCap size={16} />}>Practice courses</Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="outline">Go to dashboard</Button>
              </Link>
              {isAdmin && (
                <Link to="/library?preview=1">
                  <Button variant="ghost" leadingIcon={<Eye size={16} />}>Preview shelf (Admin)</Button>
                </Link>
              )}
            </div>
          </div>
        </Card>
      </Reveal>
    </Screen>
  );
}

export default LibraryComingSoon;

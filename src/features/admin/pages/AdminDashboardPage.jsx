import { Link } from 'react-router-dom';
import { Card } from '../../../components/ui/index.js';
import { BookOpen, FileQuestion, Users, LayoutDashboard } from 'lucide-react';

function AdminDashboardPage() {
  const adminLinks = [
    {
      title: 'Question Bank',
      description: 'Manage exam questions across all subjects.',
      href: '/admin/questions',
      icon: FileQuestion,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      title: 'Subjects',
      description: 'Add or edit subjects and categories.',
      href: '/admin/subjects',
      icon: BookOpen,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
    },
    {
      title: 'Students',
      description: 'View student performance and management.',
      href: '/admin/students',
      icon: Users,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-primary/10 p-2 rounded-lg">
          <LayoutDashboard className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground-strong">Admin Dashboard</h1>
          <p className="text-muted text-sm">Manage the TestFlow platform</p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {adminLinks.map((link) => (
          <Link key={link.href} to={link.href}>
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer p-6">
              <div className={`w-12 h-12 rounded-lg ${link.bg} flex items-center justify-center mb-4`}>
                <link.icon className={`w-6 h-6 ${link.color}`} />
              </div>
              <h2 className="text-lg font-semibold text-foreground-strong mb-2">{link.title}</h2>
              <p className="text-sm text-muted leading-relaxed">{link.description}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboardPage;

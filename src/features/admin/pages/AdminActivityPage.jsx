import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../api.js';
import { Spinner, Alert, Card, Button } from '../../../components/ui/index.js';
import { ChevronLeft, Clock, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminActivityFeed from '../components/AdminActivityFeed.jsx';
import { useState } from 'react';

function AdminActivityPage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/admin">
          <Button variant="ghost" size="sm" className="rounded-full p-2 h-10 w-10">
            <ChevronLeft size={20} />
          </Button>
        </Link>
        <div>
          <h1 className="font-heading text-2xl font-extrabold tracking-tight text-foreground-strong sm:text-3xl">
            System Audit Log
          </h1>
          <p className="mt-1 text-sm text-muted">
            Full history of administrative actions and system events.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
        <div className="space-y-6">
           <Card className="p-6">
              <AdminActivityFeed limit={50} />
           </Card>
        </div>

        <aside className="space-y-6">
           <Card className="p-6 bg-primary/5 border-primary/10">
              <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-4">Search Logs</h3>
              <div className="relative">
                 <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                 <input
                    type="text"
                    placeholder="Search action..."
                    className="w-full h-10 bg-white border border-border rounded-xl pl-9 pr-3 text-xs outline-none focus:border-primary transition-all"
                 />
              </div>
           </Card>

           <Card className="p-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-foreground-strong mb-4">Security Note</h3>
              <p className="text-[11px] leading-relaxed text-muted">
                 These logs are immutable and stored for compliance. They record the Actor, Action, Target, and Timestamp of every sensitive operation.
              </p>
           </Card>
        </aside>
      </div>
    </div>
  );
}

export default AdminActivityPage;

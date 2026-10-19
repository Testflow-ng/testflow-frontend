import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import SidebarShell from '../../components/SidebarShell.jsx';
import { ICON } from '../../components/ui/iconProps.js';
import { ADMIN_NAV } from './adminNav.js';

/** Replaces the student menu while you are inside /admin. Same sidebar design, admin links, and a way back. */
function AdminSidebar() {
  return (
    <SidebarShell
      homeTo="/admin"
      homeLabel="Admin overview"
      items={ADMIN_NAV}
      topSlot={<p className="px-3.5 text-[11px] font-bold uppercase tracking-[0.16em] text-primary">Admin</p>}
      footer={
        <div className="flex h-11 shrink-0 items-center px-2.5">
          <Link to="/dashboard" className="flex h-9 items-center gap-2.5 rounded-[10px] px-2 text-[15px] text-[#3d4a43] hover:bg-black/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <ArrowLeft {...ICON} /> Back to Testflow
          </Link>
        </div>
      }
    />
  );
}

export default AdminSidebar;

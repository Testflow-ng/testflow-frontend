import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import SidebarShell from '../../components/SidebarShell.jsx';
import { ICON } from '../../components/ui/iconProps.js';
import { authApi } from '../auth/api.js';
import { WORKSPACE_NAV } from './workspaceNav.js';

/** The organisation console's menu, in the same sidebar design as the rest of Testflow. */
function WorkspaceSidebar() {
  return (
    <SidebarShell
      homeTo="/workspace"
      homeLabel="Workspace overview"
      items={WORKSPACE_NAV}
      topSlot={<p className="px-3.5 text-[11px] font-bold uppercase tracking-[0.16em] text-primary">Testflow for Everyone</p>}
      footer={
        <div className="flex h-11 shrink-0 items-center px-2.5">
          <Link to="/dashboard" onClick={() => authApi.switchProduct('student').catch(() => {})} className="flex h-9 items-center gap-2.5 rounded-[10px] px-2 text-[15px] text-[#3d4a43] hover:bg-black/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <ArrowLeft {...ICON} /> Back to Testflow
          </Link>
        </div>
      }
    />
  );
}

export default WorkspaceSidebar;

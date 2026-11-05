import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Building2, LogOut } from 'lucide-react';
import SidebarShell from '../../components/SidebarShell.jsx';
import ProductSwitcher from '../../components/ProductSwitcher.jsx';
import { Button, Modal } from '../../components/ui/index.js';
import { ICON } from '../../components/ui/iconProps.js';
import { authApi } from '../auth/api.js';
import { useAuth } from '../auth/useAuth.js';
import { WORKSPACE_NAV } from './workspaceNav.js';
import { useOrganizations } from './useWorkspace.js';

/** The organisation console's menu, in the same sidebar design as the rest of Testflow. */
function WorkspaceSidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const { data: orgs } = useOrganizations();
  const org = Array.isArray(orgs) && orgs.length > 0 ? orgs[0] : null;

  const productSwitcherItems = [
    {
      key: 'everybody',
      label: org ? org.name : 'Everyone Workspace',
      description: 'Organization Workspace',
      icon: Building2,
      onSelect: () => navigate('/workspace'),
    },
    {
      key: 'student',
      label: 'Testflow CBT',
      description: 'Switch to Student Practice',
      icon: BookOpen,
      onSelect: () => {
        authApi.switchProduct('student').catch(() => {});
        navigate('/dashboard');
      },
    },
  ];

  const handleExitToStudent = () => {
    setLeaveModalOpen(false);
    authApi.switchProduct('student').catch(() => {});
    navigate('/dashboard');
  };

  const handleGlobalLogout = async () => {
    setLeaveModalOpen(false);
    await logout();
  };

  return (
    <>
      <SidebarShell
        homeTo="/workspace"
        homeLabel="Workspace overview"
        items={WORKSPACE_NAV}
        topSlot={<ProductSwitcher current="everybody" products={productSwitcherItems} />}
        footer={
          <div className="flex h-11 shrink-0 items-center justify-between px-2.5">
            <Link
              to="/dashboard"
              onClick={() => authApi.switchProduct('student').catch(() => {})}
              className="flex h-9 items-center gap-2 rounded-[10px] px-2 text-sm font-medium text-[#3d4a43] hover:bg-black/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <ArrowLeft {...ICON} size={15} /> Student CBT
            </Link>
            <button
              type="button"
              onClick={() => setLeaveModalOpen(true)}
              aria-label="Leave or sign out"
              title="Leave or sign out"
              className="flex size-8 items-center justify-center rounded-lg text-[#6f7a73] hover:bg-danger/10 hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <LogOut {...ICON} size={15} />
            </button>
          </div>
        }
      />
      
      <Modal
        open={leaveModalOpen}
        onOpenChange={setLeaveModalOpen}
        title="Leave Workspace"
        size="sm"
      >
        <div className="space-y-4 p-1">
          <p className="text-sm text-muted">
            You are managing <strong>{org?.name || 'your organization'}</strong>. How would you like to exit?
          </p>

          <div className="space-y-2 pt-2">
            <Button
              variant="primary"
              className="w-full justify-center"
              onClick={handleExitToStudent}
            >
              Back to Testflow CBT (Stay Logged In)
            </Button>
            <Button
              variant="outline"
              className="w-full justify-center text-danger hover:bg-danger/10 hover:text-danger border-border"
              onClick={handleGlobalLogout}
            >
              Sign Out of Testflow Entirely
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-center"
              onClick={() => setLeaveModalOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default WorkspaceSidebar;

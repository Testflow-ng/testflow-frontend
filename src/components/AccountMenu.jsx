import { Award, LogOut, Settings, User } from 'lucide-react';
import Avatar from './ui/Avatar.jsx';
import DropdownMenu from './ui/DropdownMenu.jsx';
import { useAuth } from '../features/auth/useAuth.js';

/** Avatar button that opens the account menu (profile, achievements, settings, sign out). */
function AccountMenu({ placement = 'bottom-end' }) {
  const { user, logout } = useAuth();
  if (!user) return null;
  return (
    <DropdownMenu
      placement={placement}
      trigger={(props) => (
        <button
          type="button"
          aria-label={`Account menu for ${user.fullName}`}
          className="flex items-center gap-2 rounded-full border border-border bg-surface p-1 pr-3 transition-colors hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          {...props}
        >
          <Avatar name={user.fullName} src={user.avatarUrl} size="sm" />
          <span className="hidden max-w-[110px] truncate text-sm font-semibold text-foreground-strong sm:block">
            {user.fullName.split(' ')[0]}
          </span>
        </button>
      )}
      items={[
        { label: 'Profile', icon: User, to: '/profile' },
        { label: 'Achievements', icon: Award, to: '/achievements' },
        { label: 'Settings', icon: Settings, to: '/settings' },
        { separator: true },
        { label: 'Sign out', icon: LogOut, danger: true, onSelect: logout },
      ]}
    />
  );
}

export default AccountMenu;

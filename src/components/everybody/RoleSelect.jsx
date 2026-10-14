import Select from '../ui/Select.jsx';

import { ORG_ROLES } from './roles.js';

/** Role picker for organisation members. The owner role is never assigned here. */
function RoleSelect({ value, onValueChange, label, disabled, className }) {
  return <Select value={value} onValueChange={onValueChange} options={ORG_ROLES} disabled={disabled} aria-label={label ?? 'Role'} className={className} />;
}

export default RoleSelect;

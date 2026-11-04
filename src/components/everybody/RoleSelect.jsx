import Select from '../ui/Select.jsx';

import { ORG_ROLES } from './roles.js';

/** Role picker for organisation members. The owner role is never assigned here. */
function RoleSelect({ value, onValueChange, label, disabled, className, options = ORG_ROLES }) {
  return <Select value={value} onValueChange={onValueChange} options={options} disabled={disabled} aria-label={label ?? 'Role'} className={className} />;
}

export default RoleSelect;

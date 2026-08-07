import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../../utils/cn.js';
import Input from './Input.jsx';
import IconButton from './IconButton.jsx';

/**
 * Password input with a show/hide toggle. Forwards ref + all props (id, aria-*,
 * react-hook-form registration) to the underlying input.
 *
 * In the `bare` variant the toggle sits inline beside the field rather than
 * absolutely over it, so it cannot overlap a long value on a narrow screen.
 */
const PasswordInput = forwardRef(function PasswordInput(
  { className, variant = 'outline', ...props },
  ref,
) {
  const [visible, setVisible] = useState(false);

  const toggle = (
    <IconButton
      size={variant === 'bare' ? 'sm' : 'md'}
      variant="ghost"
      onClick={() => setVisible((value) => !value)}
      aria-label={visible ? 'Hide password' : 'Show password'}
      aria-pressed={visible}
      tabIndex={-1}
      className={cn('shrink-0', variant !== 'bare' && 'absolute inset-y-0 right-0')}
    >
      {visible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
    </IconButton>
  );

  const field = (
    <Input
      ref={ref}
      type={visible ? 'text' : 'password'}
      variant={variant}
      className={cn(variant !== 'bare' && 'pr-12', className)}
      {...props}
    />
  );

  if (variant === 'bare') {
    return (
      <div className="flex items-center gap-1">
        <div className="min-w-0 flex-1">{field}</div>
        {toggle}
      </div>
    );
  }

  return (
    <div className="relative">
      {field}
      {toggle}
    </div>
  );
});

export default PasswordInput;

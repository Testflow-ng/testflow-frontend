import { forwardRef } from 'react';
import { cn } from '../../utils/cn.js';
import { buttonBase, buttonVariants } from './buttonClasses.js';

const sizes = {
  sm: 'h-9 w-9',
  md: 'h-11 w-11',
  lg: 'h-12 w-12',
};

/**
 * Square, icon-only button. `aria-label` is required for an accessible name;
 * the inner icon should be `aria-hidden`.
 */
const IconButton = forwardRef(function IconButton(
  { variant = 'ghost', size = 'md', type = 'button', className, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(buttonBase, buttonVariants[variant], sizes[size], className)}
      {...props}
    />
  );
});

export default IconButton;

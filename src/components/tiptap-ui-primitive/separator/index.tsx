import React from 'react';

export const Separator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>((props, ref) => (
  <div
    ref={ref}
    role="separator"
    style={{
      height: '1px',
      width: '100%',
      background: 'var(--gray-200, #e5e7eb)',
      margin: '0.5em 0',
    }}
    {...props}
  />
));

Separator.displayName = 'Separator'; 
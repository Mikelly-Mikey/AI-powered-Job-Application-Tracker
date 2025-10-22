import React, { ReactNode } from 'react';

interface VisuallyHiddenProps {
  children: ReactNode;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
}

const VisuallyHidden: React.FC<VisuallyHiddenProps> = ({
  children,
  as: Component = 'span',
  className = '',
  ...props
}) => {
  return (
    <Component
      className={`
        sr-only
        ${className}
      `}
      {...props}
    >
      {children}
    </Component>
  );
};

export default VisuallyHidden;

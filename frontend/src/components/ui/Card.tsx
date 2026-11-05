import React from 'react';

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <div
      className={`glass-card p-5 sm:p-6 rounded-[24px] bg-white/95 dark:bg-[#0b0b0b] border border-[#e3dede] dark:border-[#373535]/80 shadow-subtle dark:shadow-glass-dark ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <div className={`space-y-1.5 pb-4 border-b border-[#eee8e8] dark:border-[#1e1c1c] ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <h3
      className={`text-base sm:text-lg font-medium tracking-normal font-sans text-[#0c0909] dark:text-white ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
};

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <p className={`text-xs sm:text-sm font-mono text-[#6e6868] dark:text-[#9b9a9a] font-light leading-relaxed ${className}`} {...props}>
      {children}
    </p>
  );
};

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return <div className={`pt-4 ${className}`} {...props}>{children}</div>;
};

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <div
      className={`pt-4 mt-4 border-t border-[#eee8e8] dark:border-[#1e1c1c] flex items-center justify-between ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;


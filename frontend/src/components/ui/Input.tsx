import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, helperText, error, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium font-sans text-[#0c0909] dark:text-white"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-[#9b9a9a]">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full rounded-[24px] text-xs sm:text-sm font-mono bg-white dark:bg-[#0b0b0b] text-[#0c0909] dark:text-white placeholder:text-[#9b9a9a] dark:placeholder:text-[#9b9a9a]/70 border transition-all duration-150 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:bg-[#f5f2f2] dark:disabled:bg-[#181818] ${
              error
                ? 'border-[#ea2845] focus:border-[#ea2845] focus:ring-[#ea2845]/20'
                : 'border-[#ded9d9] dark:border-[#373535] focus:border-[#ea2845]/60 focus:ring-[#ea2845]/20'
            } ${leftIcon ? 'pl-10' : 'pl-4'} ${rightIcon ? 'pr-10' : 'pr-4'} py-2.5 min-h-[42px] ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 flex items-center text-[#9b9a9a]">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-[11px] font-mono text-[#ea2845] font-medium">{error}</p>}
        {helperText && !error && (
          <p className="text-[11px] font-mono text-[#6e6868] dark:text-[#9b9a9a]">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;


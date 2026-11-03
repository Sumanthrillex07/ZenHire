import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ text = 'Loading...', size = 'md' }) => {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6';

  return (
    <div className="flex flex-col items-center justify-center p-6 gap-3 text-slate-400">
      <Loader2 className={`${sizeClass} animate-spin text-emerald-400`} />
      {text && <p className="text-sm font-medium">{text}</p>}
    </div>
  );
};
export default LoadingSpinner;


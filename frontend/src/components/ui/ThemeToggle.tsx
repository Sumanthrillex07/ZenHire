import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', showLabel = false }) => {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={`relative inline-flex items-center justify-center rounded-full p-2 text-[#6e6868] hover:text-[#050303] dark:text-[#9b9a9a] dark:hover:text-white bg-[#f0eded] hover:bg-[#e5dfdf] dark:bg-[#1e1c1c] dark:hover:bg-[#282626] border border-[#ded9d9] dark:border-[#373535] transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#ea2845]/30 ${className}`}
    >
      <div className="relative w-4 h-4 flex items-center justify-center overflow-hidden">
        <Sun
          style={{ transitionDelay: '250ms' }}
          className={`w-4 h-4 text-amber-500 dark:text-amber-400 absolute transition-all duration-300 ease-in-out ${
            isDark ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0 pointer-events-none'
          }`}
        />
        <Moon
          style={{ transitionDelay: '250ms' }}
          className={`w-4 h-4 text-[#ea2845] absolute transition-all duration-300 ease-in-out ${
            isDark ? '-rotate-90 scale-0 opacity-0 pointer-events-none' : 'rotate-0 scale-100 opacity-100'
          }`}
        />
      </div>
      {showLabel && (
        <span className="ml-2 text-xs font-mono">
          {isDark ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  );
};

export default ThemeToggle;

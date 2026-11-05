import React from 'react';
import { Sparkles, Terminal, Shield, Cpu, Database } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#f0eded]/90 dark:bg-[#181818] border-t border-[#e3dede] dark:border-[#373535]/80 py-12 px-4 sm:px-6 lg:px-8 mt-auto rounded-t-[32px] transition-colors duration-150">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#ea2845] to-[#780f20] flex items-center justify-center shadow-md shadow-[#ea2845]/20">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-lg font-medium text-[#0c0909] dark:text-white tracking-normal font-sans">
              Zen<span className="text-[#ea2845]">Hire</span>
            </span>
          </div>
          <p className="text-xs font-mono text-[#6e6868] dark:text-[#9b9a9a] text-center md:text-left">
            AI-Powered Recruitment &amp; Talent Intelligence Platform &bull; Smarter Hiring. Better Matches.
          </p>
        </div>

        {/* Stack Badges styled as hairline terminal seams */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-mono text-[#6e6868] dark:text-[#9b9a9a]">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-[#0b0b0b] border border-[#ded9d9] dark:border-[#373535] text-[11px] font-light">
            <Terminal className="w-3 h-3 text-[#ea2845]" /> Java 21 / Spring Boot 3
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-[#0b0b0b] border border-[#ded9d9] dark:border-[#373535] text-[11px] font-light">
            <Cpu className="w-3 h-3 text-[#ffa657]" /> Gemini 1.5
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-[#0b0b0b] border border-[#ded9d9] dark:border-[#373535] text-[11px] font-light">
            <Database className="w-3 h-3 text-[#a5d6ff]" /> PostgreSQL 16
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-[#0b0b0b] border border-[#ded9d9] dark:border-[#373535] text-[11px] font-light">
            <Shield className="w-3 h-3 text-[#ea2845]" /> JWT / RBAC
          </span>
        </div>

        <div className="text-xs font-mono text-[#6e6868] dark:text-[#9b9a9a]">
          &copy; {new Date().getFullYear()} ZenHire Platform.
        </div>
      </div>
    </footer>
  );
};

export default Footer;

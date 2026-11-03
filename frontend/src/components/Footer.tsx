import React from 'react';
import { Sparkles, Terminal, Shield, Cpu, Database } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white/80 dark:bg-slate-950/80 border-t border-slate-200/80 dark:border-slate-900 py-12 px-4 sm:px-6 lg:px-8 mt-auto backdrop-blur-sm transition-colors duration-150">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Zen<span className="text-emerald-600 dark:text-emerald-400">Hire</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center md:text-left">
            AI-Powered Recruitment &amp; Talent Intelligence Platform &bull; Smarter Hiring. Better Matches.
          </p>
        </div>

        {/* Stack Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 text-xs text-slate-600 dark:text-slate-400">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-[11px] font-medium">
            <Terminal className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Java 21 / Spring Boot 3
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-[11px] font-medium">
            <Cpu className="w-3 h-3 text-indigo-600 dark:text-indigo-400" /> Gemini 1.5
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-[11px] font-medium">
            <Database className="w-3 h-3 text-blue-600 dark:text-blue-400" /> PostgreSQL 16
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-[11px] font-medium">
            <Shield className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> JWT / RBAC
          </span>
        </div>

        <div className="text-xs text-slate-400 dark:text-slate-500">
          &copy; {new Date().getFullYear()} ZenHire Platform.
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import React from 'react';
import { Sparkles, Terminal, Shield, Cpu, Database } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 py-12 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">
              Zen<span className="text-emerald-400">Hire</span>
            </span>
          </div>
          <p className="text-xs text-slate-400">
            AI-Powered Recruitment & Talent Intelligence Platform &bull; Smarter Hiring. Better Matches.
          </p>
        </div>

        {/* Stack Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-800">
            <Terminal className="w-3 h-3 text-emerald-400" /> Java 21 / Spring Boot 3
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-800">
            <Cpu className="w-3 h-3 text-indigo-400" /> Gemini 1.5 Flash
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-800">
            <Database className="w-3 h-3 text-blue-400" /> PostgreSQL 16
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-800">
            <Shield className="w-3 h-3 text-emerald-400" /> JWT / RBAC
          </span>
        </div>

        <div className="text-xs text-slate-500">
          &copy; {new Date().getFullYear()} ZenHire Inc. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
export default Footer;


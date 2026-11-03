import { BrowserRouter as Router, Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, Briefcase, FileText } from 'lucide-react';

export default function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
        {/* Navigation Bar */}
        <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl text-white">
              <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-extrabold">
                ZH
              </div>
              <span>Zen<span className="text-emerald-400">Hire</span></span>
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-xs px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                Phase 2 Scaffolded
              </span>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-grow flex items-center justify-center px-6 py-20">
          <div className="max-w-3xl text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold uppercase tracking-wider">
              <Sparkles size={14} className="text-emerald-400 animate-pulse" />
              Smarter Hiring. Better Matches.
            </div>

            <h1 className="text-5xl font-extrabold tracking-tight text-white leading-tight">
              AI-Powered Recruitment &amp; <br />
              <span className="text-gradient-primary">Talent Intelligence Platform</span>
            </h1>

            <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mx-auto">
              ZenHire automates resume intelligence with Apache PDFBox and Google Gemini 1.5, 
              verifies candidate capabilities through assessment gating, and provides transparent, 
              hybrid candidate-job matching.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 text-left">
              <div className="glass-card">
                <FileText className="text-emerald-400 mb-2" size={24} />
                <h3 className="font-bold text-white text-sm">Resume Intelligence</h3>
                <p className="text-xs text-slate-400 mt-1">Automatic PDF text parsing &amp; structured LLM extraction.</p>
              </div>

              <div className="glass-card">
                <ShieldCheck className="text-indigo-400 mb-2" size={24} />
                <h3 className="font-bold text-white text-sm">Assessment Gating</h3>
                <p className="text-xs text-slate-400 mt-1">Server-side grading that unlocks qualified applications.</p>
              </div>

              <div className="glass-card">
                <Briefcase className="text-amber-400 mb-2" size={24} />
                <h3 className="font-bold text-white text-sm">Hybrid Matching</h3>
                <p className="text-xs text-slate-400 mt-1">60% deterministic overlap + 40% LLM narrative evaluation.</p>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/5 py-6 text-center text-xs text-slate-500">
          ZenHire &copy; 2026. Built with Java 21, Spring Boot 3, React 18, and PostgreSQL.
        </footer>
      </div>
    </Router>
  );
}

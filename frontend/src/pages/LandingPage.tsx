import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  BrainCircuit, 
  Target, 
  FileCheck2, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Generation Talent Intelligence Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-6">
            Smarter Hiring. <br />
            <span className="text-gradient-primary">Better Matches.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed mb-10">
            ZenHire bridges candidates and recruiters with hybrid AI evaluation, verified skill assessments, and contextual recruitment intelligence. Say goodbye to keyword games and random scoring.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
            >
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/jobs"
              className="w-full sm:w-auto px-8 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl border border-slate-700 transition-colors flex items-center justify-center"
            >
              Explore Open Positions
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 text-center border-t border-slate-800/80 pt-10">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">60 / 40</div>
              <div className="text-xs text-slate-400 mt-1">Hybrid Match Ratio</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">100%</div>
              <div className="text-xs text-slate-400 mt-1">Gated Assessments</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-indigo-400">&lt; 1.5s</div>
              <div className="text-xs text-slate-400 mt-1">Resume Parsing Time</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400">Zero</div>
              <div className="text-xs text-slate-400 mt-1">Hallucinated Scores</div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Architectural Pillars */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Engineered for Precision & Fairness
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Traditional recruiting tools rely on opaque black-box AI. ZenHire introduces transparent, verifiable talent intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="glass-card flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5">
                <BrainCircuit className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">60/40 Hybrid AI Matching</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-4">
                Combines 60% deterministic skill overlap with 40% qualitative Gemini LLM narrative analysis. Evaluates project depth, tech stack relevance, and verified experience.
              </p>
            </div>
            <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Transparent Match Breakdown
            </div>
          </div>

          {/* Card 2 */}
          <div className="glass-card flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-5">
                <ShieldCheck className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Assessment Gating</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-4">
                Eliminates spam applications. Candidates must demonstrate competence by passing a role-specific, topic-tagged technical assessment before unlocking the apply button.
              </p>
            </div>
            <div className="text-xs text-indigo-400 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> DTO-Level Answer Masking
            </div>
          </div>

          {/* Card 3 */}
          <div className="glass-card flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-5">
                <FileCheck2 className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Resume Intelligence</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-4">
                Native PDF processing via Apache PDFBox 3.0 coupled with structured LLM JSON extraction and a resilient 120+ keyword heuristic fallback engine.
              </p>
            </div>
            <div className="text-xs text-cyan-400 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Zero-Loss Skill Discovery
            </div>
          </div>
        </div>
      </section>

      {/* Role Showcase CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        <div className="glass-card bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 p-8 sm:p-12 border border-slate-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 max-w-lg">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-indigo-500/20 text-indigo-300 text-xs font-semibold">
                <Target className="w-3.5 h-3.5" /> Fast-Track Your Recruitment
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white">
                Ready to experience modern talent intelligence?
              </h3>
              <p className="text-slate-400 text-sm">
                Join thousands of software engineers taking verified assessments and top hiring managers filling requisitions 3x faster.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Link
                to="/register"
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-center text-sm shadow-md transition-colors"
              >
                Join as Candidate
              </Link>
              <Link
                to="/register"
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-center text-sm shadow-md transition-colors"
              >
                Hire as Recruiter
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
export default LandingPage;

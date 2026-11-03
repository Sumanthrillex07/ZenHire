import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { 
  Sparkles, 
  BrainCircuit, 
  Target, 
  FileCheck2, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck,
  Cpu
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen animate-fadeIn">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-28 lg:py-36 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background via-card to-background border-b border-border/60">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Generation Talent Intelligence Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-foreground tracking-tight leading-[1.1] mb-6">
            Smarter Hiring. <br />
            <span className="text-gradient-primary">Better Matches.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground leading-relaxed mb-10">
            ZenHire bridges candidates and recruiters with transparent hybrid AI evaluation, verified technical assessments, and contextual recruitment intelligence. Say goodbye to keyword games and biased black-box algorithms.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full gap-2 shadow-lg shadow-emerald-500/20 font-bold">
                Get Started Free <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/jobs" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full font-semibold">
                Explore Open Positions
              </Button>
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 text-center border-t border-border/70 pt-10">
            <div className="p-2">
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground">60 / 40</div>
              <div className="text-xs text-muted-foreground font-medium mt-1">Hybrid Match Ratio</div>
            </div>
            <div className="p-2">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">100%</div>
              <div className="text-xs text-muted-foreground font-medium mt-1">Gated Assessments</div>
            </div>
            <div className="p-2">
              <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">&lt; 1.5s</div>
              <div className="text-xs text-muted-foreground font-medium mt-1">Resume Parsing Time</div>
            </div>
            <div className="p-2">
              <div className="text-2xl sm:text-3xl font-extrabold text-cyan-600 dark:text-cyan-400">Zero</div>
              <div className="text-xs text-muted-foreground font-medium mt-1">Hallucinated Scores</div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Architectural Pillars */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold">
            <Cpu className="w-3.5 h-3.5" /> Architectural Rigor
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Engineered for Precision & Fairness
          </h2>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto">
            Traditional recruiting tools rely on opaque black-box AI. ZenHire introduces transparent, verifiable talent intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="glass-card p-6 sm:p-8 flex flex-col justify-between hover:border-border transition-all group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                60/40 Hybrid AI Matching
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed mb-6 font-normal">
                Combines 60% deterministic skill overlap with 40% qualitative Gemini LLM narrative analysis. Evaluates project depth, tech stack relevance, and verified experience.
              </p>
            </div>
            <div className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1.5 pt-4 border-t border-border/70">
              <CheckCircle2 className="w-4 h-4" /> Transparent Match Breakdown
            </div>
          </div>

          {/* Card 2 */}
          <div className="glass-card p-6 sm:p-8 flex flex-col justify-between hover:border-border transition-all group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-5 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Assessment Gating
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed mb-6 font-normal">
                Eliminates spam applications. Candidates must demonstrate competence by passing a role-specific, topic-tagged technical assessment before unlocking the apply button.
              </p>
            </div>
            <div className="text-xs text-indigo-700 dark:text-indigo-400 font-semibold flex items-center gap-1.5 pt-4 border-t border-border/70">
              <CheckCircle2 className="w-4 h-4" /> DTO-Level Answer Masking
            </div>
          </div>

          {/* Card 3 */}
          <div className="glass-card p-6 sm:p-8 flex flex-col justify-between hover:border-border transition-all group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-5 text-cyan-600 dark:text-cyan-400 group-hover:scale-105 transition-transform">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                Resume Intelligence
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed mb-6 font-normal">
                Native PDF processing via Apache PDFBox 3.0 coupled with structured LLM JSON extraction and a resilient 120+ keyword heuristic fallback engine.
              </p>
            </div>
            <div className="text-xs text-cyan-700 dark:text-cyan-400 font-semibold flex items-center gap-1.5 pt-4 border-t border-border/70">
              <CheckCircle2 className="w-4 h-4" /> Zero-Loss Skill Discovery
            </div>
          </div>
        </div>
      </section>

      {/* Feature Comparison Matrix */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        <div className="glass-card p-6 sm:p-10 space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h3 className="text-xl sm:text-2xl font-bold text-foreground">Why ZenHire Beats Legacy ATS</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Built for engineering leaders who value skill accuracy over resume keyword manipulation.
            </p>
          </div>

          <div className="overflow-x-auto pt-4">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-border/80 text-muted-foreground font-semibold">
                  <th className="py-3 px-4">Recruitment Feature</th>
                  <th className="py-3 px-4 text-emerald-600 dark:text-emerald-400">ZenHire Platform</th>
                  <th className="py-3 px-4 text-muted-foreground">Legacy ATS Tools</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                <tr className="hover:bg-muted/30 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-foreground">Candidate Matching</td>
                  <td className="py-3.5 px-4 font-semibold text-emerald-600 dark:text-emerald-400">
                    60% Deterministic + 40% LLM Narrative
                  </td>
                  <td className="py-3.5 px-4 text-muted-foreground">Basic keyword count</td>
                </tr>
                <tr className="hover:bg-muted/30 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-foreground">Spam Defense</td>
                  <td className="py-3.5 px-4 font-semibold text-emerald-600 dark:text-emerald-400">
                    Role-specific Technical Assessment Gating
                  </td>
                  <td className="py-3.5 px-4 text-muted-foreground">None (Unfiltered spam)</td>
                </tr>
                <tr className="hover:bg-muted/30 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-foreground">Resume Extraction</td>
                  <td className="py-3.5 px-4 font-semibold text-emerald-600 dark:text-emerald-400">
                    Apache PDFBox + Gemini 1.5 Flash Fallback
                  </td>
                  <td className="py-3.5 px-4 text-muted-foreground">Fragile regex parsers</td>
                </tr>
                <tr className="hover:bg-muted/30 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-foreground">Security & Anti-Cheat</td>
                  <td className="py-3.5 px-4 font-semibold text-emerald-600 dark:text-emerald-400">
                    DTO-Level Answer Key Masking
                  </td>
                  <td className="py-3.5 px-4 text-muted-foreground">Answers exposed in DOM / JSON</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Role Showcase CTA Banner */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full mb-12">
        <div className="glass-card bg-gradient-to-r from-emerald-500/10 via-card to-indigo-500/10 p-8 sm:p-12 border border-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 max-w-lg text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-xs font-semibold">
                <Target className="w-3.5 h-3.5" /> Fast-Track Your Recruitment
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                Ready to experience modern talent intelligence?
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Join verified software engineers and top engineering leaders accelerating their hiring lifecycle.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
              <Link to="/register" className="w-full sm:w-auto">
                <Button variant="primary" size="md" className="w-full shadow-md font-bold">
                  Join as Candidate
                </Button>
              </Link>
              <Link to="/register" className="w-full sm:w-auto">
                <Button variant="indigo" size="md" className="w-full shadow-md font-bold">
                  Hire as Recruiter
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
export default LandingPage;
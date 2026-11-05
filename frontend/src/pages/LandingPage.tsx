import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { 
  Sparkles, 
  BrainCircuit, 
  FileCheck2, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen animate-fadeIn font-sans px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-12 sm:space-y-20 max-w-7xl mx-auto w-full">
      {/* Crimson Glow Hero Frame (32px radius from DESIGN.md) */}
      <section className="furnace-hero-frame p-6 sm:p-12 lg:p-20 relative overflow-hidden text-center">
        <div className="max-w-4xl mx-auto relative z-10 space-y-6">
          {/* Bracketed Mono Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ea2845]/10 border border-[#ea2845]/25 text-[#ea2845] font-mono text-xs tracking-tight">
            <Sparkles className="w-3.5 h-3.5 text-[#ea2845]" />
            <span>&#123; TALENT INTELLIGENCE ENGINE &#125;_</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-medium tracking-normal text-[#0c0909] dark:text-white leading-[1.05]">
            Smarter Hiring. <br />
            <span className="text-gradient-primary">Better Matches.</span>
          </h1>

          <p className="max-w-2xl mx-auto font-mono text-xs sm:text-sm text-[#6e6868] dark:text-[#9b9a9a] leading-relaxed font-light">
            ZenHire bridges candidates and recruiters with transparent hybrid AI evaluation, verified technical assessments, and contextual recruitment intelligence. Say goodbye to keyword games and biased black-box algorithms.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link to="/register" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full gap-2 font-semibold shadow-sm">
                Get Started Free <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/jobs" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full font-medium">
                Explore Open Positions
              </Button>
            </Link>
          </div>

          {/* Quick Metrics (Hairline Seam Grid from DESIGN.md) */}
          <div className="mt-12 sm:mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 text-center border-t border-[#e3dede] dark:border-[#373535]/80 pt-8 sm:pt-10">
            <div className="p-3">
              <div className="text-2xl sm:text-3xl font-medium font-sans text-[#0c0909] dark:text-white">60 / 40</div>
              <div className="text-xs font-mono text-[#6e6868] dark:text-[#9b9a9a] mt-1 font-light">&#123; HYBRID MATCH &#125;_</div>
            </div>
            <div className="p-3">
              <div className="text-2xl sm:text-3xl font-medium font-sans text-[#ea2845]">100%</div>
              <div className="text-xs font-mono text-[#6e6868] dark:text-[#9b9a9a] mt-1 font-light">&#123; GATED ASSESSMENTS &#125;_</div>
            </div>
            <div className="p-3">
              <div className="text-2xl sm:text-3xl font-medium font-sans text-[#0c0909] dark:text-white">&lt; 1.5s</div>
              <div className="text-xs font-mono text-[#6e6868] dark:text-[#9b9a9a] mt-1 font-light">&#123; RESUME PARSING &#125;_</div>
            </div>
            <div className="p-3">
              <div className="text-2xl sm:text-3xl font-medium font-sans text-[#ea2845]">Zero</div>
              <div className="text-xs font-mono text-[#6e6868] dark:text-[#9b9a9a] mt-1 font-light">&#123; HALLUCINATION &#125;_</div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Architectural Pillars */}
      <section className="space-y-10">
        <div className="text-center space-y-3">
          <div className="bracketed-eyebrow">
            &#123; ARCHITECTURAL RIGOR &#125;_
          </div>
          <h2 className="text-2xl sm:text-4xl font-medium tracking-normal text-[#0c0909] dark:text-white">
            Engineered for Precision &amp; Fairness
          </h2>
          <p className="font-mono text-xs sm:text-sm text-[#6e6868] dark:text-[#9b9a9a] max-w-xl mx-auto font-light leading-relaxed">
            Traditional recruiting tools rely on opaque black-box AI. ZenHire introduces transparent, verifiable talent intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="glass-card rounded-[24px] bg-white dark:bg-[#181818] border border-[#e3dede] dark:border-[#373535] p-6 sm:p-8 flex flex-col justify-between hover:border-[#ea2845]/40 transition-all group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#ea2845]/10 border border-[#ea2845]/25 flex items-center justify-center mb-5 text-[#ea2845] group-hover:scale-105 transition-transform">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-medium text-[#0c0909] dark:text-white mb-2 font-sans group-hover:text-[#ea2845] transition-colors">
                60/40 Hybrid AI Matching
              </h3>
              <p className="font-mono text-xs text-[#6e6868] dark:text-[#9b9a9a] leading-relaxed mb-6 font-light">
                Combines 60% deterministic skill overlap with 40% qualitative Gemini LLM narrative analysis. Evaluates project depth, tech stack relevance, and verified experience.
              </p>
            </div>
            <div className="text-xs font-mono text-[#ea2845] font-normal flex items-center gap-1.5 pt-4 border-t border-[#eee8e8] dark:border-[#1e1c1c]">
              <CheckCircle2 className="w-4 h-4" /> Transparent Match Breakdown
            </div>
          </div>

          {/* Card 2 */}
          <div className="glass-card rounded-[24px] bg-white dark:bg-[#181818] border border-[#e3dede] dark:border-[#373535] p-6 sm:p-8 flex flex-col justify-between hover:border-[#ea2845]/40 transition-all group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#ea2845]/10 border border-[#ea2845]/25 flex items-center justify-center mb-5 text-[#ea2845] group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-medium text-[#0c0909] dark:text-white mb-2 font-sans group-hover:text-[#ea2845] transition-colors">
                Assessment Gating
              </h3>
              <p className="font-mono text-xs text-[#6e6868] dark:text-[#9b9a9a] leading-relaxed mb-6 font-light">
                Eliminates spam applications. Candidates must demonstrate competence by passing a role-specific, topic-tagged technical assessment before unlocking the apply button.
              </p>
            </div>
            <div className="text-xs font-mono text-[#ea2845] font-normal flex items-center gap-1.5 pt-4 border-t border-[#eee8e8] dark:border-[#1e1c1c]">
              <CheckCircle2 className="w-4 h-4" /> DTO-Level Answer Masking
            </div>
          </div>

          {/* Card 3 */}
          <div className="glass-card rounded-[24px] bg-white dark:bg-[#181818] border border-[#e3dede] dark:border-[#373535] p-6 sm:p-8 flex flex-col justify-between hover:border-[#ea2845]/40 transition-all group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#ea2845]/10 border border-[#ea2845]/25 flex items-center justify-center mb-5 text-[#ea2845] group-hover:scale-105 transition-transform">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-medium text-[#0c0909] dark:text-white mb-2 font-sans group-hover:text-[#ea2845] transition-colors">
                Resume Intelligence
              </h3>
              <p className="font-mono text-xs text-[#6e6868] dark:text-[#9b9a9a] leading-relaxed mb-6 font-light">
                Native PDF processing via Apache PDFBox 3.0 coupled with structured LLM JSON extraction and a resilient 120+ keyword heuristic fallback engine.
              </p>
            </div>
            <div className="text-xs font-mono text-[#ea2845] font-normal flex items-center gap-1.5 pt-4 border-t border-[#eee8e8] dark:border-[#1e1c1c]">
              <CheckCircle2 className="w-4 h-4" /> Zero-Loss Skill Discovery
            </div>
          </div>
        </div>
      </section>

      {/* Feature Comparison Matrix */}
      <section className="w-full">
        <div className="glass-card rounded-[24px] bg-white dark:bg-[#0b0b0b] border border-[#e3dede] dark:border-[#373535] p-6 sm:p-10 space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <div className="bracketed-eyebrow">&#123; BENCHMARK &#125;_</div>
            <h3 className="text-xl sm:text-2xl font-medium text-[#0c0909] dark:text-white font-sans">
              Why ZenHire Beats Legacy ATS
            </h3>
            <p className="font-mono text-xs sm:text-sm text-[#6e6868] dark:text-[#9b9a9a] font-light">
              Built for engineering leaders who value skill accuracy over resume keyword manipulation.
            </p>
          </div>

          <div className="overflow-x-auto pt-4 font-mono text-xs sm:text-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#e3dede] dark:border-[#1e1c1c] text-[#6e6868] dark:text-[#9b9a9a]">
                  <th className="py-3 px-4 font-normal">Recruitment Feature</th>
                  <th className="py-3 px-4 text-[#ea2845] font-medium">ZenHire Platform</th>
                  <th className="py-3 px-4 text-[#6e6868] dark:text-[#9b9a9a] font-light">Legacy ATS Tools</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eee8e8] dark:divide-[#1e1c1c]">
                <tr className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <td className="py-3.5 px-4 font-sans font-medium text-[#0c0909] dark:text-white">Candidate Matching</td>
                  <td className="py-3.5 px-4 font-mono text-[#ea2845]">
                    60% Deterministic + 40% LLM Narrative
                  </td>
                  <td className="py-3.5 px-4 font-light text-[#6e6868] dark:text-[#9b9a9a]">Basic keyword count</td>
                </tr>
                <tr className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <td className="py-3.5 px-4 font-sans font-medium text-[#0c0909] dark:text-white">Spam Defense</td>
                  <td className="py-3.5 px-4 font-mono text-[#ea2845]">
                    Role-specific Assessment Gating
                  </td>
                  <td className="py-3.5 px-4 font-light text-[#6e6868] dark:text-[#9b9a9a]">None (Unfiltered spam)</td>
                </tr>
                <tr className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <td className="py-3.5 px-4 font-sans font-medium text-[#0c0909] dark:text-white">Resume Extraction</td>
                  <td className="py-3.5 px-4 font-mono text-[#ea2845]">
                    Apache PDFBox + Gemini 1.5 Flash Fallback
                  </td>
                  <td className="py-3.5 px-4 font-light text-[#6e6868] dark:text-[#9b9a9a]">Fragile regex parsers</td>
                </tr>
                <tr className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <td className="py-3.5 px-4 font-sans font-medium text-[#0c0909] dark:text-white">Security &amp; Anti-Cheat</td>
                  <td className="py-3.5 px-4 font-mono text-[#ea2845]">
                    DTO-Level Answer Key Masking
                  </td>
                  <td className="py-3.5 px-4 font-light text-[#6e6868] dark:text-[#9b9a9a]">Answers exposed in DOM / JSON</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Role Showcase CTA Banner */}
      <section className="w-full pb-8">
        <div className="furnace-hero-frame p-8 sm:p-12 border border-[#e3dede] dark:border-[#373535]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 max-w-lg text-center md:text-left">
              <div className="bracketed-eyebrow">&#123; GET STARTED &#125;_</div>
              <h3 className="text-2xl sm:text-3xl font-medium text-[#0c0909] dark:text-white font-sans tracking-tight">
                Ready to experience modern talent intelligence?
              </h3>
              <p className="font-mono text-xs sm:text-sm text-[#6e6868] dark:text-[#9b9a9a] font-light leading-relaxed">
                Join verified software engineers and top engineering leaders accelerating their hiring lifecycle.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
              <Link to="/register" className="w-full sm:w-auto">
                <Button variant="primary" size="md" className="w-full shadow-sm font-semibold">
                  Join as Candidate
                </Button>
              </Link>
              <Link to="/register" className="w-full sm:w-auto">
                <Button variant="indigo" size="md" className="w-full shadow-sm font-semibold">
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
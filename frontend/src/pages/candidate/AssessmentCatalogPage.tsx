import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { assessmentApi } from '../../api/assessmentApi';
import { TestSummary } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import { CategoryBadge } from '../../components/Badge';
import { CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export const AssessmentCatalogPage: React.FC = () => {
  const [tests, setTests] = useState<TestSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    try {
      const data = await assessmentApi.getAllTests();
      setTests(data);
    } catch (err) {
      console.error('Failed to load assessment catalog', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading technical assessment catalog..." size="lg" />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-cyan-500/10 text-cyan-400 text-xs font-semibold mb-2">
          <ShieldCheck className="w-3.5 h-3.5" /> Technical Verification
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Role Assessment & Gating Catalog
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-2xl">
          Pass role-specific assessments to satisfy application gates, verify your technical competencies, and rank higher on recruiter candidate boards.
        </p>
      </div>

      {/* Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tests.map((test) => (
          <div
            key={test.id}
            className="glass-card hover:border-slate-700 flex flex-col justify-between transition-all"
          >
            <div>
              <div className="flex items-center justify-between gap-3 mb-3">
                {test.roleCategory ? (
                  <CategoryBadge category={test.roleCategory} />
                ) : (
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                    General Aptitude
                  </span>
                )}

                {test.passed ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified Pass
                  </span>
                ) : test.hasAttempted ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    <AlertCircle className="w-3.5 h-3.5" /> Not Passed Yet
                  </span>
                ) : (
                  <span className="text-xs text-slate-500">Unattempted</span>
                )}
              </div>

              <h3 className="text-lg font-bold text-white mb-2">{test.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Evaluates core engineering concepts, algorithm design, system design, and role-specific technical problem solving.
              </p>

              {/* Score Requirements */}
              <div className="mt-5 p-3.5 bg-slate-900/60 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400">Pass Score Required:</span>
                  <span className="ml-1.5 font-bold text-white">{test.passScore}%</span>
                </div>
                {test.hasAttempted && (
                  <div>
                    <span className="text-slate-400">Your Highest:</span>
                    <span
                      className={`ml-1.5 font-bold ${
                        test.passed ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {test.highestScore}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Footer */}
            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Untimed &bull; Topic-tagged questions
              </span>

              <Link
                to={`/candidate/assessments/${test.id}`}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  test.passed
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md'
                }`}
              >
                {test.passed ? 'Retake for Score' : test.hasAttempted ? 'Retry Assessment' : 'Start Assessment'}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default AssessmentCatalogPage;

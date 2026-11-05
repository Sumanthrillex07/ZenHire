import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { assessmentApi } from '../../api/assessmentApi';
import { TestSummary } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import { CategoryBadge } from '../../components/Badge';
import Button from '../../components/ui/Button';
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-crimson/10 text-crimson border border-crimson/25 font-mono text-xs tracking-wider uppercase mb-3">
          <ShieldCheck className="w-3.5 h-3.5" /> &#123; ROLE ASSESSMENT REPERTORY &#125;_
        </div>
        <h1 className="text-2xl sm:text-4xl font-display font-medium text-foreground tracking-tight">
          Role Assessment & Gating Catalog
        </h1>
        <p className="font-mono text-xs sm:text-sm text-pewter dark:text-pewter light:text-slate-600 mt-2 max-w-2xl leading-relaxed">
          Pass role-specific assessments to satisfy application gates, verify your technical competencies, and rank higher on recruiter candidate boards.
        </p>
      </div>

      {/* Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tests.map((test) => (
          <div
            key={test.id}
            className="glass-card hover:border-crimson/50 p-6 sm:p-7 flex flex-col justify-between transition-all group rounded-[24px] border border-smoke/70 bg-carbon"
          >
            <div>
              <div className="flex items-center justify-between gap-3 mb-4">
                {test.roleCategory ? (
                  <CategoryBadge category={test.roleCategory} />
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-medium bg-ash text-pewter border border-smoke/70">
                    General Aptitude
                  </span>
                )}

                {test.passed ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified Pass
                  </span>
                ) : test.hasAttempted ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    <AlertCircle className="w-3.5 h-3.5" /> Not Passed Yet
                  </span>
                ) : (
                  <span className="text-xs font-mono text-pewter">Unattempted</span>
                )}
              </div>

              <h3 className="text-lg font-display font-medium text-foreground mb-2 group-hover:text-crimson transition-colors">
                {test.title}
              </h3>
              <p className="font-mono text-xs text-pewter leading-relaxed">
                Evaluates core engineering concepts, algorithm design, system design, and role-specific technical problem solving.
              </p>

              {/* Score Requirements */}
              <div className="mt-5 p-3.5 bg-ash rounded-[16px] border border-smoke/70 flex items-center justify-between font-mono text-xs">
                <div>
                  <span className="text-pewter">Pass Score Required:</span>
                  <span className="ml-2 font-bold text-foreground">{test.passScore}%</span>
                </div>
                {test.hasAttempted && (
                  <div>
                    <span className="text-pewter">Your Highest:</span>
                    <span
                      className={`ml-2 font-bold ${
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
            <div className="mt-6 pt-4 border-t border-smoke/70 flex items-center justify-between">
              <span className="font-mono text-[11px] text-pewter">
                Untimed &bull; Topic-tagged questions
              </span>

              <Link to={`/candidate/assessments/${test.id}`}>
                <Button
                  variant={test.passed ? 'outline' : 'primary'}
                  size="sm"
                  className="gap-1.5"
                >
                  {test.passed ? 'Retake for Score' : test.hasAttempted ? 'Retry Assessment' : 'Start Assessment'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default AssessmentCatalogPage;
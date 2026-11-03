import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { candidateApi } from '../../api/candidateApi';
import { CandidateDashboardData, CandidateAnalysisData } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import { 
  FileText, 
  Briefcase, 
  Award, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Compass, 
  Sparkles,
  Upload
} from 'lucide-react';
import { CategoryBadge } from '../../components/Badge';

export const CandidateDashboard: React.FC = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<CandidateDashboardData | null>(null);
  const [analysis, setAnalysis] = useState<CandidateAnalysisData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [dashData, analyticsData] = await Promise.all([
          candidateApi.getDashboard(),
          candidateApi.getAnalytics(),
        ]);
        setDashboard(dashData);
        setAnalysis(analyticsData);
      } catch (err) {
        console.error('Failed to load candidate dashboard', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading candidate workspace..." size="lg" />;
  }

  const passedTestsCount = dashboard?.tests.filter((t) => t.passed).length || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="glass-card bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/30 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Candidate Workspace
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Track your job applications, verified technical credentials, and personalized AI match scores all in one place.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/jobs"
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-md transition-colors flex items-center gap-2"
          >
            <Briefcase className="w-4 h-4" /> Browse Jobs
          </Link>
          <Link
            to="/candidate/resume"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs sm:text-sm border border-slate-700 transition-colors flex items-center gap-2"
          >
            <Upload className="w-4 h-4" /> {dashboard?.hasResume ? 'Update Resume' : 'Upload Resume'}
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Card 1: Resume Status */}
        <div className="glass-card flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
            dashboard?.hasResume ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
          }`}>
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Resume Intelligence</div>
            <div className="text-lg font-bold text-white mt-0.5">
              {dashboard?.hasResume ? 'Parsed & Verified' : 'Resume Missing'}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {dashboard?.hasResume
                ? `Updated: ${new Date(dashboard.resumeUploadedAt || '').toLocaleDateString()}`
                : 'Upload PDF to unlock match scoring'}
            </div>
          </div>
        </div>

        {/* Card 2: Applications Count */}
        <div className="glass-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Active Applications</div>
            <div className="text-lg font-bold text-white mt-0.5">
              {dashboard?.applicationsCount ?? 0}
            </div>
            <Link to="/candidate/applications" className="text-[11px] text-indigo-400 hover:underline mt-0.5 block">
              View pipeline details &rarr;
            </Link>
          </div>
        </div>

        {/* Card 3: Assessments Passed */}
        <div className="glass-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Verified Credentials</div>
            <div className="text-lg font-bold text-white mt-0.5">
              {passedTestsCount} / {dashboard?.tests.length || 0} Passed
            </div>
            <Link to="/candidate/assessments" className="text-[11px] text-cyan-400 hover:underline mt-0.5 block">
              Take assessments &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Analytics & Skill Diagnostic Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Strengths & Focus Areas */}
        <div className="glass-card lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                Skill Accuracy & Knowledge Diagnostics
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Topic-level performance calculated from your verified technical assessment attempts.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3">
                <CheckCircle2 className="w-4 h-4" />
                Verified Strengths (&ge; 70%)
              </div>
              {analysis && analysis.strongTopics.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {analysis.strongTopics.map((topic, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-lg text-xs font-medium"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  No verified high-accuracy topics yet. Take role assessments to showcase your technical strengths.
                </p>
              )}
            </div>

            {/* Growth Areas */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">
                <AlertTriangle className="w-4 h-4" />
                Recommended Focus Areas (&lt; 70%)
              </div>
              {analysis && analysis.weakTopics.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {analysis.weakTopics.map((topic, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-lg text-xs font-medium"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  No weak topics flagged. Great work keeping your domain accuracy high!
                </p>
              )}
            </div>
          </div>

          {/* Recommended Career Roles */}
          {analysis && analysis.recommendedRoles.length > 0 && (
            <div className="border-t border-slate-800 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold">
                <Compass className="w-4 h-4 text-indigo-400" />
                <span>AI Recommended Roles:</span>
              </div>
              <div className="flex items-center gap-2">
                {analysis.recommendedRoles.map((roleCat) => (
                  <CategoryBadge key={roleCat} category={roleCat} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Assessment Gating Quick Catalog */}
        <div className="glass-card space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-cyan-400" />
              Role Gating Status
            </h3>
            <Link to="/candidate/assessments" className="text-xs text-cyan-400 hover:underline">
              All Tests &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {dashboard?.tests.map((test) => (
              <div
                key={test.id}
                className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-semibold text-white">{test.title}</h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    <span>Pass: {test.passScore}%</span>
                    {test.hasAttempted && (
                      <span className="text-slate-300">
                        &bull; Best: <b className="text-white">{test.highestScore}%</b>
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  {test.passed ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      PASSED
                    </span>
                  ) : test.hasAttempted ? (
                    <Link
                      to={`/candidate/assessments/${test.id}`}
                      className="px-2.5 py-1 rounded text-[11px] font-medium bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30"
                    >
                      Retake
                    </Link>
                  ) : (
                    <Link
                      to={`/candidate/assessments/${test.id}`}
                      className="px-2.5 py-1 rounded text-[11px] font-medium bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/30"
                    >
                      Start
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default CandidateDashboard;

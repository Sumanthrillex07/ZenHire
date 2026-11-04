import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { candidateApi } from '../../api/candidateApi';
import { jobApi } from '../../api/jobApi';
import { applicationApi } from '../../api/applicationApi';
import { CandidateDashboardData, CandidateAnalysisData, Job, Application } from '../../types';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { CategoryBadge, ApplicationStatusBadge } from '../../components/Badge';
import { 
  FileText, 
  Briefcase, 
  Award, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Compass, 
  Sparkles,
  Upload,
  Building2,
  ArrowRight,
  Clock,
  ArrowUpRight,
  Calendar
} from 'lucide-react';

export const CandidateDashboard: React.FC = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<CandidateDashboardData | null>(null);
  const [analysis, setAnalysis] = useState<CandidateAnalysisData | null>(null);
  const [openJobs, setOpenJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [dashResult, analyticsResult, jobsResult, appsResult] = await Promise.allSettled([
          candidateApi.getDashboard(),
          candidateApi.getAnalytics(),
          jobApi.getJobs({ size: 6, status: 'OPEN' }),
          applicationApi.getCandidateApplications(),
        ]);

        if (dashResult.status === 'fulfilled') {
          setDashboard(dashResult.value);
        } else {
          console.warn('Failed to load candidate dashboard metrics', dashResult.reason);
        }

        if (analyticsResult.status === 'fulfilled') {
          setAnalysis(analyticsResult.value);
        } else {
          console.warn('Failed to load candidate analytics', analyticsResult.reason);
        }

        if (jobsResult.status === 'fulfilled') {
          setOpenJobs(jobsResult.value?.content || []);
        }

        if (appsResult.status === 'fulfilled') {
          setApplications(appsResult.value || []);
        }
      } catch (err) {
        console.error('Unexpected error loading candidate dashboard', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const appliedJobIds = useMemo(
    () => new Set(applications.map((app) => app.jobId)),
    [applications]
  );

  const sortedOpenJobs = useMemo(() => {
    return [...openJobs].sort((a, b) => {
      const aApplied = appliedJobIds.has(a.id);
      const bApplied = appliedJobIds.has(b.id);
      if (aApplied !== bApplied) {
        return aApplied ? 1 : -1; // Unapplied jobs go up, applied jobs go down
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // Newest first
    });
  }, [openJobs, appliedJobIds]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
        <div className="glass-card p-8 rounded-2xl space-y-3">
          <div className="skeleton-shimmer h-6 w-40 rounded-lg" />
          <div className="skeleton-shimmer h-8 w-72 rounded-lg" />
          <div className="skeleton-shimmer h-4 w-96 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  const passedTestsCount = dashboard?.tests.filter((t) => t.passed).length || 0;
  const activeAppsCount = applications.length > 0 ? applications.length : (dashboard?.applicationsCount ?? 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Welcome Hero Banner */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-200/80 dark:border-slate-800 bg-gradient-to-r from-emerald-50/50 via-white to-indigo-50/30 dark:from-slate-900 dark:via-slate-900/90 dark:to-emerald-950/20 shadow-subtle dark:shadow-glass-dark">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold mb-1 border border-emerald-500/20">
            <Sparkles className="w-3.5 h-3.5" /> Candidate Intelligence Workspace
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
            Track verified technical credentials, explore active employer requisitions, and benchmark your match score with hybrid AI intelligence.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/jobs"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all flex items-center gap-2 active:scale-95"
          >
            <Briefcase className="w-4 h-4" /> Browse Jobs
          </Link>
          <Link
            to="/candidate/resume"
            className="px-4 py-2.5 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-800 dark:text-white font-semibold rounded-xl text-xs sm:text-sm border border-slate-300 dark:border-slate-700 transition-all flex items-center gap-2 shadow-2xs active:scale-95"
          >
            <Upload className="w-4 h-4" /> {dashboard?.hasResume ? 'Update Resume' : 'Upload Resume'}
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Card 1: Resume Status */}
        <div className="glass-card flex items-center gap-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:translate-y-[-2px] transition-all">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              dashboard?.hasResume
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                : 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
            }`}
          >
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Resume Status</div>
            <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-0.5">
              {dashboard?.hasResume ? 'Parsed & Verified' : 'Resume Required'}
            </div>
            <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              {dashboard?.hasResume
                ? `Updated: ${new Date(dashboard.resumeUploadedAt || '').toLocaleDateString()}`
                : 'Upload PDF to unlock match scoring'}
            </div>
          </div>
        </div>

        {/* Card 2: Applications Count */}
        <div className="glass-card flex items-center gap-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:translate-y-[-2px] transition-all">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Active Applications</div>
            <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-0.5">
              {activeAppsCount}
            </div>
            <Link
              to="/candidate/applications"
              className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline mt-0.5 inline-flex items-center gap-1 font-semibold"
            >
              View pipeline details <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Card 3: Assessments Passed */}
        <div className="glass-card flex items-center gap-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:translate-y-[-2px] transition-all">
          <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Verified Credentials</div>
            <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-0.5">
              {passedTestsCount} / {dashboard?.tests.length || 0} Passed
            </div>
            <Link
              to="/candidate/assessments"
              className="text-[11px] text-cyan-600 dark:text-cyan-400 hover:underline mt-0.5 inline-flex items-center gap-1 font-semibold"
            >
              Take assessments <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Active Application Pipeline Preview Section */}
      {applications.length > 0 && (
        <div className="glass-card space-y-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Active Pipeline ({applications.length})
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Real-time tracking for your submitted applications and interview schedules.
              </p>
            </div>
            <Link
              to="/candidate/applications"
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 transition-colors"
            >
              All Applications ({applications.length}) &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {applications.slice(0, 3).map((app) => (
              <div
                key={app.id}
                className="bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between space-y-3 hover:border-indigo-500/40 transition-all hover:-translate-y-0.5 shadow-subtle dark:shadow-sm"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <ApplicationStatusBadge status={app.status} />
                    {app.matchScore != null && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                        {app.matchScore}% Match
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-1">
                      <Link to={`/jobs/${app.jobId}`}>{app.jobTitle}</Link>
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span className="font-medium text-slate-700 dark:text-slate-300">{app.companyName}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span>Applied {new Date(app.appliedAt).toLocaleDateString()}</span>
                  </div>

                  {app.interview && (
                    <div className="p-2.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/40 text-xs space-y-1">
                      <div className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        Interview Scheduled
                      </div>
                      <div className="text-[11px] text-blue-700 dark:text-blue-300/90">
                        {new Date(app.interview.scheduledTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })} ({app.interview.mode})
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <CategoryBadge category={app.roleCategory} />
                  <Link
                    to="/candidate/applications"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    View Status &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics & Skill Diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Strengths & Focus Areas */}
        <div className="glass-card lg:col-span-2 space-y-6 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Technical Accuracy &amp; Skill Diagnostics
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Calculated from candidate assessment submissions across technical domains.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-3">
                <CheckCircle2 className="w-4 h-4" />
                Verified Strengths (&ge; 70%)
              </div>
              {analysis && analysis.strongTopics.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {analysis.strongTopics.map((topic, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-300 rounded-lg text-xs font-medium"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No verified high-accuracy topics yet. Take role assessments to showcase technical competencies.
                </p>
              )}
            </div>

            {/* Growth Areas */}
            <div className="bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-3">
                <AlertTriangle className="w-4 h-4" />
                Recommended Focus Areas (&lt; 70%)
              </div>
              {analysis && analysis.weakTopics.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {analysis.weakTopics.map((topic, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-300 rounded-lg text-xs font-medium"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No weak topics flagged. Great work keeping domain accuracy high!
                </p>
              )}
            </div>
          </div>

          {/* Recommended Career Roles */}
          {analysis && analysis.recommendedRoles.length > 0 && (
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-semibold">
                <Compass className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
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
        <div className="glass-card space-y-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              Role Gating Status
            </h3>
            <Link to="/candidate/assessments" className="text-xs text-cyan-600 dark:text-cyan-400 font-semibold hover:underline">
              All Tests &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {dashboard?.tests.map((test) => (
              <div
                key={test.id}
                className="p-3 bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 rounded-xl flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{test.title}</h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    <span>Pass: {test.passScore}%</span>
                    {test.hasAttempted && (
                      <span>
                        &bull; Best: <b className="text-slate-800 dark:text-white">{test.highestScore}%</b>
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  {test.passed ? (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30">
                      PASSED
                    </span>
                  ) : test.hasAttempted ? (
                    <Link
                      to={`/candidate/assessments/${test.id}`}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:hover:bg-amber-500/30 dark:border-amber-500/30 transition-colors"
                    >
                      Retake
                    </Link>
                  ) : (
                    <Link
                      to={`/candidate/assessments/${test.id}`}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border border-cyan-200 dark:bg-cyan-500/20 dark:text-cyan-300 dark:hover:bg-cyan-500/30 dark:border-cyan-500/30 transition-colors"
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

      {/* Recruiter Job Requisitions Section */}
      <div className="glass-card space-y-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Latest Openings from Enterprise Recruiters
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live engineering requisitions posted by verified employers. Pass domain assessments to unlock 1-click applications.
            </p>
          </div>
          <Link
            to="/jobs"
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 transition-colors"
          >
            Browse All ({openJobs.length}) Jobs <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {sortedOpenJobs.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500 dark:text-slate-400">
            No open requisitions currently available. Check back soon for new opportunities!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedOpenJobs.map((job) => {
              const isApplied = appliedJobIds.has(job.id);
              return (
                <div
                  key={job.id}
                  className={`bg-white/80 dark:bg-slate-900/60 border ${
                    isApplied
                      ? 'border-emerald-500/30 dark:border-emerald-500/20 opacity-90'
                      : 'border-slate-200/80 dark:border-slate-800/80 hover:border-emerald-500/40 dark:hover:border-slate-700'
                  } rounded-2xl p-4 flex flex-col justify-between transition-all hover:-translate-y-0.5 shadow-subtle dark:shadow-sm`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <CategoryBadge category={job.roleCategory} />
                        {isApplied && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            Applied
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(job.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors line-clamp-1">
                        <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                        <Building2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span className="font-medium text-slate-700 dark:text-slate-300">{job.companyName}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {job.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {job.requiredSkills.slice(0, 3).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700/60"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.requiredSkills.length > 3 && (
                        <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500">
                          +{job.requiredSkills.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">
                      {job.applicantsCount} {job.applicantsCount === 1 ? 'applicant' : 'applicants'}
                    </span>
                    {isApplied ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/25 cursor-not-allowed">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        Applied
                      </span>
                    ) : (
                      <Link
                        to={`/jobs/${job.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors"
                      >
                        View &amp; Apply &rarr;
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateDashboard;

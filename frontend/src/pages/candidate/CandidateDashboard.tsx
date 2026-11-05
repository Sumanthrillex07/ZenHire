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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in font-sans">
      {/* Welcome Hero Banner (32px radius from DESIGN.md) */}
      <div className="furnace-hero-frame p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-[#e3dede] dark:border-[#373535] shadow-subtle dark:shadow-glass-dark">
        <div className="space-y-1.5">
          <div className="bracketed-eyebrow mb-1">
            &#123; CANDIDATE INTELLIGENCE WORKSPACE &#125;_
          </div>
          <h1 className="text-2xl sm:text-3xl font-medium text-[#0c0909] dark:text-white tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="font-mono text-xs sm:text-sm text-[#6e6868] dark:text-[#9b9a9a] max-w-xl leading-relaxed font-light">
            Track verified technical credentials, explore active employer requisitions, and benchmark your match score with hybrid AI intelligence.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/jobs"
            className="px-4 py-2.5 bg-[#050303] text-white dark:bg-white dark:text-[#050303] hover:opacity-90 font-semibold rounded-[20px] text-xs sm:text-sm shadow-sm transition-all flex items-center gap-2 active:scale-95"
          >
            <Briefcase className="w-4 h-4" /> Browse Jobs
          </Link>
          <Link
            to="/candidate/resume"
            className="px-4 py-2.5 bg-[#f0eded] text-[#050303] hover:bg-[#e4dede] dark:bg-[#1e1c1c] dark:text-white dark:hover:bg-[#282626] font-medium rounded-[20px] text-xs sm:text-sm border border-[#ded9d9] dark:border-[#373535] transition-all flex items-center gap-2 shadow-2xs active:scale-95"
          >
            <Upload className="w-4 h-4 text-[#ea2845]" /> {dashboard?.hasResume ? 'Update Resume' : 'Upload Resume'}
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Card 1: Resume Status */}
        <div className="glass-card flex items-center gap-4 rounded-[24px] bg-white dark:bg-[#0b0b0b] border border-[#e3dede] dark:border-[#373535] hover:translate-y-[-2px] transition-all">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              dashboard?.hasResume
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                : 'bg-[#ffa657]/10 text-[#d97706] dark:text-[#ffa657] border border-[#ffa657]/30'
            }`}
          >
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-mono text-[#6e6868] dark:text-[#9b9a9a] uppercase">&#123; RESUME STATUS &#125;</div>
            <div className="text-base sm:text-lg font-medium text-[#0c0909] dark:text-white mt-0.5">
              {dashboard?.hasResume ? 'Parsed & Verified' : 'Resume Required'}
            </div>
            <div className="text-[11px] font-mono text-[#6e6868] dark:text-[#9b9a9a] mt-0.5 font-light">
              {dashboard?.hasResume
                ? `Updated: ${new Date(dashboard.resumeUploadedAt || '').toLocaleDateString()}`
                : 'Upload PDF to unlock match scoring'}
            </div>
          </div>
        </div>

        {/* Card 2: Applications Count */}
        <div className="glass-card flex items-center gap-4 rounded-[24px] bg-white dark:bg-[#0b0b0b] border border-[#e3dede] dark:border-[#373535] hover:translate-y-[-2px] transition-all">
          <div className="w-12 h-12 rounded-2xl bg-[#ea2845]/10 text-[#ea2845] border border-[#ea2845]/30 flex items-center justify-center shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-mono text-[#6e6868] dark:text-[#9b9a9a] uppercase">&#123; ACTIVE PIPELINE &#125;</div>
            <div className="text-base sm:text-lg font-medium text-[#0c0909] dark:text-white mt-0.5">
              {activeAppsCount} Active
            </div>
            <Link
              to="/candidate/applications"
              className="text-[11px] font-mono text-[#ea2845] hover:underline mt-0.5 inline-flex items-center gap-1 font-medium"
            >
              View pipeline details <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Card 3: Assessments Passed */}
        <div className="glass-card flex items-center gap-4 rounded-[24px] bg-white dark:bg-[#0b0b0b] border border-[#e3dede] dark:border-[#373535] hover:translate-y-[-2px] transition-all">
          <div className="w-12 h-12 rounded-2xl bg-[#0284c7]/10 text-[#0284c7] dark:bg-[#a5d6ff]/10 dark:text-[#a5d6ff] border border-[#0284c7]/30 dark:border-[#a5d6ff]/30 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-mono text-[#6e6868] dark:text-[#9b9a9a] uppercase">&#123; CREDENTIALS &#125;</div>
            <div className="text-base sm:text-lg font-medium text-[#0c0909] dark:text-white mt-0.5">
              {passedTestsCount} / {dashboard?.tests.length || 0} Passed
            </div>
            <Link
              to="/candidate/assessments"
              className="text-[11px] font-mono text-[#0284c7] dark:text-[#a5d6ff] hover:underline mt-0.5 inline-flex items-center gap-1 font-medium"
            >
              Take assessments <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Active Application Pipeline Preview Section */}
      {applications.length > 0 && (
        <div className="glass-card space-y-4 rounded-[24px] bg-white dark:bg-[#0b0b0b] border border-[#e3dede] dark:border-[#373535]">
          <div className="flex items-center justify-between pb-3 border-b border-[#eee8e8] dark:border-[#1e1c1c]">
            <div>
              <h2 className="text-base sm:text-lg font-medium text-[#0c0909] dark:text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#ea2845]" />
                Active Pipeline ({applications.length})
              </h2>
              <p className="text-xs font-mono text-[#6e6868] dark:text-[#9b9a9a] mt-0.5 font-light">
                Real-time tracking for your submitted applications and interview schedules.
              </p>
            </div>
            <Link
              to="/candidate/applications"
              className="text-xs font-mono font-medium text-[#ea2845] hover:underline flex items-center gap-1 transition-colors"
            >
              All Applications ({applications.length}) &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {applications.slice(0, 3).map((app) => (
              <div
                key={app.id}
                className="bg-white/95 dark:bg-[#181818] border border-[#ded9d9] dark:border-[#373535] rounded-2xl p-4 flex flex-col justify-between space-y-3 hover:border-[#ea2845]/40 transition-all hover:-translate-y-0.5 shadow-subtle dark:shadow-sm"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <ApplicationStatusBadge status={app.status} />
                    {app.matchScore != null && (
                      <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#ea2845]/10 text-[#ea2845] border border-[#ea2845]/30">
                        {app.matchScore}% Match
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-[#0c0909] dark:text-white hover:text-[#ea2845] transition-colors line-clamp-1">
                      <Link to={`/jobs/${app.jobId}`}>{app.jobTitle}</Link>
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-[#6e6868] dark:text-[#9b9a9a] mt-0.5 font-mono">
                      <Building2 className="w-3.5 h-3.5 text-[#ea2845]" />
                      <span className="font-normal text-[#0c0909] dark:text-white">{app.companyName}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] font-mono text-[#6e6868] dark:text-[#9b9a9a]">
                    <Clock className="w-3 h-3" />
                    <span>Applied {new Date(app.appliedAt).toLocaleDateString()}</span>
                  </div>

                  {app.interview && (
                    <div className="p-2.5 rounded-xl bg-[#0284c7]/10 dark:bg-[#0284c7]/20 border border-[#0284c7]/30 text-xs space-y-1 font-mono">
                      <div className="font-medium text-[#0284c7] dark:text-[#a5d6ff] flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        Interview Scheduled
                      </div>
                      <div className="text-[11px] text-[#0284c7] dark:text-[#a5d6ff]/90">
                        {new Date(app.interview.scheduledTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })} ({app.interview.mode})
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-[#eee8e8] dark:border-[#1e1c1c] flex items-center justify-between text-xs">
                  <CategoryBadge category={app.roleCategory} />
                  <Link
                    to="/candidate/applications"
                    className="inline-flex items-center gap-1 text-xs font-mono font-medium text-[#ea2845] hover:underline"
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
        <div className="glass-card lg:col-span-2 space-y-6 rounded-[24px] bg-white dark:bg-[#0b0b0b] border border-[#e3dede] dark:border-[#373535]">
          <div className="flex items-center justify-between border-b border-[#eee8e8] dark:border-[#1e1c1c] pb-4">
            <div>
              <h2 className="text-base sm:text-lg font-medium text-[#0c0909] dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#ea2845]" />
                Technical Accuracy &amp; Skill Diagnostics
              </h2>
              <p className="text-xs font-mono text-[#6e6868] dark:text-[#9b9a9a] mt-0.5 font-light">
                Calculated from candidate assessment submissions across technical domains.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="bg-[#faf8f8] dark:bg-[#181818] border border-[#ded9d9] dark:border-[#373535] rounded-2xl p-4">
              <div className="flex items-center gap-2 text-xs font-mono font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-3">
                <CheckCircle2 className="w-4 h-4" />
                Verified Strengths (&ge; 70%)
              </div>
              {analysis && analysis.strongTopics.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {analysis.strongTopics.map((topic, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-emerald-500/10 text-emerald-700 border border-emerald-500/30 dark:text-emerald-300 rounded-full text-xs font-mono"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs font-mono text-[#6e6868] dark:text-[#9b9a9a] font-light">
                  No verified high-accuracy topics yet. Take role assessments to showcase technical competencies.
                </p>
              )}
            </div>

            {/* Growth Areas */}
            <div className="bg-[#faf8f8] dark:bg-[#181818] border border-[#ded9d9] dark:border-[#373535] rounded-2xl p-4">
              <div className="flex items-center gap-2 text-xs font-mono font-medium text-[#ffa657] uppercase tracking-wider mb-3">
                <AlertTriangle className="w-4 h-4" />
                Recommended Focus Areas (&lt; 70%)
              </div>
              {analysis && analysis.weakTopics.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {analysis.weakTopics.map((topic, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-[#ffa657]/10 text-[#d97706] dark:text-[#ffa657] border border-[#ffa657]/30 rounded-full text-xs font-mono"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs font-mono text-[#6e6868] dark:text-[#9b9a9a] font-light">
                  No weak topics flagged. Great work keeping domain accuracy high!
                </p>
              )}
            </div>
          </div>

          {/* Recommended Career Roles */}
          {analysis && analysis.recommendedRoles.length > 0 && (
            <div className="border-t border-[#eee8e8] dark:border-[#1e1c1c] pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-mono text-[#0c0909] dark:text-white font-medium">
                <Compass className="w-4 h-4 text-[#ea2845]" />
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
        <div className="glass-card space-y-4 rounded-[24px] bg-white dark:bg-[#0b0b0b] border border-[#e3dede] dark:border-[#373535]">
          <div className="flex items-center justify-between border-b border-[#eee8e8] dark:border-[#1e1c1c] pb-3">
            <h3 className="text-sm font-medium font-sans text-[#0c0909] dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-[#ea2845]" />
              Role Gating Status
            </h3>
            <Link to="/candidate/assessments" className="text-xs font-mono text-[#ea2845] font-medium hover:underline">
              All Tests &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {dashboard?.tests.map((test) => (
              <div
                key={test.id}
                className="p-3 bg-[#faf8f8] dark:bg-[#181818] border border-[#ded9d9] dark:border-[#373535] rounded-xl flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-medium font-sans text-[#0c0909] dark:text-white">{test.title}</h4>
                  <div className="flex items-center gap-2 text-[11px] font-mono text-[#6e6868] dark:text-[#9b9a9a] mt-0.5">
                    <span>Pass: {test.passScore}%</span>
                    {test.hasAttempted && (
                      <span>
                        &bull; Best: <b className="text-[#0c0909] dark:text-white">{test.highestScore}%</b>
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  {test.passed ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-700 border border-emerald-500/30 dark:text-emerald-400">
                      PASSED
                    </span>
                  ) : test.hasAttempted ? (
                    <Link
                      to={`/candidate/assessments/${test.id}`}
                      className="px-3 py-1 rounded-full text-[11px] font-mono font-medium bg-[#ffa657]/10 text-[#d97706] dark:text-[#ffa657] hover:bg-[#ffa657]/20 border border-[#ffa657]/30 transition-colors"
                    >
                      Retake
                    </Link>
                  ) : (
                    <Link
                      to={`/candidate/assessments/${test.id}`}
                      className="px-3 py-1 rounded-full text-[11px] font-mono font-medium bg-[#ea2845]/10 text-[#ea2845] hover:bg-[#ea2845]/20 border border-[#ea2845]/30 transition-colors"
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
      <div className="glass-card space-y-4 rounded-[24px] bg-white dark:bg-[#0b0b0b] border border-[#e3dede] dark:border-[#373535]">
        <div className="flex items-center justify-between pb-3 border-b border-[#eee8e8] dark:border-[#1e1c1c]">
          <div>
            <h2 className="text-base sm:text-lg font-medium font-sans text-[#0c0909] dark:text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-[#ea2845]" />
              Latest Openings from Enterprise Recruiters
            </h2>
            <p className="text-xs font-mono text-[#6e6868] dark:text-[#9b9a9a] mt-0.5 font-light">
              Live engineering requisitions posted by verified employers. Pass domain assessments to unlock 1-click applications.
            </p>
          </div>
          <Link
            to="/jobs"
            className="text-xs font-mono font-medium text-[#ea2845] hover:underline flex items-center gap-1 transition-colors"
          >
            Browse All ({openJobs.length}) Jobs <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {sortedOpenJobs.length === 0 ? (
          <div className="text-center py-8 text-xs font-mono text-[#6e6868] dark:text-[#9b9a9a]">
            No open requisitions currently available. Check back soon for new opportunities!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedOpenJobs.map((job) => {
              const isApplied = appliedJobIds.has(job.id);
              return (
                <div
                  key={job.id}
                  className={`bg-white/95 dark:bg-[#181818] border ${
                    isApplied
                      ? 'border-[#ea2845]/30 opacity-90'
                      : 'border-[#ded9d9] dark:border-[#373535] hover:border-[#ea2845]/40'
                  } rounded-[24px] p-5 flex flex-col justify-between transition-all hover:-translate-y-0.5 shadow-subtle dark:shadow-sm`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <CategoryBadge category={job.roleCategory} />
                        {isApplied && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            Applied
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-[#6e6868] dark:text-[#9b9a9a] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(job.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium font-sans text-[#0c0909] dark:text-white hover:text-[#ea2845] transition-colors line-clamp-1">
                        <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs font-mono text-[#6e6868] dark:text-[#9b9a9a] mt-0.5">
                        <Building2 className="w-3.5 h-3.5 text-[#ea2845]" />
                        <span className="font-normal text-[#0c0909] dark:text-white">{job.companyName}</span>
                      </div>
                    </div>

                    <p className="text-xs font-mono text-[#6e6868] dark:text-[#9b9a9a] line-clamp-2 leading-relaxed font-light">
                      {job.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {job.requiredSkills.slice(0, 3).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-black/5 dark:bg-[#0b0b0b] text-[#0c0909] dark:text-white border border-[#ded9d9] dark:border-[#373535]"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.requiredSkills.length > 3 && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono text-[#6e6868] dark:text-[#9b9a9a]">
                          +{job.requiredSkills.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-[#eee8e8] dark:border-[#1e1c1c] flex items-center justify-between text-xs">
                    <span className="text-[11px] font-mono text-[#6e6868] dark:text-[#9b9a9a]">
                      {job.applicantsCount} {job.applicantsCount === 1 ? 'applicant' : 'applicants'}
                    </span>
                    {isApplied ? (
                      <span className="inline-flex items-center gap-1 text-xs font-mono font-medium text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 cursor-not-allowed">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        Applied
                      </span>
                    ) : (
                      <Link
                        to={`/jobs/${job.id}`}
                        className="inline-flex items-center gap-1 text-xs font-mono font-medium text-[#ea2845] hover:underline transition-colors"
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

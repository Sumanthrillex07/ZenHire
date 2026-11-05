import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { jobApi } from '../../api/jobApi';
import { applicationApi } from '../../api/applicationApi';
import { Job, RoleCategory } from '../../types';
import Modal from '../../components/Modal';
import { CategoryBadge } from '../../components/Badge';
import { CardSkeleton } from '../../components/ui/Skeleton';
import Button from '../../components/ui/Button';
import { 
  Search, 
  Briefcase, 
  Building2, 
  Users, 
  Clock, 
  ArrowRight, 
  ShieldAlert, 
  CheckCircle2, 
  Award,
  X
} from 'lucide-react';

export const JobBrowsePage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<RoleCategory | ''>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());

  // Gating alert state
  const [gatingError, setGatingError] = useState<{
    roleCategory: string;
    testId?: string;
    message: string;
  } | null>(null);

  // Success apply state
  const [appliedSuccessJobTitle, setAppliedSuccessJobTitle] = useState<string | null>(null);

  useEffect(() => {
    loadJobs();
  }, [selectedCategory, isAuthenticated, user]);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const pageDataPromise = jobApi.getJobs({
        category: selectedCategory || undefined,
        roleCategory: selectedCategory || undefined,
        status: 'OPEN',
        size: 50,
      });

      const appsPromise = (isAuthenticated && user?.role === 'ROLE_CANDIDATE')
        ? applicationApi.getCandidateApplications().catch(() => [])
        : Promise.resolve([]);

      const [pageData, apps] = await Promise.all([pageDataPromise, appsPromise]);

      setJobs(pageData?.content || []);
      if (apps && apps.length > 0) {
        setAppliedJobIds(new Set(apps.map((a) => a.jobId)));
      }
    } catch (err) {
      console.error('Failed to load jobs', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (job: Job) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.role !== 'ROLE_CANDIDATE') {
      alert('Only candidates can apply for jobs.');
      return;
    }

    setApplyingJobId(job.id);

    try {
      await applicationApi.applyForJob(job.id);
      setAppliedSuccessJobTitle(job.title);
      setAppliedJobIds((prev) => new Set([...prev, job.id]));
    } catch (err: any) {
      const errorData = err.response?.data?.error;
      const errorCode = errorData?.errorCode;

      if (errorCode === 'ASSESSMENT_GATE_REQUIRED') {
        const requiredTest = err.response?.data?.data?.requiredTest || {};
        setGatingError({
          roleCategory: requiredTest.roleCategory || job.roleCategory,
          testId: requiredTest.testId,
          message:
            errorData?.details ||
            `You must pass the ${job.roleCategory} technical assessment before applying.`,
        });
      } else {
        alert(err.response?.data?.message || errorData?.details || 'Failed to submit application.');
      }
    } finally {
      setApplyingJobId(null);
    }
  };

  const filteredJobs = jobs
    .filter((job) => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return (
        job.title.toLowerCase().includes(query) ||
        job.companyName.toLowerCase().includes(query) ||
        job.requiredSkills.some((s) => s.toLowerCase().includes(query))
      );
    })
    .sort((a, b) => {
      const aApplied = appliedJobIds.has(a.id);
      const bApplied = appliedJobIds.has(b.id);
      if (aApplied !== bApplied) {
        return aApplied ? 1 : -1; // Unapplied jobs go up, applied jobs go down
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // Newest first
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="bracketed-eyebrow mb-1">
            &#123; REQUISITION DISCOVERY &#125;_
          </div>
          <h1 className="text-2xl sm:text-3xl font-medium text-[#0c0909] dark:text-white tracking-tight">
            Explore Open Opportunities
          </h1>
          <p className="font-mono text-xs sm:text-sm text-[#6e6868] dark:text-[#9b9a9a] mt-1 max-w-2xl leading-relaxed font-light">
            Browse verified technical roles with automated assessment gating and transparent match evaluation.
          </p>
        </div>
        <div className="text-xs font-mono text-[#6e6868] dark:text-[#9b9a9a]">
          Showing <span className="text-[#ea2845] font-semibold">{filteredJobs.length}</span> active positions
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card p-4 rounded-[24px] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0b0b0b] border border-[#e3dede] dark:border-[#373535] shadow-subtle dark:shadow-glass-dark">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-mono transition-all ${
              selectedCategory === ''
                ? 'bg-[#050303] text-white dark:bg-white dark:text-[#050303] shadow-xs'
                : 'bg-[#f0eded] hover:bg-[#e4dede] text-[#6e6868] dark:bg-[#181818] dark:text-[#9b9a9a] dark:hover:text-white border border-[#ded9d9] dark:border-[#373535]'
            }`}
          >
            All Roles
          </button>
          <button
            onClick={() => setSelectedCategory('FRONTEND')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-mono transition-all ${
              selectedCategory === 'FRONTEND'
                ? 'bg-[#050303] text-white dark:bg-white dark:text-[#050303] shadow-xs'
                : 'bg-[#f0eded] hover:bg-[#e4dede] text-[#6e6868] dark:bg-[#181818] dark:text-[#9b9a9a] dark:hover:text-white border border-[#ded9d9] dark:border-[#373535]'
            }`}
          >
            Frontend
          </button>
          <button
            onClick={() => setSelectedCategory('BACKEND')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-mono transition-all ${
              selectedCategory === 'BACKEND'
                ? 'bg-[#050303] text-white dark:bg-white dark:text-[#050303] shadow-xs'
                : 'bg-[#f0eded] hover:bg-[#e4dede] text-[#6e6868] dark:bg-[#181818] dark:text-[#9b9a9a] dark:hover:text-white border border-[#ded9d9] dark:border-[#373535]'
            }`}
          >
            Backend
          </button>
          <button
            onClick={() => setSelectedCategory('AI_ML')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-mono transition-all ${
              selectedCategory === 'AI_ML'
                ? 'bg-[#ea2845] text-white shadow-xs'
                : 'bg-[#f0eded] hover:bg-[#e4dede] text-[#6e6868] dark:bg-[#181818] dark:text-[#9b9a9a] dark:hover:text-white border border-[#ded9d9] dark:border-[#373535]'
            }`}
          >
            AI &amp; ML
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#9b9a9a] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search title, skill, or company..."
            className="w-full pl-9 pr-9 py-2 bg-white dark:bg-[#181818] border border-[#ded9d9] dark:border-[#373535] rounded-[24px] text-xs sm:text-sm font-mono text-[#0c0909] dark:text-white placeholder-[#9b9a9a] focus:outline-none focus:border-[#ea2845]/70 focus:ring-1 focus:ring-[#ea2845]/20 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9b9a9a] hover:text-[#0c0909] dark:hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Job Listing Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-[24px] bg-white dark:bg-[#0b0b0b] border border-[#e3dede] dark:border-[#373535]">
          <Briefcase className="w-12 h-12 text-[#9b9a9a] mx-auto mb-3" />
          <h3 className="text-base font-medium font-sans text-[#0c0909] dark:text-white">No job openings found</h3>
          <p className="text-xs font-mono text-[#6e6868] dark:text-[#9b9a9a] mt-1 max-w-sm mx-auto font-light">
            Try tweaking your search keywords or resetting your category filters.
          </p>
          {(selectedCategory || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory('');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 bg-[#f0eded] hover:bg-[#e4dede] dark:bg-[#181818] dark:hover:bg-[#252222] text-[#0c0909] dark:text-white rounded-[20px] text-xs font-mono transition-all border border-[#ded9d9] dark:border-[#373535]"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredJobs.map((job) => {
            const isApplied = appliedJobIds.has(job.id);
            return (
              <div
                key={job.id}
                className={`glass-card rounded-[24px] bg-white dark:bg-[#0b0b0b] border ${
                  isApplied
                    ? 'border-[#ea2845]/30 opacity-90'
                    : 'border-[#e3dede] dark:border-[#373535] hover:border-[#ea2845]/40'
                } flex flex-col justify-between transition-all hover:translate-y-[-2px] shadow-subtle dark:shadow-sm p-6`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="text-base sm:text-lg font-medium text-[#0c0909] dark:text-white hover:text-[#ea2845] transition-colors font-sans">
                        <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs font-mono text-[#6e6868] dark:text-[#9b9a9a] mt-1">
                        <Building2 className="w-3.5 h-3.5 text-[#ea2845]" />
                        <span className="font-normal text-[#0c0909] dark:text-white">{job.companyName}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CategoryBadge category={job.roleCategory} />
                      {isApplied && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          Applied
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm font-mono text-[#6e6868] dark:text-[#9b9a9a] line-clamp-2 mt-2 leading-relaxed font-light">
                    {job.description}
                  </p>

                  {/* Required Skills Chips */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {job.requiredSkills.slice(0, 5).map((skill, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-black/5 dark:bg-[#181818] text-[#0c0909] dark:text-white border border-[#ded9d9] dark:border-[#373535]"
                      >
                        {skill}
                      </span>
                    ))}
                    {job.requiredSkills.length > 5 && (
                      <span className="text-[11px] font-mono text-[#6e6868] dark:text-[#9b9a9a] self-center">
                        +{job.requiredSkills.length - 5} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="mt-6 pt-4 border-t border-[#eee8e8] dark:border-[#1e1c1c] flex items-center justify-between">
                  <div className="flex items-center gap-4 text-[11px] font-mono text-[#6e6868] dark:text-[#9b9a9a]">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> {job.applicantsCount} {job.applicantsCount === 1 ? 'applicant' : 'applicants'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/jobs/${job.id}`}
                      className="px-3.5 py-1.5 bg-[#f0eded] hover:bg-[#e4dede] text-[#050303] dark:bg-[#181818] dark:hover:bg-[#252222] dark:text-white rounded-[20px] text-xs font-mono font-medium border border-[#ded9d9] dark:border-[#373535] transition-all active:scale-95"
                    >
                      Details
                    </Link>
                    {isApplied ? (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled
                        className="font-mono font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30 cursor-not-allowed opacity-90 shadow-2xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600 dark:text-emerald-400" />
                        Applied
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleApply(job)}
                        isLoading={applyingJobId === job.id}
                        className="font-sans font-semibold shadow-xs"
                      >
                        Apply
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Gating Requirement Modal */}
      <Modal
        isOpen={!!gatingError}
        onClose={() => setGatingError(null)}
        title="Assessment Gating Required"
      >
        <div className="space-y-4 font-mono">
          <div className="w-12 h-12 rounded-2xl bg-[#ea2845]/10 text-[#ea2845] border border-[#ea2845]/25 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>

          <div className="text-center space-y-1">
            <h4 className="text-base font-medium font-sans text-[#0c0909] dark:text-white">Technical Credential Prerequisite</h4>
            <p className="text-xs text-[#6e6868] dark:text-[#9b9a9a] leading-relaxed max-w-sm mx-auto font-light">
              {gatingError?.message}
            </p>
          </div>

          <div className="p-3.5 bg-[#faf8f8] dark:bg-[#181818] rounded-2xl border border-[#ded9d9] dark:border-[#373535] text-xs text-[#6e6868] dark:text-[#9b9a9a] flex items-start gap-2.5 font-light">
            <Award className="w-4 h-4 text-[#ea2845] shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              ZenHire ensures verified, merit-grounded evaluations. Passing this role assessment verifies your technical competencies and unlocks 1-click submission.
            </span>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                const targetUrl = gatingError?.testId
                  ? `/candidate/assessments/${gatingError.testId}`
                  : '/candidate/assessments';
                setGatingError(null);
                navigate(targetUrl);
              }}
              className="w-full font-semibold"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Take Prerequisite Assessment
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => setGatingError(null)}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Application Success Modal */}
      <Modal
        isOpen={!!appliedSuccessJobTitle}
        onClose={() => setAppliedSuccessJobTitle(null)}
        title="Application Submitted!"
      >
        <div className="space-y-4 text-center font-mono">
          <div className="w-12 h-12 rounded-2xl bg-[#ea2845]/10 text-[#ea2845] border border-[#ea2845]/25 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div>
            <h4 className="text-base font-medium font-sans text-[#0c0909] dark:text-white">Application Recorded</h4>
            <p className="text-xs text-[#6e6868] dark:text-[#9b9a9a] mt-1 max-w-xs mx-auto leading-relaxed font-light">
              You have successfully applied for <b className="text-[#ea2845] font-medium">{appliedSuccessJobTitle}</b>. Your profile and hybrid match score have been forwarded to the employer.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Link
              to="/candidate/applications"
              className="w-full py-2.5 bg-[#050303] text-white dark:bg-white dark:text-[#050303] hover:opacity-90 font-semibold rounded-[20px] text-xs transition-all shadow-sm block text-center font-sans"
            >
              Track Application in Pipeline
            </Link>
            <Button
              variant="secondary"
              size="md"
              onClick={() => setAppliedSuccessJobTitle(null)}
              className="w-full"
            >
              Browse More Jobs
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default JobBrowsePage;

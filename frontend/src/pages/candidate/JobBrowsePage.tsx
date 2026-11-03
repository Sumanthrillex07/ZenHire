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
  }, [selectedCategory]);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const pageData = await jobApi.getJobs({
        category: selectedCategory || undefined,
        roleCategory: selectedCategory || undefined,
        status: 'OPEN',
        size: 50,
      });
      setJobs(pageData?.content || []);
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

  const filteredJobs = jobs.filter((job) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      job.title.toLowerCase().includes(query) ||
      job.companyName.toLowerCase().includes(query) ||
      job.requiredSkills.some((s) => s.toLowerCase().includes(query))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold mb-2 border border-emerald-500/20">
            <Briefcase className="w-3.5 h-3.5" /> Requisition Discovery
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Explore Open Opportunities
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Browse verified technical roles with automated assessment gating and transparent match evaluation.
          </p>
        </div>
        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Showing <span className="text-emerald-600 dark:text-emerald-400 font-bold">{filteredJobs.length}</span> active positions
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-200/80 dark:border-slate-800 shadow-subtle dark:shadow-glass-dark">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === ''
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-white border border-slate-200 dark:border-slate-800'
            }`}
          >
            All Roles
          </button>
          <button
            onClick={() => setSelectedCategory('FRONTEND')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === 'FRONTEND'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-white border border-slate-200 dark:border-slate-800'
            }`}
          >
            Frontend
          </button>
          <button
            onClick={() => setSelectedCategory('BACKEND')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === 'BACKEND'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-white border border-slate-200 dark:border-slate-800'
            }`}
          >
            Backend
          </button>
          <button
            onClick={() => setSelectedCategory('AI_ML')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === 'AI_ML'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-white border border-slate-200 dark:border-slate-800'
            }`}
          >
            AI &amp; ML
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search title, skill, or company..."
            className="w-full pl-9 pr-9 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
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
        <div className="glass-card p-12 text-center rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <Briefcase className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No job openings found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Try tweaking your search keywords or resetting your category filters.
          </p>
          {(selectedCategory || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory('');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-all"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="glass-card rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/40 dark:hover:border-slate-700 flex flex-col justify-between transition-all hover:translate-y-[-2px] shadow-subtle dark:shadow-sm p-6"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                      <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <Building2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{job.companyName}</span>
                    </div>
                  </div>
                  <CategoryBadge category={job.roleCategory} />
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                  {job.description}
                </p>

                {/* Required Skills Chips */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {job.requiredSkills.slice(0, 5).map((skill, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-0.5 rounded-lg text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800"
                    >
                      {skill}
                    </span>
                  ))}
                  {job.requiredSkills.length > 5 && (
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 self-center font-medium">
                      +{job.requiredSkills.length - 5} more
                    </span>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-4 text-[11px] text-slate-400 dark:text-slate-500">
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
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-all active:scale-95"
                  >
                    Details
                  </Link>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleApply(job)}
                    isLoading={applyingJobId === job.id}
                    className="font-bold shadow-xs"
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Gating Requirement Modal */}
      <Modal
        isOpen={!!gatingError}
        onClose={() => setGatingError(null)}
        title="Assessment Gating Required"
      >
        <div className="space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>

          <div className="text-center space-y-1">
            <h4 className="text-base font-bold text-slate-900 dark:text-white">Technical Credential Prerequisite</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-sm mx-auto">
              {gatingError?.message}
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2.5">
            <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              ZenHire ensures verified, merit-grounded evaluations. Passing this role test verifies your core competencies and unlocks 1-click application submission.
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
              className="w-full font-bold"
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
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">Application Recorded</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-xs mx-auto leading-relaxed">
              You have successfully applied for <b className="text-emerald-600 dark:text-emerald-400">{appliedSuccessJobTitle}</b>. Your profile and hybrid match score have been forwarded to the employer.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Link
              to="/candidate/applications"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all shadow-sm block text-center"
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

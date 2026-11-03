import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { jobApi } from '../../api/jobApi';
import { applicationApi } from '../../api/applicationApi';
import { Job, RoleCategory } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import { CategoryBadge } from '../../components/Badge';
import { 
  Search, 
  Briefcase, 
  Building2, 
  Users, 
  Clock, 
  ArrowRight, 
  ShieldAlert, 
  CheckCircle2, 
  Award
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
      setJobs(pageData.content);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-2">
          <Briefcase className="w-3.5 h-3.5" /> Requisition Discovery
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Explore Open Opportunities
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-2xl">
          Browse verified technical roles with automated assessment gating and transparent match evaluation.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedCategory === ''
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All Roles
          </button>
          <button
            onClick={() => setSelectedCategory('FRONTEND')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedCategory === 'FRONTEND'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Frontend
          </button>
          <button
            onClick={() => setSelectedCategory('BACKEND')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedCategory === 'BACKEND'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Backend
          </button>
          <button
            onClick={() => setSelectedCategory('AI_ML')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedCategory === 'AI_ML'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            AI & ML
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, skill, or company..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Job Listing Cards */}
      {loading ? (
        <LoadingSpinner text="Fetching open positions..." />
      ) : filteredJobs.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No job openings found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Try tweaking your search keywords or switching category filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="glass-card hover:border-slate-700 flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h3 className="text-base font-bold text-white hover:text-emerald-400 transition-colors">
                      <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-500" />
                      <span>{job.companyName}</span>
                    </div>
                  </div>
                  <CategoryBadge category={job.roleCategory} />
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 mt-2 leading-relaxed">
                  {job.description}
                </p>

                {/* Required Skills Chips */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {job.requiredSkills.slice(0, 5).map((skill, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-900 text-slate-300 border border-slate-800"
                    >
                      {skill}
                    </span>
                  ))}
                  {job.requiredSkills.length > 5 && (
                    <span className="text-[10px] text-slate-500 self-center">
                      +{job.requiredSkills.length - 5} more
                    </span>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-4 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-500" /> {job.applicantsCount} applicants
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/jobs/${job.id}`}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 transition-colors"
                  >
                    Details
                  </Link>
                  <button
                    onClick={() => handleApply(job)}
                    disabled={applyingJobId === job.id}
                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center gap-1"
                  >
                    {applyingJobId === job.id ? 'Applying...' : 'Apply'}
                  </button>
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
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>

          <div className="text-center space-y-1">
            <h4 className="text-base font-bold text-white">Verified Credential Required</h4>
            <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
              {gatingError?.message}
            </p>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-start gap-2">
            <Award className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              ZenHire ensures fair, verified candidate evaluation. Passing this role test proves your technical foundation and unlocks direct consideration by the hiring manager.
            </span>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => {
                const targetUrl = gatingError?.testId
                  ? `/candidate/assessments/${gatingError.testId}`
                  : '/candidate/assessments';
                setGatingError(null);
                navigate(targetUrl);
              }}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              Take Prerequisite Assessment <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setGatingError(null)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs transition-colors"
            >
              Cancel
            </button>
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
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div>
            <h4 className="text-base font-bold text-white">Application Recorded</h4>
            <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
              You have successfully applied for <b className="text-emerald-400">{appliedSuccessJobTitle}</b>. Your profile and hybrid match score have been routed to the hiring manager.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Link
              to="/candidate/applications"
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-colors block text-center"
            >
              Track Application in Pipeline
            </Link>
            <button
              onClick={() => setAppliedSuccessJobTitle(null)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs transition-colors"
            >
              Browse More Jobs
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default JobBrowsePage;

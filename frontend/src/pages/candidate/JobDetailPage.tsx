import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { jobApi } from '../../api/jobApi';
import { matchingApi } from '../../api/matchingApi';
import { applicationApi } from '../../api/applicationApi';
import { Job, MatchResult } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import { CategoryBadge, MatchScoreBadge } from '../../components/Badge';
import Button from '../../components/ui/Button';
import { 
  Building2, 
  Users, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  BrainCircuit, 
  ShieldAlert, 
  ArrowRight,
  ChevronLeft
} from 'lucide-react';

export const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [job, setJob] = useState<Job | null>(null);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [matchLoading, setMatchLoading] = useState(false);
  const [applying, setApplying] = useState(false);

  const [gatingError, setGatingError] = useState<{
    roleCategory: string;
    testId?: string;
    message: string;
  } | null>(null);

  const [appliedSuccess, setAppliedSuccess] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    if (id) {
      loadJobDetails(id);
    }
  }, [id, isAuthenticated, user]);

  const loadJobDetails = async (jobId: string) => {
    setLoading(true);
    try {
      const jobData = await jobApi.getJobById(jobId);
      setJob(jobData);

      // If candidate is logged in, attempt to fetch hybrid match evaluation and application status
      if (isAuthenticated && user?.role === 'ROLE_CANDIDATE') {
        fetchMatchEvaluation(jobId);
        checkIfApplied(jobId);
      }
    } catch (err) {
      console.error('Failed to load job', err);
    } finally {
      setLoading(false);
    }
  };

  const checkIfApplied = async (jobId: string) => {
    try {
      const apps = await applicationApi.getCandidateApplications();
      if (apps.some((app) => app.jobId === jobId)) {
        setHasApplied(true);
      }
    } catch (err) {
      console.warn('Failed to verify application status', err);
    }
  };

  const fetchMatchEvaluation = async (jobId: string) => {
    setMatchLoading(true);
    try {
      const match = await matchingApi.getJobMatch(jobId);
      setMatchResult(match);
    } catch {
      // Could fail if user hasn't uploaded a resume yet
      setMatchResult(null);
    } finally {
      setMatchLoading(false);
    }
  };

  const handleApply = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.role !== 'ROLE_CANDIDATE' || !job) {
      return;
    }

    setApplying(true);
    try {
      await applicationApi.applyForJob(job.id);
      setAppliedSuccess(true);
      setHasApplied(true);
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
      setApplying(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading job specification..." size="lg" />;
  }

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-foreground">Job not found</h2>
        <Link to="/jobs" className="text-primary hover:underline mt-2 inline-block text-sm font-medium">
          &larr; Back to all open jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 sm:space-y-8 animate-fadeIn font-sans">
      {/* Back button */}
      <Link
        to="/jobs"
        className="inline-flex items-center gap-1.5 text-xs font-mono text-[#6e6868] dark:text-[#9b9a9a] hover:text-[#0c0909] dark:hover:text-white transition-colors"
      >
        <ChevronLeft className="w-4 h-4 text-[#ea2845]" /> Back to job search
      </Link>

      {/* Main Job Header Card */}
      <div className="glass-card p-6 sm:p-8 space-y-5 rounded-[24px] bg-white dark:bg-[#0b0b0b] border border-[#e3dede] dark:border-[#373535]">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <CategoryBadge category={job.roleCategory} />
              <span className="text-xs font-mono text-[#6e6868] dark:text-[#9b9a9a]">
                &bull; Requisition ID: <span className="font-mono text-[#ea2845]">{job.id.substring(0, 8)}</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-medium text-[#0c0909] dark:text-white tracking-tight">
              {job.title}
            </h1>
            <div className="flex items-center gap-2 text-sm font-mono text-[#6e6868] dark:text-[#9b9a9a]">
              <Building2 className="w-4 h-4 text-[#ea2845]" />
              <span className="font-normal text-[#0c0909] dark:text-white">{job.companyName}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {hasApplied || appliedSuccess ? (
              <Button
                disabled
                variant="outline"
                size="md"
                className="w-full sm:w-auto font-mono font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30 cursor-not-allowed opacity-90 shadow-2xs"
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600 dark:text-emerald-400" />
                Applied
              </Button>
            ) : (
              <Button
                onClick={handleApply}
                disabled={applying}
                isLoading={applying}
                variant="primary"
                size="md"
                className="w-full sm:w-auto shadow-sm font-semibold"
              >
                {applying ? 'Submitting...' : 'Apply for Role'}
              </Button>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-[#eee8e8] dark:border-[#1e1c1c] flex flex-wrap items-center gap-6 text-xs font-mono text-[#6e6868] dark:text-[#9b9a9a]">
          <span className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-[#ea2845]" /> {job.applicantsCount} active applicants
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#ea2845]" /> Posted on {new Date(job.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Hybrid AI Match Evaluation Card (Only for logged-in candidates) */}
      {isAuthenticated && user?.role === 'ROLE_CANDIDATE' && (
        <div className="glass-card p-6 sm:p-8 rounded-[24px] bg-white dark:bg-[#0b0b0b] border border-[#ea2845]/30 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#eee8e8] dark:border-[#1e1c1c]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#ea2845]/10 text-[#ea2845] border border-[#ea2845]/25 flex items-center justify-center shrink-0">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-medium font-sans text-[#0c0909] dark:text-white flex items-center gap-2">
                  Hybrid AI Candidate-Job Match
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#ea2845]/15 text-[#ea2845] border border-[#ea2845]/30">
                    &#123; 60 / 40 ENGINE &#125;
                  </span>
                </h3>
                <p className="text-[11px] font-mono text-[#6e6868] dark:text-[#9b9a9a]">Calculated specifically for your parsed resume</p>
              </div>
            </div>

            {matchResult && <MatchScoreBadge score={matchResult.matchScore} />}
          </div>

          {matchLoading ? (
            <div className="py-4">
              <LoadingSpinner text="Evaluating technical compatibility & narrative depth..." size="sm" />
            </div>
          ) : matchResult ? (
            <div className="space-y-4">
              {/* Score Breakdown Bars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-[#faf8f8] dark:bg-[#181818] rounded-2xl border border-[#ded9d9] dark:border-[#373535]">
                  <div className="flex justify-between text-xs mb-1.5 font-mono">
                    <span className="text-[#6e6868] dark:text-[#9b9a9a]">Deterministic Overlap (60%)</span>
                    <span className="font-semibold text-[#0c0909] dark:text-white">{matchResult.skillOverlapScore}%</span>
                  </div>
                  <div className="w-full bg-[#e4dede] dark:bg-[#0b0b0b] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${matchResult.skillOverlapScore}%` }}
                    />
                  </div>
                </div>

                <div className="p-4 bg-[#faf8f8] dark:bg-[#181818] rounded-2xl border border-[#ded9d9] dark:border-[#373535]">
                  <div className="flex justify-between text-xs mb-1.5 font-mono">
                    <span className="text-[#6e6868] dark:text-[#9b9a9a]">Gemini LLM Narrative Fit (40%)</span>
                    <span className="font-semibold text-[#ea2845]">{matchResult.llmFitScore}%</span>
                  </div>
                  <div className="w-full bg-[#e4dede] dark:bg-[#0b0b0b] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#ea2845] to-[#780f20] h-full rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${matchResult.llmFitScore}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Matched & Missing Skills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <h4 className="text-xs font-mono font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Matched Skills ({matchResult.matchedSkills.length})
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {matchResult.matchedSkills.length > 0 ? (
                      matchResult.matchedSkills.map((s, i) => (
                        <span key={i} className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-emerald-500/10 border border-emerald-500/25 text-emerald-800 dark:text-emerald-300">
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs font-mono text-[#6e6868] dark:text-[#9b9a9a]">None detected</span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-mono font-medium text-[#ffa657] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5" /> Missing / Target Skills ({matchResult.missingSkills.length})
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {matchResult.missingSkills.length > 0 ? (
                      matchResult.missingSkills.map((s, i) => (
                        <span key={i} className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-[#ffa657]/10 border border-[#ffa657]/25 text-[#d97706] dark:text-[#ffa657]">
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">All required skills met!</span>
                    )}
                  </div>
                </div>
              </div>

              {/* AI Narrative Reasoning */}
              {matchResult.reasoning && (
                <div className="p-4 bg-[#faf8f8] dark:bg-[#181818] rounded-2xl border border-[#ded9d9] dark:border-[#373535] text-xs leading-relaxed space-y-1 font-mono">
                  <div className="flex items-center gap-1.5 text-[#ea2845] font-semibold mb-1">
                    <Sparkles className="w-3.5 h-3.5" /> Qualitative Compatibility Insights:
                  </div>
                  <p className="text-[#6e6868] dark:text-[#9b9a9a] leading-relaxed font-light">{matchResult.reasoning}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 font-mono">
              <p className="text-xs text-[#6e6868] dark:text-[#9b9a9a] mb-3 max-w-sm mx-auto font-light">
                Upload your resume to calculate your personalized 60/40 compatibility score and AI reasoning.
              </p>
              <Link to="/candidate/resume">
                <Button variant="outline" size="sm">
                  Upload Resume Now
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Description & Skill Requirements */}
      <div className="glass-card p-6 sm:p-8 space-y-6 rounded-[24px] bg-white dark:bg-[#0b0b0b] border border-[#e3dede] dark:border-[#373535]">
        <div>
          <h3 className="text-xs font-mono text-[#6e6868] dark:text-[#9b9a9a] uppercase tracking-wider mb-3">
            &#123; REQUIRED TECHNICAL STACK &#125;
          </h3>
          <div className="flex flex-wrap gap-2">
            {job.requiredSkills.map((skill, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-[#faf8f8] dark:bg-[#181818] border border-[#ded9d9] dark:border-[#373535] text-[#0c0909] dark:text-white rounded-full text-xs font-mono"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="border-t border-[#eee8e8] dark:border-[#1e1c1c] pt-6">
          <h3 className="text-xs font-mono text-[#6e6868] dark:text-[#9b9a9a] uppercase tracking-wider mb-3">
            &#123; ROLE DESCRIPTION &amp; RESPONSIBILITIES &#125;
          </h3>
          <div className="text-sm font-mono text-[#0c0909] dark:text-[#f2efef] leading-relaxed whitespace-pre-wrap font-light">
            {job.description}
          </div>
        </div>
      </div>

      {/* Gating Requirement Modal */}
      <Modal
        isOpen={!!gatingError}
        onClose={() => setGatingError(null)}
        title="Assessment Gating Required"
      >
        <div className="space-y-4 font-mono">
          <div className="w-12 h-12 rounded-2xl bg-[#ea2845]/10 border border-[#ea2845]/30 text-[#ea2845] flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>

          <div className="text-center space-y-1">
            <h4 className="text-base font-medium font-sans text-[#0c0909] dark:text-white">Verified Credential Required</h4>
            <p className="text-xs text-[#6e6868] dark:text-[#9b9a9a] leading-relaxed max-w-sm mx-auto font-light">
              {gatingError?.message}
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Button
              onClick={() => {
                const targetUrl = gatingError?.testId
                  ? `/candidate/assessments/${gatingError.testId}`
                  : '/candidate/assessments';
                setGatingError(null);
                navigate(targetUrl);
              }}
              variant="primary"
              size="md"
              className="w-full"
            >
              Take Prerequisite Assessment <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
            <Button
              onClick={() => setGatingError(null)}
              variant="secondary"
              size="sm"
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Application Success Modal */}
      <Modal
        isOpen={appliedSuccess}
        onClose={() => setAppliedSuccess(false)}
        title="Application Submitted!"
      >
        <div className="space-y-4 text-center font-mono">
          <div className="w-12 h-12 rounded-2xl bg-[#ea2845]/10 border border-[#ea2845]/30 text-[#ea2845] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div>
            <h4 className="text-base font-medium font-sans text-[#0c0909] dark:text-white">Application Successfully Logged</h4>
            <p className="text-xs text-[#6e6868] dark:text-[#9b9a9a] mt-1 max-w-xs mx-auto font-light">
              Your profile has been submitted for <b className="text-[#ea2845]">{job.title}</b>.
            </p>
          </div>

          <div className="pt-2">
            <Link to="/candidate/applications" className="block w-full">
              <Button variant="primary" size="md" className="w-full">
                Track in My Applications
              </Button>
            </Link>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default JobDetailPage;
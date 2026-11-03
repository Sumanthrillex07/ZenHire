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

  useEffect(() => {
    if (id) {
      loadJobDetails(id);
    }
  }, [id]);

  const loadJobDetails = async (jobId: string) => {
    setLoading(true);
    try {
      const jobData = await jobApi.getJobById(jobId);
      setJob(jobData);

      // If candidate is logged in, attempt to fetch hybrid match evaluation
      if (isAuthenticated && user?.role === 'ROLE_CANDIDATE') {
        fetchMatchEvaluation(jobId);
      }
    } catch (err) {
      console.error('Failed to load job', err);
    } finally {
      setLoading(false);
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Back button */}
      <Link
        to="/jobs"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
      >
        <ChevronLeft className="w-4 h-4" /> Back to job search
      </Link>

      {/* Main Job Header Card */}
      <div className="glass-card p-6 sm:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <CategoryBadge category={job.roleCategory} />
              <span className="text-xs text-muted-foreground font-medium">
                &bull; Requisition ID: <span className="font-mono">{job.id.substring(0, 8)}</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {job.title}
            </h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="w-4 h-4 text-primary" />
              <span className="font-semibold text-foreground/90">{job.companyName}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              onClick={handleApply}
              disabled={applying}
              isLoading={applying}
              variant="primary"
              size="md"
              className="w-full sm:w-auto shadow-md"
            >
              {applying ? 'Submitting...' : 'Apply for Role'}
            </Button>
          </div>
        </div>

        <div className="pt-4 border-t border-border/70 flex flex-wrap items-center gap-6 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5 font-medium">
            <Users className="w-4 h-4 text-muted-foreground/80" /> {job.applicantsCount} active applicants
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <Clock className="w-4 h-4 text-muted-foreground/80" /> Posted on {new Date(job.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Hybrid AI Match Evaluation Card (Only for logged-in candidates) */}
      {isAuthenticated && user?.role === 'ROLE_CANDIDATE' && (
        <div className="glass-card p-6 border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 via-card to-teal-500/5 dark:from-emerald-950/25 dark:via-slate-900/50 dark:to-emerald-900/15 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/70">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  Hybrid AI Candidate-Job Match
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25">
                    60 / 40 Engine
                  </span>
                </h3>
                <p className="text-[11px] text-muted-foreground">Calculated specifically for your parsed resume</p>
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
                <div className="p-3.5 bg-muted/40 rounded-xl border border-border/70">
                  <div className="flex justify-between text-xs mb-1.5 font-medium">
                    <span className="text-muted-foreground">Deterministic Skill Overlap (60% weight)</span>
                    <span className="font-bold text-foreground">{matchResult.skillOverlapScore}%</span>
                  </div>
                  <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${matchResult.skillOverlapScore}%` }}
                    />
                  </div>
                </div>

                <div className="p-3.5 bg-muted/40 rounded-xl border border-border/70">
                  <div className="flex justify-between text-xs mb-1.5 font-medium">
                    <span className="text-muted-foreground">Gemini LLM Narrative Fit (40% weight)</span>
                    <span className="font-bold text-foreground">{matchResult.llmFitScore}%</span>
                  </div>
                  <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${matchResult.llmFitScore}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Matched & Missing Skills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Matched Skills ({matchResult.matchedSkills.length})
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {matchResult.matchedSkills.length > 0 ? (
                      matchResult.matchedSkills.map((s, i) => (
                        <span key={i} className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-emerald-500/10 border border-emerald-500/25 text-emerald-800 dark:text-emerald-300">
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">None detected</span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5" /> Missing / Target Skills ({matchResult.missingSkills.length})
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {matchResult.missingSkills.length > 0 ? (
                      matchResult.missingSkills.map((s, i) => (
                        <span key={i} className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-amber-500/10 border border-amber-500/25 text-amber-800 dark:text-amber-300">
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">All required skills met!</span>
                    )}
                  </div>
                </div>
              </div>

              {/* AI Narrative Reasoning */}
              {matchResult.reasoning && (
                <div className="p-4 bg-card/80 rounded-xl border border-border/80 text-xs text-foreground/90 leading-relaxed space-y-1">
                  <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-semibold mb-1">
                    <Sparkles className="w-3.5 h-3.5" /> Qualitative Compatibility Insights:
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{matchResult.reasoning}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-xs text-muted-foreground mb-3 max-w-sm mx-auto">
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
      <div className="glass-card p-6 sm:p-8 space-y-6">
        <div>
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
            Required Technical Stack
          </h3>
          <div className="flex flex-wrap gap-2">
            {job.requiredSkills.map((skill, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-muted/70 border border-border/70 text-foreground rounded-lg text-xs font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="border-t border-border/70 pt-6">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
            Job Description & Role Responsibilities
          </h3>
          <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap font-normal">
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
        <div className="space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>

          <div className="text-center space-y-1">
            <h4 className="text-base font-bold text-foreground">Verified Credential Required</h4>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
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
              variant="ghost"
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
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div>
            <h4 className="text-base font-bold text-foreground">Application Successfully Logged</h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
              Your profile has been submitted for <b className="text-emerald-600 dark:text-emerald-400">{job.title}</b>.
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
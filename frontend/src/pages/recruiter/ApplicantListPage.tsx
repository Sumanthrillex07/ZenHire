import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { jobApi } from '../../api/jobApi';
import { applicationApi, ScheduleInterviewPayload } from '../../api/applicationApi';
import { Job, ApplicantDetail, ApplicationStatus, InterviewMode } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import { CategoryBadge, MatchScoreBadge } from '../../components/Badge';
import Button from '../../components/ui/Button';
import { 
  ChevronLeft, 
  Users, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Video, 
  MapPin
} from 'lucide-react';

export const ApplicantListPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();

  const [job, setJob] = useState<Job | null>(null);
  const [applicants, setApplicants] = useState<ApplicantDetail[]>([]);
  const [loading, setLoading] = useState(true);

  // Interview Scheduling Modal state
  const [schedulingAppId, setSchedulingAppId] = useState<string | null>(null);
  const [interviewTime, setInterviewTime] = useState('');
  const [interviewMode, setInterviewMode] = useState<InterviewMode>('ONLINE');
  const [interviewNotes, setInterviewNotes] = useState('');
  const [schedulingLoading, setSchedulingLoading] = useState(false);

  useEffect(() => {
    if (jobId) {
      loadPipeline(jobId);
    }
  }, [jobId]);

  const loadPipeline = async (id: string) => {
    setLoading(true);
    try {
      const [jobData, applicantsData] = await Promise.all([
        jobApi.getJobById(id),
        applicationApi.getJobApplicants(id),
      ]);
      setJob(jobData);
      setApplicants(applicantsData);
    } catch (err) {
      console.error('Failed to load applicant pipeline', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appId: string, newStatus: ApplicationStatus) => {
    try {
      await applicationApi.updateStatus(appId, newStatus);
      setApplicants((prev) =>
        prev.map((app) => (app.applicationId === appId ? { ...app, status: newStatus } : app))
      );
    } catch (err) {
      console.error('Failed to update status', err);
      alert('Could not update application status.');
    }
  };

  const handleScheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedulingAppId || !interviewTime) {
      alert('Please specify an interview time.');
      return;
    }

    setSchedulingLoading(true);
    try {
      const payload: ScheduleInterviewPayload = {
        scheduledTime: new Date(interviewTime).toISOString(),
        mode: interviewMode,
        notes: interviewNotes || undefined,
      };

      await applicationApi.scheduleInterview(schedulingAppId, payload);

      // Update local state
      setApplicants((prev) =>
        prev.map((app) =>
          app.applicationId === schedulingAppId
            ? {
                ...app,
                status: 'INTERVIEW_SCHEDULED',
                interview: {
                  id: `int-${Date.now()}`,
                  scheduledTime: payload.scheduledTime,
                  mode: payload.mode,
                  status: 'SCHEDULED',
                  notes: payload.notes,
                },
              }
            : app
        )
      );

      setSchedulingAppId(null);
      setInterviewTime('');
      setInterviewNotes('');
    } catch (err) {
      console.error('Failed to schedule interview', err);
      alert('Failed to schedule interview. Please check the inputs.');
    } finally {
      setSchedulingLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving ranked applicant pipeline..." size="lg" />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn">
      {/* Back button */}
      <Link
        to="/recruiter/dashboard"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      {/* Header Requisition Details */}
      {job && (
        <div className="glass-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-1">
              <CategoryBadge category={job.roleCategory} />
              <span className="text-xs text-muted-foreground font-medium">&bull; {job.companyName}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">{job.title}</h1>
            <p className="text-xs text-muted-foreground">
              {job.applicantsCount} Total Applicants &bull; Sorted by 60/40 Hybrid Compatibility
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 max-w-sm">
            {job.requiredSkills.map((skill, i) => (
              <span
                key={i}
                className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-muted border border-border text-foreground/80"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Applicant Board */}
      <div className="glass-card p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border/70">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Ranked Candidate Pipeline ({applicants.length})
          </h2>
          <span className="text-xs text-muted-foreground">Ranked by matchScore DESC</span>
        </div>

        {applicants.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-xs">
            No candidates have applied for this position yet.
          </div>
        ) : (
          <div className="divide-y divide-border/60 space-y-4 pt-1">
            {applicants.map((app, index) => (
              <div
                key={app.applicationId}
                className="pt-4 first:pt-0 flex flex-col gap-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-muted text-muted-foreground text-[11px] font-bold flex items-center justify-center shrink-0">
                        #{index + 1}
                      </span>
                      <h3 className="text-base font-bold text-foreground">{app.candidateName}</h3>
                      <span className="text-xs text-muted-foreground">({app.candidateEmail})</span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground pt-0.5 font-medium">
                      <span>Applied: {new Date(app.appliedAt).toLocaleDateString()}</span>
                      {app.resumeUrl && (
                        <a
                          href={app.resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary hover:underline flex items-center gap-1 font-semibold"
                        >
                          <FileText className="w-3.5 h-3.5" /> View Resume PDF
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Actions & Status */}
                  <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
                    <MatchScoreBadge score={app.matchScore} />

                    {/* Pipeline Status Selector */}
                    <select
                      value={app.status}
                      onChange={(e) =>
                        handleStatusChange(app.applicationId, e.target.value as ApplicationStatus)
                      }
                      className="px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs font-semibold text-foreground focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    >
                      <option value="APPLIED">APPLIED</option>
                      <option value="SHORTLISTED">SHORTLISTED</option>
                      <option value="INTERVIEW_SCHEDULED">INTERVIEW_SCHEDULED</option>
                      <option value="HIRED">HIRED</option>
                      <option value="REJECTED">REJECTED</option>
                    </select>

                    <Button
                      type="button"
                      onClick={() => setSchedulingAppId(app.applicationId)}
                      variant="indigo"
                      size="sm"
                      className="gap-1 font-semibold shadow-sm"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      {app.interview ? 'Reschedule' : 'Interview'}
                    </Button>
                  </div>
                </div>

                {/* Skills Match Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-muted/30 p-3.5 rounded-xl border border-border/70">
                  <div className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-muted-foreground font-medium">Matched Skills:</span>{' '}
                      <span className="text-foreground font-medium">
                        {app.matchedSkills.length > 0 ? app.matchedSkills.join(', ') : 'None'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <XCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-muted-foreground font-medium">Missing Skills:</span>{' '}
                      <span className="text-foreground font-medium">
                        {app.missingSkills.length > 0 ? app.missingSkills.join(', ') : 'None'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Interview Information Banner if Present */}
                {app.interview && (
                  <div className="p-3.5 bg-indigo-50 border border-indigo-200 dark:bg-indigo-950/30 dark:border-indigo-500/20 text-indigo-950 dark:text-indigo-200 rounded-xl flex flex-wrap items-center justify-between gap-4 text-xs font-medium">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-indigo-700 dark:text-indigo-300 font-semibold">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(app.interview.scheduledTime).toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1 text-foreground/80">
                        {app.interview.mode === 'ONLINE' ? (
                          <Video className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                        ) : (
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        )}
                        Mode: {app.interview.mode}
                      </span>
                    </div>
                    {app.interview.notes && (
                      <span className="text-muted-foreground italic">"{app.interview.notes}"</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Interview Scheduling Modal */}
      <Modal
        isOpen={!!schedulingAppId}
        onClose={() => setSchedulingAppId(null)}
        title="Schedule Candidate Interview"
      >
        <form onSubmit={handleScheduleInterview} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground/80 mb-1.5">
              Interview Date & Time *
            </label>
            <input
              type="datetime-local"
              value={interviewTime}
              onChange={(e) => setInterviewTime(e.target.value)}
              required
              className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground/80 mb-1.5">
              Interview Mode *
            </label>
            <select
              value={interviewMode}
              onChange={(e) => setInterviewMode(e.target.value as InterviewMode)}
              className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            >
              <option value="ONLINE">Online (Virtual Meeting / Google Meet)</option>
              <option value="OFFLINE">In-Person (On-site Office)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground/80 mb-1.5">
              Meeting Link or Office Location Notes
            </label>
            <textarea
              rows={3}
              value={interviewNotes}
              onChange={(e) => setInterviewNotes(e.target.value)}
              placeholder="e.g. Google Meet link: meet.google.com/xyz or Office 4th floor conference room..."
              className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              onClick={() => setSchedulingAppId(null)}
              variant="outline"
              size="sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={schedulingLoading}
              isLoading={schedulingLoading}
              variant="indigo"
              size="sm"
              className="shadow-md font-bold"
            >
              {schedulingLoading ? 'Scheduling...' : 'Confirm & Schedule'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default ApplicantListPage;
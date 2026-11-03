import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { recruiterApi } from '../../api/recruiterApi';
import { RecruiterDashboardData } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import { CategoryBadge, JobStatusBadge, MatchScoreBadge, ApplicationStatusBadge } from '../../components/Badge';
import Button from '../../components/ui/Button';
import { 
  Briefcase, 
  Users, 
  UserCheck, 
  PlusCircle, 
  Sparkles, 
  ArrowRight, 
  Layers
} from 'lucide-react';

export const RecruiterDashboard: React.FC = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<RecruiterDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await recruiterApi.getDashboard();
      setDashboard(data);
    } catch (err) {
      console.error('Failed to load recruiter dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading recruiter command center..." size="lg" />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="glass-card bg-gradient-to-r from-indigo-50/60 via-card to-indigo-100/30 dark:from-slate-900 dark:via-card dark:to-indigo-950/30 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20 text-xs font-semibold mb-2">
            <Layers className="w-3.5 h-3.5" /> Hiring Pipeline Intelligence
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Welcome, {user?.name}!
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl">
            Monitor applicant rankings, evaluate 60/40 hybrid AI compatibility, and schedule interviews effortlessly.
          </p>
        </div>

        <div>
          <Link to="/recruiter/jobs/new">
            <Button variant="indigo" size="md" className="gap-2 shadow-md font-bold">
              <PlusCircle className="w-4 h-4" /> Create Job Requisition
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-medium">Open Requisitions</div>
            <div className="text-2xl font-extrabold text-foreground mt-0.5">{dashboard?.openJobs ?? 0}</div>
            <div className="text-[11px] text-muted-foreground/80 mt-0.5">Actively accepting applications</div>
          </div>
        </div>

        <div className="glass-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-medium">Total Applicants</div>
            <div className="text-2xl font-extrabold text-foreground mt-0.5">{dashboard?.totalApplicants ?? 0}</div>
            <div className="text-[11px] text-muted-foreground/80 mt-0.5">Across all job postings</div>
          </div>
        </div>

        <div className="glass-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 flex items-center justify-center shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-medium">Shortlisted Candidates</div>
            <div className="text-2xl font-extrabold text-foreground mt-0.5">{dashboard?.shortlisted ?? 0}</div>
            <div className="text-[11px] text-muted-foreground/80 mt-0.5">Ready for interviews</div>
          </div>
        </div>
      </div>

      {/* Top Scorers Leaderboard */}
      {dashboard && dashboard.topScorers.length > 0 && (
        <div className="glass-card p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/70">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Top AI-Ranked Candidates
              </h2>
            </div>
            <span className="text-xs text-muted-foreground">Sorted by 60/40 Hybrid Compatibility</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/70 text-muted-foreground font-semibold">
                  <th className="py-3 px-3">Candidate</th>
                  <th className="py-3 px-3">Role Applied</th>
                  <th className="py-3 px-3">Hybrid Match Score</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {dashboard.topScorers.map((scorer) => (
                  <tr key={scorer.applicationId} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3 px-3 font-semibold text-foreground">{scorer.candidateName}</td>
                    <td className="py-3 px-3 text-muted-foreground">{scorer.jobTitle}</td>
                    <td className="py-3 px-3">
                      <MatchScoreBadge score={scorer.matchScore} />
                    </td>
                    <td className="py-3 px-3">
                      <ApplicationStatusBadge status={scorer.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Job Requisitions Table */}
      <div className="glass-card p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border/70">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Active Job Postings ({dashboard?.jobs.length || 0})
            </h2>
          </div>
          <Link
            to="/recruiter/jobs/new"
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
          >
            + Post Requisition
          </Link>
        </div>

        {dashboard?.jobs.length === 0 ? (
          <div className="text-center py-8 text-xs text-muted-foreground">
            No job requisitions created yet. Click above to post your first job opening.
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {dashboard?.jobs.map((job) => (
              <div
                key={job.id}
                className="py-4 first:pt-2 last:pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <CategoryBadge category={job.roleCategory} />
                    <JobStatusBadge status={job.status} />
                  </div>
                  <h3 className="text-base font-bold text-foreground">{job.title}</h3>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-muted-foreground/80" /> {job.applicantsCount} applicants
                    </span>
                    <span>Created {new Date(job.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Link to={`/recruiter/jobs/${job.id}/applicants`}>
                    <Button variant="indigo" size="sm" className="gap-1.5 font-semibold">
                      View Ranked Applicants ({job.applicantsCount}) <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default RecruiterDashboard;
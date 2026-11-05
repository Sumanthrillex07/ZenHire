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
      <div className="furnace-hero-frame rounded-[32px] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-smoke/70 shadow-fanned">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-crimson/10 text-crimson border border-crimson/25 font-mono text-xs tracking-wider uppercase mb-3">
            <Layers className="w-3.5 h-3.5" /> &#123; TALENT INTELLIGENCE COCKPIT &#125;_
          </div>
          <h1 className="text-2xl sm:text-4xl font-display font-medium text-foreground tracking-tight">
            Welcome, {user?.name}!
          </h1>
          <p className="font-mono text-xs sm:text-sm text-pewter dark:text-pewter light:text-slate-600 mt-2 max-w-xl leading-relaxed">
            Monitor applicant rankings, evaluate 60/40 hybrid AI compatibility, and schedule interviews effortlessly.
          </p>
        </div>

        <div className="relative z-10">
          <Link to="/recruiter/jobs/new">
            <Button variant="primary" size="md" className="gap-2 shadow-md">
              <PlusCircle className="w-4 h-4" /> Create Job Requisition
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex items-center gap-4 rounded-[24px] border border-smoke/70 bg-carbon">
          <div className="w-12 h-12 rounded-[18px] bg-ash text-crimson border border-smoke/70 flex items-center justify-center shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <div className="font-mono text-xs text-pewter">Open Requisitions</div>
            <div className="text-2xl font-display font-medium text-foreground mt-0.5">{dashboard?.openJobs ?? 0}</div>
            <div className="font-mono text-[11px] text-pewter/80 mt-0.5">Actively accepting applications</div>
          </div>
        </div>

        <div className="glass-card p-6 flex items-center gap-4 rounded-[24px] border border-smoke/70 bg-carbon">
          <div className="w-12 h-12 rounded-[18px] bg-ash text-emerald-400 border border-smoke/70 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="font-mono text-xs text-pewter">Total Applicants</div>
            <div className="text-2xl font-display font-medium text-foreground mt-0.5">{dashboard?.totalApplicants ?? 0}</div>
            <div className="font-mono text-[11px] text-pewter/80 mt-0.5">Across all job postings</div>
          </div>
        </div>

        <div className="glass-card p-6 flex items-center gap-4 rounded-[24px] border border-smoke/70 bg-carbon">
          <div className="w-12 h-12 rounded-[18px] bg-ash text-syntax-variable border border-smoke/70 flex items-center justify-center shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="font-mono text-xs text-pewter">Shortlisted Candidates</div>
            <div className="text-2xl font-display font-medium text-foreground mt-0.5">{dashboard?.shortlisted ?? 0}</div>
            <div className="font-mono text-[11px] text-pewter/80 mt-0.5">Ready for interviews</div>
          </div>
        </div>
      </div>

      {/* Top Scorers Leaderboard */}
      {dashboard && dashboard.topScorers.length > 0 && (
        <div className="glass-card p-6 sm:p-8 space-y-4 rounded-[24px] border border-smoke/70 bg-carbon">
          <div className="flex items-center justify-between pb-3 border-b border-smoke/70">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-crimson" />
              <h2 className="font-mono text-xs text-pewter uppercase tracking-wider">
                Top AI-Ranked Candidates
              </h2>
            </div>
            <span className="font-mono text-xs text-pewter">Sorted by 60/40 Hybrid Compatibility</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-smoke/70 text-pewter font-medium">
                  <th className="py-3 px-3">Candidate</th>
                  <th className="py-3 px-3">Role Applied</th>
                  <th className="py-3 px-3">Hybrid Match Score</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-smoke/50">
                {dashboard.topScorers.map((scorer) => (
                  <tr key={scorer.applicationId} className="hover:bg-ash/40 transition-colors">
                    <td className="py-3 px-3 font-display font-medium text-foreground">{scorer.candidateName}</td>
                    <td className="py-3 px-3 text-pewter">{scorer.jobTitle}</td>
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
      <div className="glass-card p-6 sm:p-8 space-y-4 rounded-[24px] border border-smoke/70 bg-carbon">
        <div className="flex items-center justify-between pb-3 border-b border-smoke/70">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-crimson" />
            <h2 className="font-mono text-xs text-pewter uppercase tracking-wider">
              Active Job Postings ({dashboard?.jobs.length || 0})
            </h2>
          </div>
          <Link
            to="/recruiter/jobs/new"
            className="font-mono text-xs text-crimson hover:underline flex items-center gap-1"
          >
            + Post Requisition
          </Link>
        </div>

        {dashboard?.jobs.length === 0 ? (
          <div className="text-center py-8 font-mono text-xs text-pewter">
            No job requisitions created yet. Click above to post your first job opening.
          </div>
        ) : (
          <div className="divide-y divide-smoke/60">
            {dashboard?.jobs.map((job) => (
              <div
                key={job.id}
                className="py-4 first:pt-2 last:pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CategoryBadge category={job.roleCategory} />
                    <JobStatusBadge status={job.status} />
                  </div>
                  <h3 className="text-base font-display font-medium text-foreground">{job.title}</h3>
                  <div className="flex items-center gap-4 font-mono text-xs text-pewter mt-1">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-pewter" /> {job.applicantsCount} applicants
                    </span>
                    <span>Created {new Date(job.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Link to={`/recruiter/jobs/${job.id}/applicants`}>
                    <Button variant="outline" size="sm" className="gap-1.5 font-mono">
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
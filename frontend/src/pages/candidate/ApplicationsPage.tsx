import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { applicationApi } from '../../api/applicationApi';
import { Application } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import { ApplicationStatusBadge, CategoryBadge, MatchScoreBadge } from '../../components/Badge';
import Button from '../../components/ui/Button';
import { 
  Briefcase, 
  Building2, 
  Calendar, 
  Video, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ArrowRight
} from 'lucide-react';

export const ApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const data = await applicationApi.getCandidateApplications();
      setApplications(data);
    } catch (err) {
      console.error('Failed to load candidate applications', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving your application pipeline..." size="lg" />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20 text-xs font-semibold mb-2">
          <Briefcase className="w-3.5 h-3.5" /> Pipeline Status
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          My Applications
        </h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
          Track the live status of your job applications, hybrid match scores, and interview schedules.
        </p>
      </div>

      {applications.length === 0 ? (
        <div className="glass-card p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto text-muted-foreground">
            <Briefcase className="w-8 h-8" />
          </div>
          <div className="max-w-sm mx-auto">
            <h3 className="text-base font-bold text-foreground">No active applications yet</h3>
            <p className="text-xs text-muted-foreground mt-1">
              You haven't applied to any roles yet. Explore open requisitions and take prerequisite tests to apply.
            </p>
          </div>
          <div className="pt-2">
            <Link to="/jobs">
              <Button variant="primary" size="md" className="gap-1.5 font-bold shadow-md">
                Find Open Jobs <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="glass-card hover:border-border/90 p-6 space-y-4 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <CategoryBadge category={app.roleCategory} />
                    <span className="text-xs text-muted-foreground font-medium">
                      &bull; Applied {new Date(app.appliedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground hover:text-primary transition-colors">
                    <Link to={`/jobs/${app.jobId}`}>{app.jobTitle}</Link>
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <Building2 className="w-3.5 h-3.5 text-muted-foreground/80" />
                    <span className="font-medium text-foreground/80">{app.companyName}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MatchScoreBadge score={app.matchScore} />
                  <ApplicationStatusBadge status={app.status} />
                </div>
              </div>

              {/* Skills Overlap */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-muted-foreground font-medium">Matched Skills:</span>{' '}
                    <span className="text-foreground font-medium">
                      {app.matchedSkills.length > 0 ? app.matchedSkills.join(', ') : 'None'}
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-muted-foreground font-medium">Missing Skills:</span>{' '}
                    <span className="text-foreground font-medium">
                      {app.missingSkills.length > 0 ? app.missingSkills.join(', ') : 'None'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Interview Banner if interview scheduled */}
              {app.interview && (
                <div className="p-4 bg-indigo-50 border border-indigo-200 text-indigo-950 dark:bg-indigo-950/30 dark:border-indigo-500/30 dark:text-indigo-200 rounded-xl space-y-2 mt-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-400">
                      <Calendar className="w-4 h-4" /> Interview Scheduled
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                      {app.interview.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-6 text-xs text-foreground/80">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      {new Date(app.interview.scheduledTime).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                      {app.interview.mode === 'ONLINE' ? (
                        <Video className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                      ) : (
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      )}
                      Mode: {app.interview.mode}
                    </span>
                  </div>

                  {app.interview.notes && (
                    <p className="text-xs text-muted-foreground pt-1.5 border-t border-indigo-200/60 dark:border-indigo-900/50">
                      <b className="text-foreground font-semibold">Recruiter Notes:</b> {app.interview.notes}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default ApplicationsPage;
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-crimson/10 text-crimson border border-crimson/25 font-mono text-xs tracking-wider uppercase mb-3">
          <Briefcase className="w-3.5 h-3.5" /> &#123; CANDIDATE REQUISITION PIPELINE &#125;_
        </div>
        <h1 className="text-2xl sm:text-4xl font-display font-medium text-foreground tracking-tight">
          My Applications
        </h1>
        <p className="font-mono text-xs sm:text-sm text-pewter dark:text-pewter light:text-slate-600 mt-2 max-w-2xl leading-relaxed">
          Track the live status of your job applications, hybrid match scores, and interview schedules.
        </p>
      </div>

      {applications.length === 0 ? (
        <div className="glass-card p-12 text-center space-y-4 rounded-[24px] border border-smoke/70 bg-carbon">
          <div className="w-16 h-16 rounded-[20px] bg-ash border border-smoke/70 flex items-center justify-center mx-auto text-pewter">
            <Briefcase className="w-8 h-8" />
          </div>
          <div className="max-w-sm mx-auto">
            <h3 className="text-base font-display font-medium text-foreground">No active applications yet</h3>
            <p className="font-mono text-xs text-pewter mt-1">
              You haven't applied to any roles yet. Explore open requisitions and take prerequisite tests to apply.
            </p>
          </div>
          <div className="pt-2">
            <Link to="/jobs">
              <Button variant="primary" size="md" className="gap-1.5 shadow-md">
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
              className="glass-card hover:border-crimson/40 p-6 sm:p-7 space-y-4 transition-all rounded-[24px] border border-smoke/70 bg-carbon"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CategoryBadge category={app.roleCategory} />
                    <span className="font-mono text-xs text-pewter">
                      &bull; Applied {new Date(app.appliedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-display font-medium text-foreground hover:text-crimson transition-colors">
                    <Link to={`/jobs/${app.jobId}`}>{app.jobTitle}</Link>
                  </h3>
                  <div className="flex items-center gap-2 font-mono text-xs text-pewter mt-1">
                    <Building2 className="w-3.5 h-3.5 text-pewter" />
                    <span>{app.companyName}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MatchScoreBadge score={app.matchScore} />
                  <ApplicationStatusBadge status={app.status} />
                </div>
              </div>

              {/* Skills Overlap */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 font-mono text-xs">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-pewter">Matched Skills:</span>{' '}
                    <span className="text-foreground">
                      {app.matchedSkills.length > 0 ? app.matchedSkills.join(', ') : 'None'}
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-crimson shrink-0 mt-0.5" />
                  <div>
                    <span className="text-pewter">Missing Skills:</span>{' '}
                    <span className="text-foreground">
                      {app.missingSkills.length > 0 ? app.missingSkills.join(', ') : 'None'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Interview Banner if interview scheduled */}
              {app.interview && (
                <div className="p-4 bg-ash border border-crimson/30 rounded-[20px] space-y-2 mt-2 font-mono text-xs">
                  <div className="flex items-center justify-between font-display font-medium">
                    <div className="flex items-center gap-1.5 text-crimson">
                      <Calendar className="w-4 h-4" /> Interview Scheduled
                    </div>
                    <span className="px-3 py-0.5 rounded-full bg-crimson/10 border border-crimson/30 font-mono text-[10px] text-crimson">
                      {app.interview.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-6 text-foreground/80">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-crimson" />
                      {new Date(app.interview.scheduledTime).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1.5">
                      {app.interview.mode === 'ONLINE' ? (
                        <Video className="w-3.5 h-3.5 text-syntax-variable" />
                      ) : (
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                      Mode: {app.interview.mode}
                    </span>
                  </div>

                  {app.interview.notes && (
                    <p className="text-pewter pt-1.5 border-t border-smoke/70">
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
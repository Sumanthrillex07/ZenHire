import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { applicationApi } from '../../api/applicationApi';
import { Application } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import { ApplicationStatusBadge, CategoryBadge, MatchScoreBadge } from '../../components/Badge';
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-400 text-xs font-semibold mb-2">
          <Briefcase className="w-3.5 h-3.5" /> Pipeline Status
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          My Applications
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-2xl">
          Track the live status of your job applications, hybrid match scores, and interview schedules.
        </p>
      </div>

      {applications.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No active applications yet</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto mb-6">
            You haven't applied to any roles yet. Explore open requisitions and take prerequisite tests to apply.
          </p>
          <Link
            to="/jobs"
            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-colors inline-flex items-center gap-1.5"
          >
            Find Open Jobs <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="glass-card hover:border-slate-700 p-6 space-y-4 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <CategoryBadge category={app.roleCategory} />
                    <span className="text-xs text-slate-500">&bull; Applied {new Date(app.appliedAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white hover:text-emerald-400 transition-colors">
                    <Link to={`/jobs/${app.jobId}`}>{app.jobTitle}</Link>
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>{app.companyName}</span>
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
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400">Matched Skills:</span>{' '}
                    <span className="text-slate-200">
                      {app.matchedSkills.length > 0 ? app.matchedSkills.join(', ') : 'None'}
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400">Missing Skills:</span>{' '}
                    <span className="text-slate-200">
                      {app.missingSkills.length > 0 ? app.missingSkills.join(', ') : 'None'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Interview Banner if interview scheduled */}
              {app.interview && (
                <div className="p-4 bg-indigo-950/40 border border-indigo-500/30 rounded-xl space-y-2 mt-2">
                  <div className="flex items-center justify-between text-xs font-bold text-indigo-300">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-indigo-400" /> Interview Scheduled
                    </div>
                    <span className="px-2 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/40 text-[10px]">
                      {app.interview.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-6 text-xs text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      {new Date(app.interview.scheduledTime).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1.5">
                      {app.interview.mode === 'ONLINE' ? (
                        <Video className="w-3.5 h-3.5 text-cyan-400" />
                      ) : (
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                      Mode: {app.interview.mode}
                    </span>
                  </div>

                  {app.interview.notes && (
                    <p className="text-xs text-slate-400 pt-1 border-t border-indigo-900/50">
                      <b className="text-slate-300">Recruiter Notes:</b> {app.interview.notes}
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

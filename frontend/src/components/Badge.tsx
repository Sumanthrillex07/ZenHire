import React from 'react';
import { ApplicationStatus, RoleCategory, JobStatus } from '../types';

interface StatusBadgeProps {
  status: ApplicationStatus;
}

export const ApplicationStatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'APPLIED':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20">
          Applied
        </span>
      );
    case 'SHORTLISTED':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20">
          Shortlisted
        </span>
      );
    case 'INTERVIEW_SCHEDULED':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20">
          Interview Scheduled
        </span>
      );
    case 'HIRED':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
          Hired
        </span>
      );
    case 'REJECTED':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20">
          Rejected
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
          {status}
        </span>
      );
  }
};

export const CategoryBadge: React.FC<{ category: RoleCategory }> = ({ category }) => {
  switch (category) {
    case 'FRONTEND':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/20">
          Frontend
        </span>
      );
    case 'BACKEND':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
          Backend
        </span>
      );
    case 'AI_ML':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20">
          AI / ML
        </span>
      );
    default:
      return null;
  }
};

export const JobStatusBadge: React.FC<{ status: JobStatus }> = ({ status }) => {
  return status === 'OPEN' ? (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
      Open
    </span>
  ) : (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
      Closed
    </span>
  );
};

export const MatchScoreBadge: React.FC<{ score: number }> = ({ score }) => {
  let color =
    'bg-red-50 text-red-700 border-red-200 dark:text-red-400 dark:bg-red-500/10 dark:border-red-500/30';
  if (score >= 75) {
    color =
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/30';
  } else if (score >= 50) {
    color =
      'bg-amber-50 text-amber-700 border-amber-200 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/30';
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${color}`}>
      <span>{score}%</span>
      <span className="text-[10px] opacity-80 font-normal">Match</span>
    </span>
  );
};

export default ApplicationStatusBadge;

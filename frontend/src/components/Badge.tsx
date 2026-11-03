import React from 'react';
import { ApplicationStatus, RoleCategory, JobStatus } from '../types';

interface StatusBadgeProps {
  status: ApplicationStatus;
}

export const ApplicationStatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'APPLIED':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          Applied
        </span>
      );
    case 'SHORTLISTED':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
          Shortlisted
        </span>
      );
    case 'INTERVIEW_SCHEDULED':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
          Interview Scheduled
        </span>
      );
    case 'HIRED':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Hired
        </span>
      );
    case 'REJECTED':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
          Rejected
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
          {status}
        </span>
      );
  }
};

export const CategoryBadge: React.FC<{ category: RoleCategory }> = ({ category }) => {
  switch (category) {
    case 'FRONTEND':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          Frontend
        </span>
      );
    case 'BACKEND':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Backend
        </span>
      );
    case 'AI_ML':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          AI / ML
        </span>
      );
    default:
      return null;
  }
};

export const JobStatusBadge: React.FC<{ status: JobStatus }> = ({ status }) => {
  return status === 'OPEN' ? (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
      Open
    </span>
  ) : (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
      Closed
    </span>
  );
};

export const MatchScoreBadge: React.FC<{ score: number }> = ({ score }) => {
  let color = 'text-red-400 bg-red-500/10 border-red-500/30';
  if (score >= 75) {
    color = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  } else if (score >= 50) {
    color = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${color}`}>
      <span>{score}%</span>
      <span className="text-[10px] opacity-80 font-normal">Match</span>
    </span>
  );
};


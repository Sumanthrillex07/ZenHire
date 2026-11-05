import React from 'react';
import { ApplicationStatus, RoleCategory, JobStatus } from '../types';

interface StatusBadgeProps {
  status: ApplicationStatus;
}

export const ApplicationStatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'APPLIED':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-[#ffa657]/10 text-[#d97706] dark:text-[#ffa657] border border-[#ffa657]/30">
          Applied
        </span>
      );
    case 'SHORTLISTED':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-[#ea2845]/10 text-[#ea2845] border border-[#ea2845]/30 shadow-xs">
          Shortlisted
        </span>
      );
    case 'INTERVIEW_SCHEDULED':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-[#0284c7]/10 text-[#0284c7] dark:bg-[#a5d6ff]/10 dark:text-[#a5d6ff] border border-[#0284c7]/30 dark:border-[#a5d6ff]/30">
          Interview Scheduled
        </span>
      );
    case 'HIRED':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
          Hired
        </span>
      );
    case 'REJECTED':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-[#780f20]/20 text-[#ea2845] border border-[#ea2845]/30">
          Rejected
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-[#f0eded] text-[#050303] border border-[#ded9d9] dark:bg-[#1e1c1c] dark:text-[#9b9a9a] dark:border-[#373535]">
          {status}
        </span>
      );
  }
};

export const CategoryBadge: React.FC<{ category: RoleCategory }> = ({ category }) => {
  switch (category) {
    case 'FRONTEND':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-transparent text-[#050303] dark:text-white border border-[#ded9d9] dark:border-[#373535] hover:border-[#ea2845]/40 transition-colors">
          Frontend
        </span>
      );
    case 'BACKEND':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-transparent text-[#050303] dark:text-white border border-[#ded9d9] dark:border-[#373535] hover:border-[#ea2845]/40 transition-colors">
          Backend
        </span>
      );
    case 'AI_ML':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-[#ea2845]/10 text-[#ea2845] border border-[#ea2845]/30 hover:bg-[#ea2845]/15 transition-colors">
          AI / ML
        </span>
      );
    default:
      return null;
  }
};

export const JobStatusBadge: React.FC<{ status: JobStatus }> = ({ status }) => {
  return status === 'OPEN' ? (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
      Open
    </span>
  ) : (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-[#f0eded] text-[#6e6868] border border-[#ded9d9] dark:bg-[#1e1c1c] dark:text-[#9b9a9a] dark:border-[#373535]">
      Closed
    </span>
  );
};

export const MatchScoreBadge: React.FC<{ score: number }> = ({ score }) => {
  let color =
    'bg-[#780f20]/20 text-[#ea2845] border-[#ea2845]/30';
  if (score >= 75) {
    color =
      'bg-[#ea2845]/10 text-[#ea2845] border-[#ea2845]/35 shadow-xs';
  } else if (score >= 50) {
    color =
      'bg-[#ffa657]/10 text-[#d97706] dark:text-[#ffa657] border-[#ffa657]/30';
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold border ${color}`}>
      <span>{score}%</span>
      <span className="text-[10px] opacity-80 font-normal">Match</span>
    </span>
  );
};

export default ApplicationStatusBadge;

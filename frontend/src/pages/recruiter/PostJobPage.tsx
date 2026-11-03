import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { jobApi } from '../../api/jobApi';
import { RoleCategory } from '../../types';
import { PlusCircle, X, ChevronLeft, AlertCircle, Briefcase } from 'lucide-react';

export const PostJobPage: React.FC = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [roleCategory, setRoleCategory] = useState<RoleCategory>('BACKEND');
  const [description, setDescription] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [requiredSkills, setRequiredSkills] = useState<string[]>([
    'Java',
    'Spring Boot',
    'PostgreSQL',
  ]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !requiredSkills.includes(trimmed)) {
      setRequiredSkills((prev) => [...prev, trimmed]);
      setSkillInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setRequiredSkills((prev) => prev.filter((s) => s !== skillToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Please provide a title and job description.');
      return;
    }

    if (requiredSkills.length === 0) {
      setError('Please add at least one required skill tag.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await jobApi.createJob({
        title,
        roleCategory,
        description,
        requiredSkills,
      });
      navigate('/recruiter/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error?.details || 'Failed to create job posting.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back button */}
      <Link
        to="/recruiter/dashboard"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Recruiter Dashboard
      </Link>

      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-400 text-xs font-semibold mb-2">
          <Briefcase className="w-3.5 h-3.5" /> Requisition Authoring
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Create New Job Opening
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Post an open engineering position. Candidates will be evaluated against your required skills and gated through domain assessments.
        </p>
      </div>

      <div className="glass-card p-6 sm:p-8 border border-slate-800">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Job Title */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Job Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior Backend Engineer (Java / Distributed Systems)"
              required
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Role Category */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Role Category & Assessment Track *
            </label>
            <select
              value={roleCategory}
              onChange={(e) => setRoleCategory(e.target.value as RoleCategory)}
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              <option value="BACKEND">Backend Engineering</option>
              <option value="FRONTEND">Frontend Engineering</option>
              <option value="AI_ML">AI & Machine Learning</option>
            </select>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Candidates must pass the prerequisite assessment for this track before their application unlocks.
            </p>
          </div>

          {/* Required Skills Builder */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Required Technical Stack & Skills ({requiredSkills.length}) *
            </label>

            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type skill name and press Enter or click Add (e.g. Docker, Kafka, Redis)"
                className="flex-1 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
              >
                Add Skill
              </button>
            </div>

            {/* Active Chips */}
            <div className="flex flex-wrap gap-2 min-h-8">
              {requiredSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 rounded-lg text-xs font-medium"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-red-400 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Job Description */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Comprehensive Role Description & Scope *
            </label>
            <textarea
              rows={8}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail the technical responsibilities, architecture challenges, team structure, and qualifications expected..."
              required
              className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
            />
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <Link
              to="/recruiter/dashboard"
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-colors shadow-md flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              {loading ? 'Publishing...' : 'Publish Job Opening'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default PostJobPage;

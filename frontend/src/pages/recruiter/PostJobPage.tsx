import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { jobApi } from '../../api/jobApi';
import { RoleCategory } from '../../types';
import Button from '../../components/ui/Button';
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn">
      {/* Back button */}
      <Link
        to="/recruiter/dashboard"
        className="inline-flex items-center gap-1.5 font-mono text-xs text-pewter hover:text-foreground transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Recruiter Dashboard
      </Link>

      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-crimson/10 text-crimson border border-crimson/25 font-mono text-xs tracking-wider uppercase mb-3">
          <Briefcase className="w-3.5 h-3.5" /> &#123; REQUISITION AUTHORING STUDIO &#125;_
        </div>
        <h1 className="text-2xl sm:text-4xl font-display font-medium text-foreground tracking-tight">
          Create New Job Opening
        </h1>
        <p className="font-mono text-xs sm:text-sm text-pewter dark:text-pewter light:text-slate-600 mt-2 max-w-xl leading-relaxed">
          Post an open engineering position. Candidates will be evaluated against your required skills and gated through domain assessments.
        </p>
      </div>

      <div className="glass-card p-6 sm:p-8 rounded-[24px] border border-smoke/70 bg-carbon">
        {error && (
          <div className="mb-6 p-4 rounded-[20px] bg-crimson/10 border border-crimson/30 text-crimson text-xs font-mono flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Job Title */}
          <div>
            <label className="block font-mono text-xs text-pewter uppercase tracking-wider mb-2">
              Job Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior Backend Engineer (Java / Distributed Systems)"
              required
              className="w-full px-4 py-3 bg-ash border border-smoke/70 rounded-[20px] font-mono text-xs sm:text-sm text-foreground placeholder-pewter focus:outline-none focus:border-crimson focus:ring-1 focus:ring-crimson transition-all"
            />
          </div>

          {/* Role Category */}
          <div>
            <label className="block font-mono text-xs text-pewter uppercase tracking-wider mb-2">
              Role Category & Assessment Track *
            </label>
            <select
              value={roleCategory}
              onChange={(e) => setRoleCategory(e.target.value as RoleCategory)}
              className="w-full px-4 py-3 bg-ash border border-smoke/70 rounded-[20px] font-mono text-xs sm:text-sm text-foreground focus:outline-none focus:border-crimson focus:ring-1 focus:ring-crimson transition-all"
            >
              <option value="BACKEND">Backend Engineering</option>
              <option value="FRONTEND">Frontend Engineering</option>
              <option value="AI_ML">AI & Machine Learning</option>
            </select>
            <p className="font-mono text-[11px] text-pewter mt-1.5">
              Candidates must pass the prerequisite assessment for this track before their application unlocks.
            </p>
          </div>

          {/* Required Skills Builder */}
          <div>
            <label className="block font-mono text-xs text-pewter uppercase tracking-wider mb-2">
              Required Technical Stack & Skills ({requiredSkills.length}) *
            </label>

            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type skill name and press Enter (e.g. Docker, Kafka, Redis)"
                className="flex-1 px-4 py-2.5 bg-ash border border-smoke/70 rounded-[20px] font-mono text-xs text-foreground placeholder-pewter focus:outline-none focus:border-crimson focus:ring-1 focus:ring-crimson transition-all"
              />
              <Button
                type="button"
                onClick={handleAddSkill}
                variant="outline"
                size="sm"
              >
                Add Skill
              </Button>
            </div>

            {/* Active Chips */}
            <div className="flex flex-wrap gap-2 min-h-8">
              {requiredSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-ash border border-smoke/70 text-foreground rounded-full font-mono text-xs"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-crimson transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Job Description */}
          <div>
            <label className="block font-mono text-xs text-pewter uppercase tracking-wider mb-2">
              Comprehensive Role Description & Scope *
            </label>
            <textarea
              rows={8}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail the technical responsibilities, architecture challenges, team structure, and qualifications expected..."
              required
              className="w-full px-4 py-3 bg-ash border border-smoke/70 rounded-[20px] font-mono text-xs sm:text-sm text-foreground placeholder-pewter focus:outline-none focus:border-crimson focus:ring-1 focus:ring-crimson leading-relaxed transition-all"
            />
          </div>

          <div className="pt-4 border-t border-smoke/70 flex items-center justify-end gap-3">
            <Link to="/recruiter/dashboard">
              <Button variant="outline" size="md">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={loading}
              isLoading={loading}
              variant="primary"
              size="md"
              className="gap-1.5 shadow-md"
            >
              <PlusCircle className="w-4 h-4" />
              {loading ? 'Publishing...' : 'Publish Job Opening'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default PostJobPage;
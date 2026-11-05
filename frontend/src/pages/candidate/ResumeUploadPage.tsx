import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { resumeApi } from '../../api/resumeApi';
import { Resume, SkillProfileItem } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import Button from '../../components/ui/Button';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Briefcase, 
  GraduationCap, 
  ArrowRight,
  Loader2,
  FolderGit2,
  Award,
  Layers,
  Search,
  Quote
} from 'lucide-react';

export const ResumeUploadPage: React.FC = () => {
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [skillSearch, setSkillSearch] = useState('');

  useEffect(() => {
    loadResume();
  }, []);

  const loadResume = async () => {
    try {
      const data = await resumeApi.getLatestResume();
      setResume(data);
    } catch (err) {
      console.error('Failed to load resume', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFile = async (file: File) => {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF documents are supported (.pdf).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds the 10MB limit.');
      return;
    }

    setError(null);
    setSuccessMsg(null);
    setUploading(true);

    try {
      const updatedResume = await resumeApi.uploadResume(file);
      setResume(updatedResume);
      setSuccessMsg('Resume parsed, segmented into 5 sections, and skill profile synchronized!');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error?.details || 'Failed to parse resume.';
      setError(msg);
    } finally {
      setUploading(false);
    }
  };

  const onDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving resume profile..." />;
  }

  const skillProfile: SkillProfileItem[] = resume?.skillProfile || [];
  
  // Extract unique categories for filter pills
  const categories = ['ALL', ...Array.from(new Set(skillProfile.map(s => s.category).filter(Boolean)))];

  const filteredSkills = skillProfile.filter(item => {
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesSearch = !skillSearch || item.name.toLowerCase().includes(skillSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-crimson/10 text-crimson border border-crimson/25 font-mono text-xs tracking-wider uppercase mb-3">
          <Sparkles className="w-3.5 h-3.5" /> &#123; RESUME PARSER & TAXONOMY SYNC &#125;_
        </div>
        <h1 className="text-2xl sm:text-4xl font-display font-medium text-foreground tracking-tight">
          AI Resume Parser & Skill Profile
        </h1>
        <p className="font-mono text-xs sm:text-sm text-pewter dark:text-pewter light:text-slate-600 mt-2 max-w-2xl leading-relaxed">
          Upload your latest PDF resume. Our pipeline extracts your tech stack across 5 core sections (Skills, Experience, Projects, Education, Certifications) using Apache PDFBox, multi-word NLP phrase matching, and Gemini 1.5 Flash evidence validation.
        </p>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-[20px] bg-crimson/10 border border-crimson/30 text-crimson text-xs font-mono flex items-center gap-2.5 animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-[20px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Upload Dropzone */}
      <div
        onDragEnter={onDrag}
        onDragLeave={onDrag}
        onDragOver={onDrag}
        onDrop={onDrop}
        className={`glass-card p-8 sm:p-12 text-center rounded-[24px] border-2 border-dashed transition-all ${
          dragActive
            ? 'border-crimson bg-crimson/5 ring-4 ring-crimson/10'
            : 'border-border hover:border-crimson/50 hover:bg-muted/30'
        }`}
      >
        <div className="max-w-md mx-auto flex flex-col items-center">
          <div className="w-16 h-16 rounded-[20px] bg-muted border border-border flex items-center justify-center mb-4 transition-transform group-hover:scale-105 shadow-sm">
            {uploading ? (
              <Loader2 className="w-8 h-8 text-crimson animate-spin" />
            ) : (
              <UploadCloud className="w-8 h-8 text-crimson" />
            )}
          </div>

          <h3 className="text-base sm:text-lg font-display font-medium text-foreground mb-1">
            {uploading ? 'Parsing Sections & Validating Skills...' : 'Upload your resume PDF'}
          </h3>
          <p className="font-mono text-xs text-muted-foreground mb-6 max-w-sm">
            Drag and drop your file here, or click to browse. Max file size: 10MB.
          </p>

          <label className="relative cursor-pointer">
            <input
              type="file"
              accept=".pdf,application/pdf"
              disabled={uploading}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFile(e.target.files[0]);
                }
              }}
              className="sr-only"
            />
            <span
              className={`px-6 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 font-display font-medium rounded-[20px] text-xs sm:text-sm shadow-md transition-all inline-flex items-center gap-2 ${
                uploading ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              <FileText className="w-4 h-4" /> Select PDF Document
            </span>
          </label>
        </div>
      </div>

      {/* Parsed Resume Display */}
      {resume && (
        <div className="glass-card p-6 sm:p-8 space-y-8 rounded-[24px] border border-border bg-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border gap-4">
            <div>
              <h2 className="text-lg font-display font-medium text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 text-crimson" /> Verified Candidate Profile
              </h2>
              <p className="font-mono text-xs text-muted-foreground mt-0.5">
                Last synchronized on: {new Date(resume.uploadedAt).toLocaleString()}
              </p>
            </div>
            <Link to="/jobs">
              <Button variant="outline" size="sm" className="font-mono gap-1.5">
                See Compatible Jobs <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          {/* Normalized Skill Profile Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-display font-medium text-foreground flex items-center gap-2">
                  <Layers className="w-4 h-4 text-crimson" />
                  Validated Skill Profile & Evidence ({skillProfile.length || resume.skills.length})
                </h3>
                <p className="font-mono text-xs text-muted-foreground mt-0.5">
                  Normalized taxonomy with source section validation and confidence scoring
                </p>
              </div>

              {/* Search within skills */}
              {skillProfile.length > 5 && (
                <div className="relative w-full sm:w-56">
                  <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={skillSearch}
                    onChange={(e) => setSkillSearch(e.target.value)}
                    placeholder="Search skills..."
                    className="w-full pl-8 pr-3 py-1.5 bg-muted/60 border border-border rounded-[16px] font-mono text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-crimson"
                  />
                </div>
              )}
            </div>

            {/* Category Filter Pills */}
            {categories.length > 2 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-full font-mono text-xs font-medium transition-all ${
                      selectedCategory === cat
                        ? 'bg-crimson text-white shadow-sm'
                        : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground border border-border'
                    }`}
                  >
                    {cat.replace('_', ' ')}
                  </button>
                ))}
              </div>
            )}

            {/* Enriched Skills Grid or Simple Fallback */}
            {filteredSkills.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {filteredSkills.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-[20px] border border-border bg-card dark:bg-carbon hover:border-crimson/40 transition-all space-y-2 group shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-display font-medium text-sm text-foreground group-hover:text-crimson transition-colors">
                          {item.name}
                        </div>
                        <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                          {item.category.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400">
                          {Math.round(item.confidence * 100)}% Match
                        </span>
                        {item.recency && (
                          <span className="font-mono text-[9px] text-muted-foreground">
                            {item.recency}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Source Section Tags */}
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="font-mono text-[10px] text-muted-foreground">Found in:</span>
                      {item.sourceSections.map((sec, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2 py-0.5 rounded-full font-mono text-[10px] bg-muted text-foreground/80 border border-border"
                        >
                          {sec}
                        </span>
                      ))}
                    </div>

                    {/* Evidence Snippet */}
                    {item.evidenceSnippet && (
                      <div className="font-mono text-[11px] text-muted-foreground bg-muted/50 p-2.5 rounded-[14px] border border-border flex items-start gap-2">
                        <Quote className="w-3 h-3 text-crimson shrink-0 mt-0.5" />
                        <span className="line-clamp-2 leading-relaxed">{item.evidenceSnippet}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              /* Fallback to simple skill tags if no enriched items */
              <div className="flex flex-wrap gap-2 pt-2">
                {resume.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-muted border border-border text-foreground font-mono rounded-full text-xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 5 Distinct Resume Sections */}
          <div className="space-y-6 pt-4 border-t border-border">
            <h3 className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
              Segmented Resume Sections
            </h3>

            {/* Experience Section */}
            {resume.experience && (
              <div className="p-5 bg-card dark:bg-carbon rounded-[20px] border border-border space-y-2">
                <h4 className="font-display font-medium text-xs text-foreground uppercase tracking-wider flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-crimson" />
                  Professional Experience
                </h4>
                <p className="font-mono text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap bg-muted/40 p-4 rounded-[16px] border border-border">
                  {resume.experience}
                </p>
              </div>
            )}

            {/* Projects Section */}
            {resume.projects && (
              <div className="p-5 bg-card dark:bg-carbon rounded-[20px] border border-border space-y-2">
                <h4 className="font-display font-medium text-xs text-foreground uppercase tracking-wider flex items-center gap-2">
                  <FolderGit2 className="w-4 h-4 text-crimson" />
                  Key Projects & Technical Implementations
                </h4>
                <p className="font-mono text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap bg-muted/40 p-4 rounded-[16px] border border-border">
                  {resume.projects}
                </p>
              </div>
            )}

            {/* Education Section */}
            {resume.education && (
              <div className="p-5 bg-card dark:bg-carbon rounded-[20px] border border-border space-y-2">
                <h4 className="font-display font-medium text-xs text-foreground uppercase tracking-wider flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-crimson" />
                  Education & Academic Background
                </h4>
                <p className="font-mono text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap bg-muted/40 p-4 rounded-[16px] border border-border">
                  {resume.education}
                </p>
              </div>
            )}

            {/* Certifications Section */}
            {resume.certifications && (
              <div className="p-5 bg-card dark:bg-carbon rounded-[20px] border border-border space-y-2">
                <h4 className="font-display font-medium text-xs text-foreground uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-4 h-4 text-crimson" />
                  Certifications & Verified Credentials
                </h4>
                <p className="font-mono text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap bg-muted/40 p-4 rounded-[16px] border border-border">
                  {resume.certifications}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default ResumeUploadPage;

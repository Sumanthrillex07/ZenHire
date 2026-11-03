import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { resumeApi } from '../../api/resumeApi';
import { Resume } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Briefcase, 
  GraduationCap, 
  ArrowRight,
  Loader2
} from 'lucide-react';

export const ResumeUploadPage: React.FC = () => {
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

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
      setSuccessMsg('Resume parsed and synchronized successfully!');
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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" /> Resume Intelligence
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          AI Resume Parser & Profile Sync
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-2xl">
          Upload your latest PDF resume. Our pipeline extracts your tech stack, verified experience, and education using Apache PDFBox and Gemini 1.5 Flash structured analysis.
        </p>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2.5">
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
        className={`glass-card p-8 sm:p-12 text-center border-2 border-dashed transition-all ${
          dragActive
            ? 'border-emerald-400 bg-emerald-500/5'
            : 'border-slate-700/80 hover:border-slate-600'
        }`}
      >
        <div className="max-w-md mx-auto flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
            {uploading ? (
              <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
            ) : (
              <UploadCloud className="w-8 h-8 text-emerald-400" />
            )}
          </div>

          <h3 className="text-base sm:text-lg font-bold text-white mb-1">
            {uploading ? 'Extracting Resume Intelligence...' : 'Upload your resume PDF'}
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            Drag and drop your file here, or click to browse. Max file size: 10MB.
          </p>

          <label className="relative">
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
              className={`px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm cursor-pointer shadow-md transition-all inline-flex items-center gap-2 ${
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
        <div className="glass-card space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" /> Current Parsed Profile
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Last synchronized on: {new Date(resume.uploadedAt).toLocaleString()}
              </p>
            </div>
            <Link
              to="/jobs"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold rounded-lg text-xs border border-emerald-500/30 transition-colors inline-flex items-center gap-1.5 self-start sm:self-auto"
            >
              See Compatible Jobs <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Extracted Skills Cloud */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
              Extracted Technical Skills ({resume.skills.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {resume.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-slate-800/90 border border-slate-700/80 text-emerald-300 rounded-lg text-xs font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Experience Narrative */}
          {resume.experience && (
            <div className="border-t border-slate-800/80 pt-4">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-indigo-400" /> Professional Experience Summary
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                {resume.experience}
              </p>
            </div>
          )}

          {/* Education Summary */}
          {resume.education && (
            <div className="border-t border-slate-800/80 pt-4">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-cyan-400" /> Education & Background
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                {resume.education}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default ResumeUploadPage;


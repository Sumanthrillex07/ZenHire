import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Mail, Lock, AlertCircle, ArrowRight, UserCheck, Briefcase } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const user = await login({ email, password });
      if (from) {
        navigate(from, { replace: true });
      } else {
        const targetPath = user.role === 'ROLE_RECRUITER' ? '/recruiter/dashboard' : '/candidate/dashboard';
        navigate(targetPath, { replace: true });
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error?.details || 'Invalid email or password';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCandidate = () => {
    setEmail('alex.chen@example.com');
    setPassword('Candidate@123');
    setError(null);
  };

  const fillDemoRecruiter = () => {
    setEmail('sarah.recruiter@techcorp.com');
    setPassword('Recruiter@123');
    setError(null);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-indigo-600 mb-4 shadow-lg shadow-emerald-500/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Sign in to ZenHire</h2>
          <p className="text-sm text-slate-400 mt-1">
            Access your AI talent intelligence workspace
          </p>
        </div>

        {/* Demo Account Quick-Fill Buttons */}
        <div className="glass-card mb-6 p-4 border border-slate-800">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
            Quick Demo Login:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={fillDemoCandidate}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800/80 hover:bg-slate-800 text-emerald-400 text-xs font-medium rounded-lg border border-emerald-500/30 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5" /> Demo Candidate
            </button>
            <button
              type="button"
              onClick={fillDemoRecruiter}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800/80 hover:bg-slate-800 text-indigo-400 text-xs font-medium rounded-lg border border-indigo-500/30 transition-colors"
            >
              <Briefcase className="w-3.5 h-3.5" /> Demo Recruiter
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="glass-card p-6 sm:p-8 border border-slate-800">
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-sm shadow-md transition-colors flex items-center justify-center gap-2"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-emerald-400 hover:underline font-semibold">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;


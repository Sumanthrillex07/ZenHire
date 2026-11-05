import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Mail, Lock, AlertCircle, ArrowRight, UserCheck, Briefcase, Eye, EyeOff } from 'lucide-react';
import Button from '../../components/ui/Button';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-[82vh] flex items-center justify-center px-4 py-12 font-sans">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#ea2845] to-[#780f20] shadow-lg shadow-[#ea2845]/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="bracketed-eyebrow mt-1">&#123; AUTHENTICATION &#125;_</div>
          <h2 className="text-2xl sm:text-3xl font-medium text-[#0c0909] dark:text-white tracking-tight">
            Sign in to ZenHire
          </h2>
          <p className="font-mono text-xs sm:text-sm text-[#6e6868] dark:text-[#9b9a9a] font-light">
            Access your verified recruitment &amp; talent intelligence command center
          </p>
        </div>

        {/* Demo Account Quick-Fill Buttons */}
        <div className="glass-card p-4 rounded-[24px] bg-white dark:bg-[#0b0b0b] border border-[#e3dede] dark:border-[#373535]">
          <p className="text-[11px] font-mono text-[#6e6868] dark:text-[#9b9a9a] uppercase tracking-wider mb-2.5">
            &#123; DEMO CREDENTIALS &#125;:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={fillDemoCandidate}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#f0eded] hover:bg-[#e4dede] text-[#050303] dark:bg-[#1e1c1c] dark:hover:bg-[#282626] dark:text-white text-xs font-mono rounded-full border border-[#ded9d9] dark:border-[#373535] transition-all active:scale-[0.98]"
            >
              <UserCheck className="w-3.5 h-3.5 text-[#ea2845]" /> Candidate
            </button>
            <button
              type="button"
              onClick={fillDemoRecruiter}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#f0eded] hover:bg-[#e4dede] text-[#050303] dark:bg-[#1e1c1c] dark:hover:bg-[#282626] dark:text-white text-xs font-mono rounded-full border border-[#ded9d9] dark:border-[#373535] transition-all active:scale-[0.98]"
            >
              <Briefcase className="w-3.5 h-3.5 text-[#ea2845]" /> Recruiter
            </button>
          </div>
        </div>

        {/* Form Card */}
        <div className="glass-card p-6 sm:p-8 rounded-[24px] bg-white dark:bg-[#0b0b0b] border border-[#e3dede] dark:border-[#373535] shadow-elevated dark:shadow-glass-dark">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-[#ea2845]/10 border border-[#ea2845]/30 text-[#ea2845] font-mono text-xs flex items-center gap-2.5 animate-slide-up">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium font-sans text-[#0c0909] dark:text-white mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#9b9a9a] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#181818] border border-[#ded9d9] dark:border-[#373535] rounded-[24px] text-xs sm:text-sm font-mono text-[#0c0909] dark:text-white placeholder-[#9b9a9a] focus:outline-none focus:border-[#ea2845]/70 focus:ring-1 focus:ring-[#ea2845]/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium font-sans text-[#0c0909] dark:text-white mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#9b9a9a] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-[#181818] border border-[#ded9d9] dark:border-[#373535] rounded-[24px] text-xs sm:text-sm font-mono text-[#0c0909] dark:text-white placeholder-[#9b9a9a] focus:outline-none focus:border-[#ea2845]/70 focus:ring-1 focus:ring-[#ea2845]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-[#9b9a9a] hover:text-[#0c0909] dark:hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              className="w-full mt-2 font-semibold shadow-sm"
              rightIcon={!loading && <ArrowRight className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#eee8e8] dark:border-[#1e1c1c] text-center text-xs font-mono text-[#6e6868] dark:text-[#9b9a9a]">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-[#ea2845] hover:underline font-medium">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

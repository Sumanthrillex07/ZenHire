import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Mail, Lock, User as UserIcon, Building2, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Role } from '../../types';
import Button from '../../components/ui/Button';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<Role>('ROLE_CANDIDATE');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all required fields');
      return;
    }

    if (role === 'ROLE_RECRUITER' && !companyName.trim()) {
      setError('Company name is required for recruiter accounts');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const user = await register({
        name,
        email,
        password,
        role,
        companyName: role === 'ROLE_RECRUITER' ? companyName : undefined,
      });

      const targetPath = user.role === 'ROLE_RECRUITER' ? '/recruiter/dashboard' : '/candidate/dashboard';
      navigate(targetPath, { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error?.details || 'Registration failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 font-sans">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#ea2845] to-[#780f20] shadow-lg shadow-[#ea2845]/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="bracketed-eyebrow mt-1">&#123; ONBOARDING &#125;_</div>
          <h2 className="text-2xl sm:text-3xl font-medium text-[#0c0909] dark:text-white tracking-tight">
            Create your account
          </h2>
          <p className="font-mono text-xs sm:text-sm text-[#6e6868] dark:text-[#9b9a9a] font-light">
            Join ZenHire for verified matchmaking and candidate intelligence
          </p>
        </div>

        {/* Role Toggle Selector */}
        <div className="grid grid-cols-2 p-1 bg-[#f0eded] dark:bg-[#181818] border border-[#ded9d9] dark:border-[#373535] rounded-full shadow-2xs font-mono">
          <button
            type="button"
            onClick={() => setRole('ROLE_CANDIDATE')}
            className={`py-2 text-xs font-medium rounded-full transition-all duration-150 ${
              role === 'ROLE_CANDIDATE'
                ? 'bg-[#050303] text-white dark:bg-white dark:text-[#050303] shadow-sm'
                : 'text-[#6e6868] dark:text-[#9b9a9a] hover:text-[#0c0909] dark:hover:text-white'
            }`}
          >
            Candidate
          </button>
          <button
            type="button"
            onClick={() => setRole('ROLE_RECRUITER')}
            className={`py-2 text-xs font-medium rounded-full transition-all duration-150 ${
              role === 'ROLE_RECRUITER'
                ? 'bg-[#050303] text-white dark:bg-white dark:text-[#050303] shadow-sm'
                : 'text-[#6e6868] dark:text-[#9b9a9a] hover:text-[#0c0909] dark:hover:text-white'
            }`}
          >
            Recruiter / Employer
          </button>
        </div>

        {/* Form Container */}
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
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-[#9b9a9a] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#181818] border border-[#ded9d9] dark:border-[#373535] rounded-[24px] text-xs sm:text-sm font-mono text-[#0c0909] dark:text-white placeholder-[#9b9a9a] focus:outline-none focus:border-[#ea2845]/70 focus:ring-1 focus:ring-[#ea2845]/20 transition-all"
                />
              </div>
            </div>

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
                  placeholder="jane@example.com"
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
                  placeholder="•••••••• (min 6 characters)"
                  required
                  minLength={6}
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

            {role === 'ROLE_RECRUITER' && (
              <div className="animate-fade-in">
                <label className="block text-xs font-medium font-sans text-[#0c0909] dark:text-white mb-1.5">
                  Company Name
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-[#9b9a9a] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Acme Technologies Inc."
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#181818] border border-[#ded9d9] dark:border-[#373535] rounded-[24px] text-xs sm:text-sm font-mono text-[#0c0909] dark:text-white placeholder-[#9b9a9a] focus:outline-none focus:border-[#ea2845]/70 focus:ring-1 focus:ring-[#ea2845]/20 transition-all"
                  />
                </div>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              className="w-full mt-2 font-semibold shadow-sm"
              rightIcon={!loading && <ArrowRight className="w-4 h-4" />}
            >
              Create Account
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#eee8e8] dark:border-[#1e1c1c] text-center text-xs font-mono text-[#6e6868] dark:text-[#9b9a9a]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#ea2845] hover:underline font-medium">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

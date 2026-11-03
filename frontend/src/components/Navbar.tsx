import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from './ui/ThemeToggle';
import { 
  Sparkles, 
  Briefcase, 
  FileText, 
  CheckSquare, 
  Layers, 
  LogOut,
  PlusCircle,
  Menu,
  X
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/jobs') {
      return location.pathname === '/jobs' || location.pathname.startsWith('/jobs/');
    }
    return location.pathname === path;
  };

  const getLinkClasses = (path: string) => {
    const active = isActive(path);
    return `flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 ${
      active
        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold border border-emerald-500/20 shadow-xs'
        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
    }`;
  };

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-slate-200/80 dark:border-slate-800/80 shadow-subtle dark:shadow-glass-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group select-none">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Zen<span className="text-emerald-600 dark:text-emerald-400">Hire</span>
              </span>
              <span className="text-[9px] text-slate-500 dark:text-slate-400 tracking-wider uppercase font-bold -mt-0.5">
                AI Talent Intelligence
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3">
            {!isAuthenticated && (
              <>
                <Link to="/jobs" className={getLinkClasses('/jobs')}>
                  <Briefcase className="w-4 h-4" />
                  Explore Jobs
                </Link>
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-sm hover:shadow-emerald-500/25 active:scale-[0.98]"
                >
                  Get Started
                </Link>
              </>
            )}

            {isAuthenticated && user?.role === 'ROLE_CANDIDATE' && (
              <>
                <Link to="/candidate/dashboard" className={getLinkClasses('/candidate/dashboard')}>
                  <Layers className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link to="/jobs" className={getLinkClasses('/jobs')}>
                  <Briefcase className="w-4 h-4" />
                  Find Jobs
                </Link>
                <Link to="/candidate/assessments" className={getLinkClasses('/candidate/assessments')}>
                  <CheckSquare className="w-4 h-4" />
                  Assessments
                </Link>
                <Link to="/candidate/resume" className={getLinkClasses('/candidate/resume')}>
                  <FileText className="w-4 h-4" />
                  My Resume
                </Link>
                <Link to="/candidate/applications" className={getLinkClasses('/candidate/applications')}>
                  <Briefcase className="w-4 h-4" />
                  Applications
                </Link>
              </>
            )}

            {isAuthenticated && user?.role === 'ROLE_RECRUITER' && (
              <>
                <Link to="/recruiter/dashboard" className={getLinkClasses('/recruiter/dashboard')}>
                  <Layers className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link
                  to="/recruiter/jobs/new"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-sm hover:shadow-indigo-500/25 active:scale-[0.98]"
                >
                  <PlusCircle className="w-4 h-4" />
                  Post Job
                </Link>
              </>
            )}

            {/* Theme Toggle */}
            <div className="pl-2 border-l border-slate-200 dark:border-slate-800">
              <ThemeToggle />
            </div>

            {/* User Profile Pill & Logout */}
            {isAuthenticated && user && (
              <div className="flex items-center gap-2 pl-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[120px] truncate">
                    {user.name}
                  </span>
                  <span
                    className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                      user.role === 'ROLE_RECRUITER'
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30'
                    }`}
                  >
                    {user.role === 'ROLE_RECRUITER' ? 'RECRUITER' : 'CANDIDATE'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile Right Controls: Theme Toggle + Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md px-4 py-4 space-y-3 animate-fade-in">
          {isAuthenticated && user && (
            <div className="pb-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{user.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
              </div>
              <span
                className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                  user.role === 'ROLE_RECRUITER'
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300'
                    : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                }`}
              >
                {user.role === 'ROLE_RECRUITER' ? 'Recruiter' : 'Candidate'}
              </span>
            </div>
          )}

          {!isAuthenticated ? (
            <div className="space-y-2">
              <Link
                to="/jobs"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Explore Jobs
              </Link>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2.5 bg-emerald-600 text-white font-semibold rounded-xl text-sm shadow-sm"
              >
                Get Started
              </Link>
            </div>
          ) : (
            <div className="space-y-1">
              {user?.role === 'ROLE_CANDIDATE' ? (
                <>
                  <Link
                    to="/candidate/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Layers className="w-4 h-4 text-emerald-500" />
                    Dashboard
                  </Link>
                  <Link
                    to="/jobs"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Briefcase className="w-4 h-4 text-emerald-500" />
                    Find Jobs
                  </Link>
                  <Link
                    to="/candidate/assessments"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <CheckSquare className="w-4 h-4 text-emerald-500" />
                    Assessments
                  </Link>
                  <Link
                    to="/candidate/resume"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <FileText className="w-4 h-4 text-emerald-500" />
                    My Resume
                  </Link>
                  <Link
                    to="/candidate/applications"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Briefcase className="w-4 h-4 text-emerald-500" />
                    Applications
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/recruiter/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Layers className="w-4 h-4 text-indigo-500" />
                    Recruiter Dashboard
                  </Link>
                  <Link
                    to="/recruiter/jobs/new"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <PlusCircle className="w-4 h-4 text-indigo-500" />
                    Post Job
                  </Link>
                </>
              )}

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl flex items-center gap-2 mt-2 pt-2 border-t border-slate-200 dark:border-slate-800"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

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
    return `flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-150 ${
      active
        ? 'bg-[#ea2845]/10 text-[#ea2845] font-semibold border border-[#ea2845]/30 shadow-xs'
        : 'text-[#6e6868] dark:text-[#9b9a9a] hover:text-[#050303] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
    }`;
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-[#050303]/90 backdrop-blur-md border-b border-[#e3dede] dark:border-[#373535]/70 transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo with Nest Crimson furnace mark */}
          <Link to="/" className="flex items-center gap-2.5 group select-none">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#ea2845] to-[#780f20] flex items-center justify-center shadow-md shadow-[#ea2845]/25 group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-medium tracking-tight font-sans text-[#0c0909] dark:text-white group-hover:text-[#ea2845] transition-colors">
                Zen<span className="text-[#ea2845]">Hire</span>
              </span>
              <span className="text-[9px] font-mono text-[#6e6868] dark:text-[#9b9a9a] tracking-wider uppercase -mt-0.5">
                &#123; TALENT INTELLIGENCE &#125;_
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
                  className="px-3.5 py-1.5 text-xs sm:text-sm font-medium text-[#6e6868] dark:text-[#9b9a9a] hover:text-[#050303] dark:hover:text-white transition-colors font-sans"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#050303] dark:bg-white dark:text-[#050303] hover:opacity-90 rounded-[20px] transition-all shadow-sm active:scale-[0.98] font-sans"
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
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#ea2845] to-[#780f20] hover:opacity-95 rounded-[20px] transition-all shadow-sm active:scale-[0.98] font-sans"
                >
                  <PlusCircle className="w-4 h-4" />
                  Post Job
                </Link>
              </>
            )}

            {/* Theme Toggle */}
            <div className="pl-2 border-l border-[#ded9d9] dark:border-[#373535]">
              <ThemeToggle />
            </div>

            {/* User Profile Pill & Logout */}
            {isAuthenticated && user && (
              <div className="flex items-center gap-2 pl-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#f0eded] dark:bg-[#1e1c1c] border border-[#ded9d9] dark:border-[#373535] rounded-full">
                  <div className="w-5 h-5 rounded-full bg-[#e4dfdf] dark:bg-[#0b0b0b] border border-[#ded9d9] dark:border-[#373535] flex items-center justify-center text-[#050303] dark:text-white font-mono text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-medium text-[#050303] dark:text-white max-w-[120px] truncate font-sans">
                    {user.name}
                  </span>
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                      user.role === 'ROLE_RECRUITER'
                        ? 'bg-[#ea2845]/15 text-[#ea2845] border border-[#ea2845]/30'
                        : 'bg-[#a5d6ff]/15 text-[#0284c7] dark:text-[#a5d6ff] border border-[#a5d6ff]/30'
                    }`}
                  >
                    {user.role === 'ROLE_RECRUITER' ? 'RECRUITER' : 'CANDIDATE'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-1.5 text-[#9b9a9a] hover:text-[#ea2845] hover:bg-[#ea2845]/10 rounded-full transition-colors"
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
              className="p-2 text-[#6e6868] dark:text-[#9b9a9a] hover:text-[#050303] dark:hover:text-white rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#e3dede] dark:border-[#373535] bg-white/98 dark:bg-[#0b0b0b]/98 backdrop-blur-md px-4 py-4 space-y-3 animate-fade-in font-sans">
          {isAuthenticated && user && (
            <div className="pb-3 border-b border-[#e3dede] dark:border-[#1e1c1c] flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#050303] dark:text-white">{user.name}</p>
                <p className="text-xs font-mono text-[#6e6868] dark:text-[#9b9a9a]">{user.email}</p>
              </div>
              <span
                className={`text-[9px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  user.role === 'ROLE_RECRUITER'
                    ? 'bg-[#ea2845]/15 text-[#ea2845] border border-[#ea2845]/30'
                    : 'bg-[#a5d6ff]/15 text-[#0284c7] dark:text-[#a5d6ff] border border-[#a5d6ff]/30'
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
                className="block px-3 py-2 rounded-xl text-sm font-medium text-[#6e6868] dark:text-[#9b9a9a] hover:bg-black/5 dark:hover:bg-white/5"
              >
                Explore Jobs
              </Link>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-medium text-[#6e6868] dark:text-[#9b9a9a] hover:bg-black/5 dark:hover:bg-white/5"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2.5 bg-[#050303] dark:bg-white dark:text-[#050303] text-white font-semibold rounded-[20px] text-sm shadow-sm"
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
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-[#6e6868] dark:text-[#9b9a9a] hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    <Layers className="w-4 h-4 text-[#ea2845]" />
                    Dashboard
                  </Link>
                  <Link
                    to="/jobs"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-[#6e6868] dark:text-[#9b9a9a] hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    <Briefcase className="w-4 h-4 text-[#ea2845]" />
                    Find Jobs
                  </Link>
                  <Link
                    to="/candidate/assessments"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-[#6e6868] dark:text-[#9b9a9a] hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    <CheckSquare className="w-4 h-4 text-[#ea2845]" />
                    Assessments
                  </Link>
                  <Link
                    to="/candidate/resume"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-[#6e6868] dark:text-[#9b9a9a] hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    <FileText className="w-4 h-4 text-[#ea2845]" />
                    My Resume
                  </Link>
                  <Link
                    to="/candidate/applications"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-[#6e6868] dark:text-[#9b9a9a] hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    <Briefcase className="w-4 h-4 text-[#ea2845]" />
                    Applications
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/recruiter/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-[#6e6868] dark:text-[#9b9a9a] hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    <Layers className="w-4 h-4 text-[#ea2845]" />
                    Recruiter Dashboard
                  </Link>
                  <Link
                    to="/recruiter/jobs/new"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-[#6e6868] dark:text-[#9b9a9a] hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    <PlusCircle className="w-4 h-4 text-[#ea2845]" />
                    Post Job
                  </Link>
                </>
              )}

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-3 py-2 text-sm font-medium text-[#ea2845] hover:bg-[#ea2845]/10 rounded-xl flex items-center gap-2 mt-2 pt-2 border-t border-[#e3dede] dark:border-[#1e1c1c]"
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

import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  Briefcase, 
  FileText, 
  CheckSquare, 
  Layers, 
  LogOut, 
  User as UserIcon,
  PlusCircle,
  Menu,
  X
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                Zen<span className="text-emerald-400">Hire</span>
              </span>
              <span className="text-[10px] text-slate-400 tracking-wider uppercase font-semibold">
                AI Talent Intelligence
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            {!isAuthenticated && (
              <>
                <Link
                  to="/jobs"
                  className={`text-sm font-medium transition-colors hover:text-emerald-400 ${
                    isActive('/jobs') ? 'text-emerald-400' : 'text-slate-300'
                  }`}
                >
                  Explore Jobs
                </Link>
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm font-semibold"
                >
                  Get Started
                </Link>
              </>
            )}

            {isAuthenticated && user?.role === 'ROLE_CANDIDATE' && (
              <>
                <Link
                  to="/candidate/dashboard"
                  className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                    isActive('/candidate/dashboard') ? 'text-emerald-400 font-semibold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link
                  to="/jobs"
                  className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                    isActive('/jobs') ? 'text-emerald-400 font-semibold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  Find Jobs
                </Link>
                <Link
                  to="/candidate/assessments"
                  className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                    isActive('/candidate/assessments') ? 'text-emerald-400 font-semibold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <CheckSquare className="w-4 h-4" />
                  Assessments
                </Link>
                <Link
                  to="/candidate/resume"
                  className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                    isActive('/candidate/resume') ? 'text-emerald-400 font-semibold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  My Resume
                </Link>
                <Link
                  to="/candidate/applications"
                  className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                    isActive('/candidate/applications') ? 'text-emerald-400 font-semibold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  Applications
                </Link>
              </>
            )}

            {isAuthenticated && user?.role === 'ROLE_RECRUITER' && (
              <>
                <Link
                  to="/recruiter/dashboard"
                  className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                    isActive('/recruiter/dashboard') ? 'text-indigo-400 font-semibold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  Recruiter Dashboard
                </Link>
                <Link
                  to="/recruiter/jobs/new"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm"
                >
                  <PlusCircle className="w-4 h-4" />
                  Post Job
                </Link>
              </>
            )}

            {/* User Profile Pill & Logout */}
            {isAuthenticated && user && (
              <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg">
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-medium text-slate-200">{user.name}</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      user.role === 'ROLE_RECRUITER'
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {user.role === 'ROLE_RECRUITER' ? 'RECRUITER' : 'CANDIDATE'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-900 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 py-4 space-y-3">
          {!isAuthenticated ? (
            <>
              <Link
                to="/jobs"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-slate-300 hover:text-white py-2"
              >
                Explore Jobs
              </Link>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-slate-300 hover:text-white py-2"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2 bg-emerald-400 text-slate-950 font-semibold rounded-lg"
              >
                Get Started
              </Link>
            </>
          ) : (
            <>
              <div className="pb-3 border-b border-slate-800">
                <p className="text-sm font-semibold text-white">{user?.name}</p>
                <p className="text-xs text-slate-400">{user?.email}</p>
              </div>
              {user?.role === 'ROLE_CANDIDATE' ? (
                <>
                  <Link
                    to="/candidate/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-slate-300 py-1.5"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/jobs"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-slate-300 py-1.5"
                  >
                    Find Jobs
                  </Link>
                  <Link
                    to="/candidate/assessments"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-slate-300 py-1.5"
                  >
                    Assessments
                  </Link>
                  <Link
                    to="/candidate/resume"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-slate-300 py-1.5"
                  >
                    Resume
                  </Link>
                  <Link
                    to="/candidate/applications"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-slate-300 py-1.5"
                  >
                    Applications
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/recruiter/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-slate-300 py-1.5"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/recruiter/jobs/new"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-slate-300 py-1.5"
                  >
                    Post Job
                  </Link>
                </>
              )}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left text-red-400 py-2 border-t border-slate-800 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};
export default Navbar;


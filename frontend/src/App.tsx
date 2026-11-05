import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import ChatWidget from './components/ChatWidget';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import JobBrowsePage from './pages/candidate/JobBrowsePage';
import JobDetailPage from './pages/candidate/JobDetailPage';

// Candidate Pages
import CandidateDashboard from './pages/candidate/CandidateDashboard';
import ResumeUploadPage from './pages/candidate/ResumeUploadPage';
import AssessmentCatalogPage from './pages/candidate/AssessmentCatalogPage';
import AssessmentRunnerPage from './pages/candidate/AssessmentRunnerPage';
import ApplicationsPage from './pages/candidate/ApplicationsPage';

// Recruiter Pages
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import PostJobPage from './pages/recruiter/PostJobPage';
import ApplicantListPage from './pages/recruiter/ApplicantListPage';

export const App: React.FC = () => {
  useEffect(() => {
    let frameId: number | null = null;
    const handleMouseMove = (e: MouseEvent) => {
      if (frameId !== null) return;
      frameId = requestAnimationFrame(() => {
        frameId = null;
        const target = (e.target as HTMLElement)?.closest?.(
          '.glass-card, .furnace-hero-frame, .interactive-card, [data-glow]'
        ) as HTMLElement | null;

        if (target) {
          const rect = target.getBoundingClientRect();
          const x = Math.round(e.clientX - rect.left);
          const y = Math.round(e.clientY - rect.top);
          target.style.setProperty('--mouse-x', `${x}px`);
          target.style.setProperty('--mouse-y', `${y}px`);
        }
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (frameId !== null) cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <div className="min-h-screen flex flex-col bg-background text-foreground antialiased font-sans selection:bg-crimson selection:text-bone transition-colors duration-250">
            <Navbar />
            <main className="flex-1">
              <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/jobs" element={<JobBrowsePage />} />
              <Route path="/jobs/:id" element={<JobDetailPage />} />

              {/* Candidate Protected Routes */}
              <Route
                path="/candidate/dashboard"
                element={
                  <ProtectedRoute allowedRole="ROLE_CANDIDATE">
                    <CandidateDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/resume"
                element={
                  <ProtectedRoute allowedRole="ROLE_CANDIDATE">
                    <ResumeUploadPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/assessments"
                element={
                  <ProtectedRoute allowedRole="ROLE_CANDIDATE">
                    <AssessmentCatalogPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/assessments/:testId"
                element={
                  <ProtectedRoute allowedRole="ROLE_CANDIDATE">
                    <AssessmentRunnerPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/applications"
                element={
                  <ProtectedRoute allowedRole="ROLE_CANDIDATE">
                    <ApplicationsPage />
                  </ProtectedRoute>
                }
              />

              {/* Recruiter Protected Routes */}
              <Route
                path="/recruiter/dashboard"
                element={
                  <ProtectedRoute allowedRole="ROLE_RECRUITER">
                    <RecruiterDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recruiter/jobs/new"
                element={
                  <ProtectedRoute allowedRole="ROLE_RECRUITER">
                    <PostJobPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recruiter/jobs/:jobId/applicants"
                element={
                  <ProtectedRoute allowedRole="ROLE_RECRUITER">
                    <ApplicantListPage />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
          <ChatWidget />
        </div>
      </AuthProvider>
    </BrowserRouter>
  </ThemeProvider>
  );
};

export default App;

import React from 'react';
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
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <div className="min-h-screen flex flex-col bg-background text-foreground antialiased font-sans selection:bg-emerald-500 selection:text-white transition-colors duration-150">
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

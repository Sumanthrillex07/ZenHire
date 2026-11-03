export type Role = 'ROLE_CANDIDATE' | 'ROLE_RECRUITER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  candidateId?: string | null;
  recruiterId?: string | null;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export type RoleCategory = 'FRONTEND' | 'BACKEND' | 'AI_ML';
export type JobStatus = 'OPEN' | 'CLOSED';

export interface Job {
  id: string;
  recruiterId: string;
  companyName: string;
  title: string;
  description: string;
  requiredSkills: string[];
  roleCategory: RoleCategory;
  status: JobStatus;
  applicantsCount: number;
  createdAt: string;
  updatedAt: string;
  matchScore?: number;
}

export interface Resume {
  id: string;
  candidateId?: string;
  fileUrl: string;
  skills: string[];
  experience: string;
  education: string;
  uploadedAt: string;
}

export type TestType = 'GENERAL' | 'ROLE_SPECIFIC';
export type QuestionDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface QuestionCandidate {
  id: string;
  questionText: string;
  options: string[];
  topicTag: string;
  difficulty: QuestionDifficulty;
}

export interface TestSummary {
  id: string;
  testType: TestType;
  roleCategory?: RoleCategory | null;
  title: string;
  passScore: number;
  hasAttempted: boolean;
  highestScore: number;
  passed: boolean;
}

export interface TestDetail {
  id: string;
  testType: TestType;
  roleCategory?: RoleCategory | null;
  title: string;
  passScore: number;
  questions: QuestionCandidate[];
}

export interface AttemptResult {
  score: number;
  passed: boolean;
  correctCount: number;
  totalQuestions: number;
}

export type ApplicationStatus = 'APPLIED' | 'SHORTLISTED' | 'INTERVIEW_SCHEDULED' | 'REJECTED' | 'HIRED';
export type InterviewMode = 'ONLINE' | 'OFFLINE';
export type InterviewStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

export interface InterviewDetails {
  id: string;
  scheduledTime: string;
  mode: InterviewMode;
  status: InterviewStatus;
  notes?: string;
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  roleCategory: RoleCategory;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  status: ApplicationStatus;
  appliedAt: string;
  interview?: InterviewDetails | null;
}

export interface ApplicantDetail {
  applicationId: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  status: ApplicationStatus;
  appliedAt: string;
  resumeUrl: string;
  interview?: InterviewDetails | null;
}

export interface CandidateDashboardData {
  hasResume: boolean;
  resumeUploadedAt?: string | null;
  applicationsCount: number;
  tests: TestSummary[];
}

export interface CandidateAnalysisData {
  strongTopics: string[];
  weakTopics: string[];
  recommendedRoles: RoleCategory[];
}

export interface RecruiterDashboardData {
  openJobs: number;
  totalApplicants: number;
  shortlisted: number;
  topScorers: Array<{
    applicationId: string;
    candidateName: string;
    jobTitle: string;
    matchScore: number;
    status: ApplicationStatus;
  }>;
  jobs: Array<{
    id: string;
    title: string;
    roleCategory: RoleCategory;
    status: JobStatus;
    createdAt: string;
    applicantsCount: number;
  }>;
}

export interface ChatMessage {
  id: string;
  sender: 'CANDIDATE' | 'AI';
  message: string;
  createdAt: string;
}

export interface MatchResult {
  matchScore: number;
  skillOverlapScore: number;
  llmFitScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  reasoning: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: {
    errorCode: string;
    details: string;
    validationErrors?: Array<{ field: string; message: string }>;
  } | null;
  timestamp: string;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  isLast: boolean;
}


import apiClient from './client';
import { ApiResponse, CandidateDashboardData, CandidateAnalysisData } from '../types';

export interface CandidateProfile {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  skills: string[];
  experienceYears?: number;
  education?: string;
  headline?: string;
  bio?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  profileCompleted: boolean;
}

export interface UpdateCandidateProfilePayload {
  phoneNumber?: string;
  skills?: string[];
  experienceYears?: number;
  education?: string;
  headline?: string;
  bio?: string;
  linkedinUrl?: string;
  githubUrl?: string;
}

export const candidateApi = {
  async getProfile(): Promise<CandidateProfile> {
    const response = await apiClient.get<ApiResponse<CandidateProfile>>('/candidate/profile');
    return response.data.data;
  },

  async updateProfile(payload: UpdateCandidateProfilePayload): Promise<CandidateProfile> {
    const response = await apiClient.put<ApiResponse<CandidateProfile>>('/candidate/profile', payload);
    return response.data.data;
  },

  async getDashboard(): Promise<CandidateDashboardData> {
    const response = await apiClient.get<ApiResponse<CandidateDashboardData>>('/candidate/dashboard');
    return response.data.data;
  },

  async getAnalytics(): Promise<CandidateAnalysisData> {
    const response = await apiClient.get<ApiResponse<CandidateAnalysisData>>('/candidate/skills/analysis');
    return response.data.data;
  },
};


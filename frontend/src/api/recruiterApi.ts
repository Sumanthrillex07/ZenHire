import apiClient from './client';
import { ApiResponse, RecruiterDashboardData } from '../types';

export interface RecruiterProfile {
  id: string;
  name: string;
  email: string;
  companyName: string;
  companyWebsite?: string;
  department?: string;
  contactNumber?: string;
}

export interface UpdateRecruiterProfilePayload {
  companyName?: string;
  companyWebsite?: string;
  department?: string;
  contactNumber?: string;
}

export const recruiterApi = {
  async getProfile(): Promise<RecruiterProfile> {
    const response = await apiClient.get<ApiResponse<RecruiterProfile>>('/recruiter/profile');
    return response.data.data;
  },

  async updateProfile(payload: UpdateRecruiterProfilePayload): Promise<RecruiterProfile> {
    const response = await apiClient.put<ApiResponse<RecruiterProfile>>('/recruiter/profile', payload);
    return response.data.data;
  },

  async getDashboard(): Promise<RecruiterDashboardData> {
    const response = await apiClient.get<ApiResponse<RecruiterDashboardData>>('/recruiter/dashboard');
    return response.data.data;
  },
};


import apiClient from './client';
import { ApiResponse, Application, ApplicantDetail, ApplicationStatus, InterviewMode } from '../types';

export interface ScheduleInterviewPayload {
  scheduledTime: string;
  mode: InterviewMode;
  notes?: string;
}

export const applicationApi = {
  async applyForJob(jobId: string): Promise<Application> {
    const response = await apiClient.post<ApiResponse<Application>>(`/jobs/${jobId}/apply`);
    return response.data.data;
  },

  async getCandidateApplications(): Promise<Application[]> {
    const response = await apiClient.get<ApiResponse<Application[]>>('/candidate/applications');
    return response.data.data;
  },

  async getJobApplicants(jobId: string): Promise<ApplicantDetail[]> {
    const response = await apiClient.get<ApiResponse<ApplicantDetail[]>>(`/jobs/${jobId}/applicants`);
    return response.data.data;
  },

  async updateStatus(applicationId: string, status: ApplicationStatus): Promise<void> {
    await apiClient.patch(`/applications/${applicationId}/status`, { status });
  },

  async scheduleInterview(applicationId: string, payload: ScheduleInterviewPayload): Promise<void> {
    await apiClient.post(`/applications/${applicationId}/interview`, payload);
  },
};


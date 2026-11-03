import apiClient from './client';
import { ApiResponse, PageResponse, Job, RoleCategory, JobStatus } from '../types';

export interface CreateJobPayload {
  title: string;
  description: string;
  requiredSkills: string[];
  roleCategory: RoleCategory;
}

export const jobApi = {
  async getJobs(params?: {
    category?: RoleCategory | '';
    roleCategory?: RoleCategory | '';
    search?: string;
    status?: JobStatus;
    page?: number;
    size?: number;
  }): Promise<PageResponse<Job>> {
    const cleanParams: Record<string, string | number> = {};
    const cat = params?.category || params?.roleCategory;
    if (cat) {
      cleanParams.category = cat;
      cleanParams.roleCategory = cat;
    }
    if (params?.search) cleanParams.search = params.search;
    if (params?.status) cleanParams.status = params.status;
    if (params?.page !== undefined) cleanParams.page = params.page;
    if (params?.size !== undefined) cleanParams.size = params.size;

    const response = await apiClient.get<ApiResponse<PageResponse<Job>>>('/jobs', {
      params: cleanParams,
    });
    return response.data.data;
  },

  async getJobById(id: string): Promise<Job> {
    const response = await apiClient.get<ApiResponse<Job>>(`/jobs/${id}`);
    return response.data.data;
  },

  async createJob(payload: CreateJobPayload): Promise<Job> {
    const response = await apiClient.post<ApiResponse<Job>>('/jobs', payload);
    return response.data.data;
  },

  async updateJobStatus(id: string, status: JobStatus): Promise<Job> {
    const response = await apiClient.patch<ApiResponse<Job>>(`/jobs/${id}/status`, { status });
    return response.data.data;
  },

  async getRecruiterJobs(page = 0, size = 10): Promise<PageResponse<Job>> {
    const response = await apiClient.get<ApiResponse<PageResponse<Job>>>('/recruiter/jobs', {
      params: { page, size },
    });
    return response.data.data;
  },
};


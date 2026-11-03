import apiClient from './client';
import { ApiResponse, Resume } from '../types';

export const resumeApi = {
  async uploadResume(file: File): Promise<Resume> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<ApiResponse<Resume>>('/resumes', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  async getLatestResume(): Promise<Resume | null> {
    try {
      const response = await apiClient.get<ApiResponse<Resume>>('/resumes/latest');
      return response.data.data;
    } catch (err: unknown) {
      // 404 means candidate has no resume yet
      return null;
    }
  },

  async getResumeByCandidateId(candidateId: string): Promise<Resume | null> {
    try {
      const response = await apiClient.get<ApiResponse<Resume>>(`/resumes/candidates/${candidateId}`);
      return response.data.data;
    } catch {
      return null;
    }
  },
};


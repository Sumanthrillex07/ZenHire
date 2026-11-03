import apiClient from './client';
import { ApiResponse, MatchResult } from '../types';

export const matchingApi = {
  async getJobMatch(jobId: string): Promise<MatchResult> {
    const response = await apiClient.get<ApiResponse<MatchResult>>(`/jobs/${jobId}/match`);
    return response.data.data;
  },
};


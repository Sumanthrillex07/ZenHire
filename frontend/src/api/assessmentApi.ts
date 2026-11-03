import apiClient from './client';
import { ApiResponse, TestSummary, TestDetail, AttemptResult } from '../types';

export interface SubmitAnswerItem {
  questionId: string;
  selectedIndex: number;
}

export interface StartAttemptResponse {
  attemptId: string;
  testId: string;
  startedAt: string;
}

export const assessmentApi = {
  async getAllTests(): Promise<TestSummary[]> {
    const response = await apiClient.get<ApiResponse<TestSummary[]>>('/tests');
    return response.data.data;
  },

  async getTestById(testId: string): Promise<TestDetail> {
    const response = await apiClient.get<ApiResponse<TestDetail>>(`/tests/${testId}`);
    return response.data.data;
  },

  async startAttempt(testId: string): Promise<StartAttemptResponse> {
    const response = await apiClient.post<ApiResponse<StartAttemptResponse>>(`/tests/${testId}/attempts`);
    return response.data.data;
  },

  async submitAttempt(attemptId: string, answers: SubmitAnswerItem[]): Promise<AttemptResult> {
    const response = await apiClient.post<ApiResponse<AttemptResult>>(`/tests/attempts/${attemptId}/submit`, {
      answers,
    });
    return response.data.data;
  },
};


import apiClient from './client';
import { ApiResponse, ChatMessage } from '../types';

export interface ChatResponse {
  reply: string;
  message?: string;
  aiMessage?: ChatMessage;
}

export const chatApi = {
  async sendMessage(message: string): Promise<ChatResponse> {
    const response = await apiClient.post<ApiResponse<ChatResponse>>('/chat', { message });
    return response.data.data;
  },

  async getHistory(): Promise<ChatMessage[]> {
    const response = await apiClient.get<ApiResponse<ChatMessage[]>>('/chat/history');
    return response.data.data;
  },
};


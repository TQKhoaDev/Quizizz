/**
 * API functions cho Quiz feature
 * Quản lý việc gọi API liên quan đến quiz và questions
 */

import axios from 'axios';
import type { QuizQuestion } from '../types/sessionControl';

// Tạm thời sử dụng axios trực tiếp
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interface cho Quiz từ API
export interface Quiz {
  id: string;
  title: string;
  description?: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  timeLimit?: number;
  questions: QuizQuestion[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Interface cho response của API
export interface QuizApiResponse {
  success: boolean;
  data: Quiz;
  message?: string;
}

// ... existing code ...
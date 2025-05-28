import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BACKEND || 'http://localhost:3001/api';

// Định nghĩa các interface cho dữ liệu
export interface SubmitAnswerData {
  questionId: string;
  optionId: string;
  sessionId: string;
  responseTime: number;
  participantId?: string; // Chỉ cần khi người dùng chưa đăng nhập
}

export interface SubmitAnswerResponse {
  answer: {
    id: string;
    isCorrect: boolean;
    points: number;
  };
  isCorrect: boolean;
  points: number;
}

// API service cho participant
export const participantApi = {
  // Gửi câu trả lời
  async submitAnswer(data: SubmitAnswerData): Promise<SubmitAnswerResponse> {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await axios.post(`${API_URL}/answers`, data, { headers });
    return response.data.data;
  },

  // Lấy kết quả của người tham gia
  async getParticipantResults(participantId: string) {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await axios.get(`${API_URL}/answers/participant/${participantId}`, { headers });
    return response.data.data;
  }
}; 
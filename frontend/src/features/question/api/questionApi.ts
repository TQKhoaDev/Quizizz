import axios from "axios"
const API_URL = import.meta.env.VITE_API_BACKEND || '';

export interface QuestionOption {
  id: string;
  content: string;
  isCorrect: boolean;
  order: number;
  imageUrl: string | null;
  matchingText: string | null;
  questionId: string;
}

export interface Question {
  id: string;
  content: string;
  type: string;
  timeLimit: number;
  points: number;
  difficulty: string;
  order: number;
  imageUrl: string | null;
  videoUrl: string | null;
  quizId: string;
  options: QuestionOption[];
  title?: string;
  description?: string;
  correctOption?: string;
}

export interface QuestionResponse {
  success: boolean;
  message: string;
  data: Question | Question[];
}

export const questionApi = {
  // Lấy tất cả câu hỏi
  getQuestions: async (): Promise<Question[]> => {
    try {
      const response = await axios.get<QuestionResponse>(`${API_URL}/questions`);
      return Array.isArray(response.data.data) ? response.data.data : [response.data.data];
    } catch (error) {
      console.error('Error fetching questions:', error);
      throw error;
    }
  },
  
  // Lấy chi tiết một câu hỏi theo ID
  getQuestionById: async (id: string): Promise<Question> => {
    try {
      const response = await axios.get<QuestionResponse>(`${API_URL}/questions/${id}`);
      return Array.isArray(response.data.data) ? response.data.data[0] : response.data.data;
    } catch (error) {
      console.error(`Error fetching question with id ${id}:`, error);
      throw error;
    }
  },
  
  // Lấy tất cả câu hỏi của một quiz
  getQuestionsByQuizId: async (quizId: string): Promise<Question[]> => {
    try {
      const response = await axios.get<QuestionResponse>(`${API_URL}/quizzes/${quizId}/questions`);
      return Array.isArray(response.data.data) ? response.data.data : [response.data.data];
    } catch (error) {
      console.error(`Error fetching questions for quiz with id ${quizId}:`, error);
      throw error;
    }
  }
}


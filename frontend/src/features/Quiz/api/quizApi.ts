import axios from 'axios';

// Cấu hình base URL cho API
const API_URL = import.meta.env.VITE_API_BACKEND || '';

// Interface định nghĩa cấu trúc dữ liệu Quiz từ API
interface QuizResponseData {
  id: string;
  title: string;
  description?: string;
  timeLimit?: number;
  questions?: { id: string }[];
  _count?: {
    participants: number;
  };
  avgScore?: number;
  isPublic: boolean;
  createdAt: string;
  code?: string;
}

// Interface định nghĩa chi tiết Quiz
export interface QuizDetail {
  id: string;
  title: string;
  description?: string;
  timeLimit?: number;
  questions: {
    id: string;
    content: string;
    type: string;
    timeLimit?: number;
    points: number;
    difficulty: string;
    order: number;
    options: {
      id: string;
      content: string;
      isCorrect: boolean;
      order: number;
    }[];
  }[];
  isPublic: boolean;
  code?: string;
  createdAt: string;
  updatedAt: string;
}

// Interface cho việc tạo Quiz mới
export interface QuizCreateData {
  title: string;
  description?: string;
  timeLimit?: number;
  isPublic?: boolean;
}

// Interface cho việc cập nhật Quiz
export interface QuizUpdateData {
  title?: string;
  description?: string;
  timeLimit?: number;
  isPublic?: boolean;
}

// Định nghĩa kiểu dữ liệu Quiz hiển thị trong UI
export interface Quiz {
  id: string;
  title: string;
  description?: string;
  timeLimit?: number;
  questions: number; // Số lượng câu hỏi
  participants: number; // Số lượng người tham gia
  avgScore: number; // Điểm trung bình
  status: "active" | "draft" | "completed";
  createdAt: string;
  code?: string;
}
export interface JoinQuiz {
    code: string
    displayName: string
}
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
}

/**
 * Tham gia quiz
 */
export interface JoinQuizResponse {
  token: string;
  session: {
    id: string;
    code: string;
    status: string;
    startTime: string | null;
    endTime: string | null;
  };
  quiz: {
    id: string;
    title: string;
    description: string;
    timeLimit: number;
    isPublic: boolean;
    code: string;
    createdAt: string;
    updatedAt: string;
    creatorId: string;
  };
  participant: {
    id: string;
    joinTime: string;
    score: number;
    rank: number | null;
    userId: string;
    sessionId: string;
  };
}

// API service cho Quiz
export const quizApi = {
  /**
   * Lấy danh sách quiz của người dùng hiện tại
   */
  getQuizzes: async (): Promise<Quiz[]> => {
    try {
      const response = await axios.get<{ data: QuizResponseData[] }>(`${API_URL}/quizzes`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        withCredentials: true // Hỗ trợ cookies
      });
      
      // Chuyển đổi dữ liệu từ API sang định dạng cần thiết cho UI
      const quizzes: Quiz[] = response.data.data.map((quiz: QuizResponseData) => ({
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        timeLimit: quiz.timeLimit,
        questions: quiz.questions?.length || 0,
        participants: quiz._count?.participants || 0,
        avgScore: quiz.avgScore || 0,
        status: quiz.isPublic ? "active" : "draft",
        createdAt: new Date(quiz.createdAt).toLocaleDateString('vi-VN'),
        code: quiz.code
      }));
      
      return quizzes;
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      throw error;
    }
  },

  /**
   * Lấy chi tiết một quiz theo ID
   */
  getQuizById: async (id: string): Promise<QuizDetail> => {
    const response = await axios.get<{ data: QuizDetail }>(`${API_URL}/quizzes/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      withCredentials: true // Hỗ trợ cookies
    });
    return response.data.data;
  },
  /**
   * Lấy chi tiết một quiz theo mã tham gia
   */
  getQuizByCode: async (code: string): Promise<QuizDetail> => {
    const response = await axios.get<{ data: QuizDetail }>(`${API_URL}/quizzes/code/${code}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      withCredentials: true // Hỗ trợ cookies
    });
    return response.data.data;
  },
  /**
   * Tham gia quiz
   */
  joinQuiz: async (data: JoinQuiz): Promise<JoinQuizResponse> => {
    try {
      console.log(data);
      const response = await axios.post<{ data: JoinQuizResponse }>(`${API_URL}/quizzes/join`, data);
      console.log(response.data.data);
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // Trả về chi tiết lỗi từ response của backend
        throw error.response.data;
      }
      // Nếu không phải lỗi từ backend, ném lại lỗi nguyên bản
      throw error;
    }
  },
  /**
   * Tạo quiz mới
   */
  createQuiz: async (quizData: QuizCreateData): Promise<QuizDetail> => {
    const response = await axios.post<{ data: QuizDetail }>(`${API_URL}/quizzes`, quizData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data.data;
  },

  /**
   * Cập nhật quiz
   */
  updateQuiz: async (id: string, quizData: QuizUpdateData): Promise<QuizDetail> => {
    const response = await axios.put<{ data: QuizDetail }>(`${API_URL}/quizzes/${id}`, quizData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data.data;
  },

  /**
   * Xóa quiz
   */
  deleteQuiz: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/quizzes/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
  }
}; 
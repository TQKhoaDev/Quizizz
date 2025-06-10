import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BACKEND || 'http://localhost:3001/api';

// Định nghĩa các interface cho dữ liệu
export interface SubmitAnswerData {
  questionId: string;
  optionId?: string;
  sessionId: string;
  responseTime: number;
  participantId?: string; // Chỉ cần khi người dùng chưa đăng nhập
  userId?: string; // Thêm trường userId cho phù hợp với backend
  answers?: Array<{ optionId: string }>;
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

export interface ParticipantResult {
  participant: {
    id: string;
    user: {
      id: string;
      fullName: string;
      email: string | null;
      isGuest: boolean;
    };
    score: number;
    rank: number | null;
  };
  quiz: {
    id: string;
    title: string;
  };
  session: {
    id: string;
    code: string;
    status: string;
  };
  statistics: {
    totalQuestions: number;
    answered: number;
    correctAnswers: number;
    incorrectAnswers: number;
    unanswered: number;
    accuracy: number;
  };
  answers: Array<{
    questionId: string;
    question: string;
    selectedOption: string;
    isCorrect: boolean;
    points: number;
    responseTime: number;
  }>;
}

// API service cho participant
export const participantApi = {
  // Gửi câu trả lời
  async submitAnswer(data: SubmitAnswerData): Promise<SubmitAnswerResponse> {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Xác định optionId từ dữ liệu đầu vào
      let optionId = data.optionId;
      
      // Nếu không có optionId trực tiếp, thử lấy từ mảng answers
      if (!optionId && data.answers && data.answers.length > 0) {
        optionId = data.answers[0].optionId;
      }
      
      // Kiểm tra xem có optionId hay không
      if (!optionId) {
        throw new Error('Thiếu thông tin câu trả lời (optionId)');
      }
      
      // Tạo payload phẳng theo yêu cầu API
      const requestPayload = {
        sessionId: data.sessionId, // Session ID đầy đủ đã được lấy từ RoomPage
        questionId: data.questionId,
        responseTime: data.responseTime,
        optionId: optionId,
        participantId: data.participantId // Giữ nguyên participantId để backend xử lý
      };
      
      console.log('Gửi câu trả lời với payload:', requestPayload);
      
      // Thử endpoint "finish" thay vì "answers"
      try {
        const response = await axios.post<{ success: boolean; message: string; data: SubmitAnswerResponse }>(
          `${API_URL}/sessions/${data.sessionId}/finish`, 
          requestPayload, 
          { headers }
        );
        
        console.log('Kết quả câu trả lời (qua finish):', response.data);
        
        if (!response.data.success) {
          throw new Error(response.data.message || 'Lỗi khi gửi câu trả lời');
        }
        
        return response.data.data;
      } catch (firstError) {
        console.warn("Endpoint finish không thành công, đang thử endpoint answers...", firstError);
        
        // Thử endpoint answers làm phương án dự phòng
        const response = await axios.post<{ success: boolean; message: string; data: SubmitAnswerResponse }>(
          `${API_URL}/answers`, 
          requestPayload, 
          { headers }
        );
        
        console.log('Kết quả từ endpoint answers:', response.data);
        
        if (!response.data.success) {
          throw new Error(response.data.message || 'Lỗi khi gửi câu trả lời');
        }
        
        return response.data.data;
      }
    } catch (error) {
      // Xử lý lỗi và hiển thị thông báo chi tiết
      if (axios.isAxiosError(error) && error.response) {
        console.error('Lỗi khi gửi câu trả lời:', error.response.status, error.response.data?.message || 'Đã xảy ra lỗi');
        throw new Error(error.response.data?.message || 'Không thể gửi câu trả lời');
      } else {
        console.error('Lỗi khi gửi câu trả lời:', error);
        throw new Error('Không thể kết nối đến server để gửi câu trả lời');
      }
    }
  },

  // Lấy kết quả của người tham gia
  async getParticipantResults(participantId: string): Promise<ParticipantResult> {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      console.log(`Đang gọi API kết quả cho participantId: ${participantId}`);
      
      const response = await axios.get<{ success: boolean; message: string; data: ParticipantResult }>(
        `${API_URL}/answers/participants/${participantId}/results`, 
        { headers }
      );
      
      console.log('Kết quả từ API:', response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Lỗi khi lấy kết quả người tham gia');
      }
      
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error('Lỗi khi lấy kết quả người tham gia:', error.response.status, error.response.data?.message || 'Đã xảy ra lỗi');
        throw new Error(error.response.data?.message || 'Không thể lấy kết quả');
      }
      console.error('Lỗi khi lấy kết quả:', error);
      throw new Error('Không thể kết nối đến server để lấy kết quả');
    }
  },

  // Kết thúc bài làm và nộp bài
  async finishQuiz(sessionCode: string): Promise<ParticipantResult> {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      // Lấy sessionId đầy đủ từ localStorage nếu có
      let fullSessionId = sessionCode;
      const sessionInfo = localStorage.getItem(`session_info_${sessionCode}`);
      
      if (sessionInfo) {
        try {
          const parsedSession = JSON.parse(sessionInfo);
          // Nếu có session.id (UUID đầy đủ), dùng nó thay vì code ngắn
          if (parsedSession && parsedSession.id) {
            console.log(`Đang sử dụng session.id đầy đủ (${parsedSession.id}) thay vì code ngắn (${sessionCode})`);
            fullSessionId = parsedSession.id;
          }
        } catch (e) {
          console.warn("Không thể parse session info:", e);
        }
      }
      
      // Lấy participantId từ localStorage
      const participantId = localStorage.getItem(`participant_${sessionCode}`);
      
      // Tạo payload với đầy đủ thông tin
      const requestPayload = {};
      if (participantId) {
        Object.assign(requestPayload, { participantId });
      }
      
      console.log(`Gửi yêu cầu kết thúc bài làm cho session ${fullSessionId} với payload:`, requestPayload);
      
      const response = await axios.post<{ success: boolean; message: string; data: ParticipantResult }>(
        `${API_URL}/sessions/${fullSessionId}/finish`, 
        requestPayload, 
        { headers }
      );
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Lỗi khi kết thúc bài làm');
      }
      
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error('Lỗi khi kết thúc bài làm:', error.response.status, error.response.data?.message || 'Đã xảy ra lỗi');
        throw new Error(error.response.data?.message || 'Không thể kết thúc bài làm');
      }
      console.error('Lỗi khi kết thúc bài làm:', error);
      throw new Error('Không thể kết nối đến server để kết thúc bài làm');
    }
  }
}; 
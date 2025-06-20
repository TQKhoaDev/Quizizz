// Interface cho câu hỏi quiz trong session
export interface QuizQuestion {
  id: string;
  content: string;
  order: number;
  timeLimit: number;
  points: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  options: Array<{
    id: string;
    content: string;
    order: number;
    isCorrect: boolean;
  }>;
}

// Interface cho trạng thái quiz realtime
export interface QuizRealTimeState {
  currentQuestionIndex: number;
  currentQuestion: QuizQuestion | null;
  timeLeft: number;
  isQuestionActive: boolean;
  answerStats: Record<string, number>;
  participantAnswers: Record<string, string>;
}

// Interface cho quiz control state
export interface QuizControlState {
  quizQuestions: QuizQuestion[];
  quizState: QuizRealTimeState;
  isLowTime: boolean;
  sessionStartTime: number | null;
  // Flatten các properties từ quizState để dễ truy cập
  currentQuestionIndex: number;
  currentQuestion: QuizQuestion | null;
  timeLeft: number;
  isQuestionActive: boolean;
}

// Interface cho thống kê realtime của quiz
export interface QuizRealtimeStats {
  totalAnswers: number;
  correctAnswers: number;
  optionStats: Array<{
    optionId: string;
    count: number;
  }>;
}

// Enum cho loại người dùng trong session
export type UserRole = 'STUDENT' | 'PROCTOR' | 'ADMIN' | 'GUEST';

// Interface cho thông tin người tham gia hiển thị
export interface DisplayParticipant {
  id: string;
  userId: string;
  fullName: string;
  role: UserRole;
  joinTime: string;
  isOnline: boolean;
  ready: boolean;
  isGuest: boolean;
  lastActivity?: string;
  deviceInfo?: string;
  score?: number;
}

// Interface cho thống kê session
export interface SessionStats {
  totalParticipants: number;
  readyParticipants: number;
  onlineParticipants: number;
  readyPercentage: number;
  averageScore?: number;
  highestScore?: number;
  lowestScore?: number;
  completionRate?: number;
}
export type SessionStatus = 'PENDING' | 'ACTIVE' | 'WAITING_NEXT_QUESTION' | 'ENDED' | 'COMPLETED' | 'CANCELED' | 'CANCELLED';

export interface Participant {
  id: string;
  fullName: string;
  avatar?: string;
  isGuest: boolean;
  joinTime?: string;
  score?: number;
  rank?: number;
  userId?: string;
}

export interface Session {
  id: string;
  status: SessionStatus;
  startTime: string;
  endTime: string | null;
  proctorId: string;
  quizId: string;
  code?: string;
  quiz: {
    id: string;
    title: string;
    description: string;
    totalParticipants?: number;
  };
  _count?: {
    participants?: number;
  };
  createdAt: string;
  updatedAt: string;
  participants: Participant[];
}

// Types cho session features

// Interface cho session realtime status
export interface SessionRealtimeStatus {
  status: SessionStatus;
  lastUpdated: string;
  participantCount: number;
  activeParticipants: number;
  currentActivity: string;
  uptime: number; // thời gian session đã chạy (giây)
}

// Interface cho socket session status update
export interface SessionStatusUpdateData {
  status?: SessionStatus;
  currentActivity?: string;
  participantCount?: number;
  activeParticipants?: number;
  timestamp: string;
}

// Interface cho participant events
export interface ParticipantEventData {
  userId: string;
  fullName: string;
  role: string;
  timestamp: string;
  remainingParticipants?: number;
}

// Interface cho người tham gia hiển thị
export interface DisplayParticipant {
  id: string;
  userId: string;
  fullName: string;
  role: 'PROCTOR' | 'STUDENT' | 'ADMIN';
  isGuest: boolean;
  ready: boolean;
  joinTime: string;
  isOnline: boolean;
  lastActivity?: string;
}

// Interface cho thống kê realtime
export interface SessionStats {
  totalParticipants: number;
  readyParticipants: number;
  onlineParticipants: number;
  readyPercentage: number;
}

// Interface cho câu hỏi quiz
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
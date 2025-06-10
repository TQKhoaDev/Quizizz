export type SessionStatus = 'PENDING' | 'ACTIVE' | 'WAITING_NEXT_QUESTION' | 'COMPLETED' | 'CANCELLED';

export interface QuizSession {
  id: string;
  status: SessionStatus;
  startTime: Date | null;
  endTime: Date | null;
  currentQuestionIndex: number;
  questionStartTime: Date | null;
  code: string;
  quizId: string;
  proctorId: string;
  createdAt: Date;
  updatedAt: Date;
} 
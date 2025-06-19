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
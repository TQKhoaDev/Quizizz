import { useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';

// Interface definitions trực tiếp trong file
interface QuizQuestion {
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

interface QuizRealTimeState {
  currentQuestionIndex: number;
  currentQuestion: QuizQuestion | null;
  timeLeft: number;
  isQuestionActive: boolean;
  answerStats: Record<string, number>;
  participantAnswers: Record<string, string>;
}

interface QuizControlState {
  quizQuestions: QuizQuestion[];
  quizState: QuizRealTimeState;
  isLowTime: boolean;
  sessionStartTime: number | null;
  currentQuestionIndex: number;
  currentQuestion: QuizQuestion | null;
  timeLeft: number;
  isQuestionActive: boolean;
}

interface SessionStatus {
  currentActivity: string;
  lastUpdated: string;
  participantCount: number;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
}

interface SessionWithQuiz {
  quiz?: {
    id: string;
  };
}

interface SocketConnection {
  emit: (event: string, data: Record<string, unknown>) => void;
}

interface QuizRealtimeStats {
  totalAnswers: number;
  correctAnswers: number;
  optionStats: Record<string, number>;
}

/**
 * Hook quản lý logic điều khiển quiz realtime
 * Chứa tất cả các state và actions liên quan đến việc điều khiển quiz
 * Bao gồm: timer, navigation, audio, thống kê realtime
 * 
 * @param session - Session object từ API
 * @param socket - Socket connection
 * @param sessionId - ID của session
 * @param participants - Danh sách participants
 * @param setRealtimeStatus - Function để update realtime status
 * @returns Object chứa quiz state, actions và utilities
 */
export const useQuizControl = (
  session: SessionWithQuiz | null,
  socket: SocketConnection | null,
  sessionId: string,
  participants: unknown[],
  setRealtimeStatus: (updater: (prev: SessionStatus) => SessionStatus) => void
) => {
  // =========================
  // STATE MANAGEMENT
  // =========================
  
  // State chính của quiz control
  const [quizState, setQuizState] = useState<QuizControlState>({
    quizQuestions: [],
    quizState: {
      currentQuestionIndex: 0,
      currentQuestion: null,
      timeLeft: 0,
      isQuestionActive: false,
      answerStats: {},
      participantAnswers: {}
    },
    isLowTime: false,
    sessionStartTime: null,
    currentQuestionIndex: 0,
    currentQuestion: null,
    timeLeft: 0,
    isQuestionActive: false
  });

  // Refs để giữ stable reference
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // =========================
  // API FUNCTIONS
  // =========================
  
  // API client
  const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Add auth token
  apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  /**
   * Load danh sách câu hỏi từ API
   */
  const loadQuizQuestions = useCallback(async () => {
    if (!session?.quiz?.id) {
      console.log('⚠️ [QUIZ CONTROL] No quiz ID found in session');
      return;
    }
    
    try {
      console.log('📚 [QUIZ CONTROL] Loading quiz questions for quiz:', session.quiz.id);
      
      const response = await apiClient.get(`/api/quizzes/${session.quiz.id}`);
      const quizData = response.data;
      
      if (quizData?.questions) {
        setQuizState(prev => ({
          ...prev,
          quizQuestions: quizData.questions,
          quizState: {
            ...prev.quizState,
            currentQuestion: quizData.questions[0] || null
          },
          currentQuestion: quizData.questions[0] || null
        }));
        
        console.log('✅ [QUIZ CONTROL] Quiz questions loaded:', quizData.questions.length, 'questions');
      }
    } catch (error) {
      console.error('❌ [QUIZ CONTROL] Error loading quiz questions:', error);
    }
  }, [session?.quiz?.id, apiClient]);

  // =========================
  // AUDIO UTILITIES
  // =========================
  
  /**
   * Phát âm thanh cảnh báo khi thời gian sắp hết
   */
  const playWarningSound = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioContextRef.current = new AudioContextClass();
      }
      
      const context = audioContextRef.current;
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      
      oscillator.frequency.setValueAtTime(800, context.currentTime);
      gainNode.gain.setValueAtTime(0.3, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);
      
      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.5);
    } catch (error) {
      console.error('❌ [QUIZ CONTROL] Error playing warning sound:', error);
    }
  }, []);

  // =========================
  // UTILITY FUNCTIONS
  // =========================
  
  /**
   * Tính toán thống kê realtime cho câu hỏi hiện tại
   */
  const calculateRealTimeStats = useCallback((): QuizRealtimeStats => {
    const mockStats = {
      totalAnswers: Math.floor(participants.length * 0.8),
      correctAnswers: Math.floor(participants.length * 0.6),
      optionStats: {
        'option_1': Math.floor(participants.length * 0.4),
        'option_2': Math.floor(participants.length * 0.3),
        'option_3': Math.floor(participants.length * 0.2),
        'option_4': Math.floor(participants.length * 0.1)
      }
    };
    
    return mockStats;
  }, [participants.length]);

  // =========================
  // QUIZ ACTIONS
  // =========================
  
  /**
   * Bắt đầu câu hỏi hiện tại
   */
  const handleStartQuestion = useCallback(() => {
    const currentQuestion = quizState.quizQuestions[quizState.currentQuestionIndex];
    if (!currentQuestion) return;
    
    console.log('🚀 [QUIZ CONTROL] Starting question:', currentQuestion.content);
    
    setQuizState(prev => ({
      ...prev,
      quizState: {
        ...prev.quizState,
        isQuestionActive: true,
        timeLeft: currentQuestion.timeLimit,
        answerStats: {},
        participantAnswers: {}
      },
      isQuestionActive: true,
      timeLeft: currentQuestion.timeLimit,
      isLowTime: false,
      sessionStartTime: Date.now()
    }));
    
    // Emit socket event
    if (socket) {
      socket.emit('start-question', {
        sessionId,
        questionId: currentQuestion.id,
        questionIndex: quizState.currentQuestionIndex,
        timeLimit: currentQuestion.timeLimit,
        question: currentQuestion
      });
    }
    
    // Update realtime status
    setRealtimeStatus(prev => ({
      ...prev,
      currentActivity: `Đang thực hiện câu hỏi ${quizState.currentQuestionIndex + 1}`,
      lastUpdated: new Date().toISOString()
    }));
  }, [quizState.quizQuestions, quizState.currentQuestionIndex, socket, sessionId, setRealtimeStatus]);

  /**
   * Kết thúc câu hỏi hiện tại
   */
  const handleEndQuestion = useCallback(() => {
    const currentQuestion = quizState.quizQuestions[quizState.currentQuestionIndex];
    if (!currentQuestion) return;
    
    console.log('🏁 [QUIZ CONTROL] Ending question:', currentQuestion.content);
    
    setQuizState(prev => ({
      ...prev,
      quizState: {
        ...prev.quizState,
        isQuestionActive: false,
        timeLeft: 0
      },
      isQuestionActive: false,
      timeLeft: 0,
      isLowTime: false
    }));
    
    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Emit socket event
    if (socket) {
      const stats = calculateRealTimeStats();
      socket.emit('end-question', {
        sessionId,
        questionId: currentQuestion.id,
        results: stats
      });
    }
    
    // Update realtime status
    setRealtimeStatus(prev => ({
      ...prev,
      currentActivity: `Kết thúc câu hỏi ${quizState.currentQuestionIndex + 1}`,
      lastUpdated: new Date().toISOString()
    }));
  }, [quizState.quizQuestions, quizState.currentQuestionIndex, socket, sessionId, setRealtimeStatus, calculateRealTimeStats]);

  /**
   * Chuyển sang câu hỏi tiếp theo
   */
  const handleNextQuestion = useCallback(() => {
    const nextIndex = quizState.currentQuestionIndex + 1;
    if (nextIndex >= quizState.quizQuestions.length) return;
    
    console.log('➡️ [QUIZ CONTROL] Moving to next question:', nextIndex + 1);
    
    setQuizState(prev => ({
      ...prev,
      quizState: {
        ...prev.quizState,
        currentQuestionIndex: nextIndex,
        currentQuestion: prev.quizQuestions[nextIndex],
        isQuestionActive: false,
        timeLeft: 0,
        answerStats: {},
        participantAnswers: {}
      },
      currentQuestionIndex: nextIndex,
      currentQuestion: prev.quizQuestions[nextIndex],
      isQuestionActive: false,
      timeLeft: 0
    }));
    
    // Emit socket event
    if (socket) {
      socket.emit('question-changed', {
        sessionId,
        questionIndex: nextIndex,
        question: quizState.quizQuestions[nextIndex]
      });
    }
  }, [quizState.currentQuestionIndex, quizState.quizQuestions, socket, sessionId]);

  /**
   * Quay lại câu hỏi trước
   */
  const handlePreviousQuestion = useCallback(() => {
    const prevIndex = quizState.currentQuestionIndex - 1;
    if (prevIndex < 0) return;
    
    console.log('⬅️ [QUIZ CONTROL] Moving to previous question:', prevIndex + 1);
    
    setQuizState(prev => ({
      ...prev,
      quizState: {
        ...prev.quizState,
        currentQuestionIndex: prevIndex,
        currentQuestion: prev.quizQuestions[prevIndex],
        isQuestionActive: false,
        timeLeft: 0,
        answerStats: {},
        participantAnswers: {}
      },
      currentQuestionIndex: prevIndex,
      currentQuestion: prev.quizQuestions[prevIndex],
      isQuestionActive: false,
      timeLeft: 0
    }));
    
    // Emit socket event
    if (socket) {
      socket.emit('question-changed', {
        sessionId,
        questionIndex: prevIndex,
        question: quizState.quizQuestions[prevIndex]
      });
    }
  }, [quizState.currentQuestionIndex, quizState.quizQuestions, socket, sessionId]);

  /**
   * Nhảy đến câu hỏi cụ thể
   */
  const goToQuestion = useCallback((index: number) => {
    if (index < 0 || index >= quizState.quizQuestions.length) return;
    
    console.log('🎯 [QUIZ CONTROL] Going to question:', index + 1);
    
    setQuizState(prev => ({
      ...prev,
      quizState: {
        ...prev.quizState,
        currentQuestionIndex: index,
        currentQuestion: prev.quizQuestions[index],
        isQuestionActive: false,
        timeLeft: 0,
        answerStats: {},
        participantAnswers: {}
      },
      currentQuestionIndex: index,
      currentQuestion: prev.quizQuestions[index],
      isQuestionActive: false,
      timeLeft: 0
    }));
    
    // Emit socket event
    if (socket) {
      socket.emit('question-changed', {
        sessionId,
        questionIndex: index,
        question: quizState.quizQuestions[index]
      });
    }
  }, [quizState.quizQuestions, socket, sessionId]);

  // =========================
  // EFFECTS
  // =========================
  
  // Load quiz questions khi session thay đổi
  useEffect(() => {
    if (session?.quiz?.id) {
      loadQuizQuestions();
    }
  }, [session?.quiz?.id, loadQuizQuestions]);

  // Timer cho câu hỏi đang active
  useEffect(() => {
    if (quizState.isQuestionActive && quizState.timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setQuizState(prev => {
          const newTimeLeft = prev.timeLeft - 1;
          
          // Cảnh báo khi còn 10 giây
          if (newTimeLeft === 10 && !prev.isLowTime) {
            playWarningSound();
            return {
              ...prev,
              quizState: { ...prev.quizState, timeLeft: newTimeLeft },
              timeLeft: newTimeLeft,
              isLowTime: true
            };
          }
          
          // Tự động kết thúc khi hết thời gian
          if (newTimeLeft <= 0) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            return {
              ...prev,
              quizState: {
                ...prev.quizState,
                timeLeft: 0,
                isQuestionActive: false
              },
              timeLeft: 0,
              isQuestionActive: false,
              isLowTime: false
            };
          }
          
          return {
            ...prev,
            quizState: { ...prev.quizState, timeLeft: newTimeLeft },
            timeLeft: newTimeLeft
          };
        });
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [quizState.isQuestionActive, quizState.timeLeft, playWarningSound]);

  // =========================
  // COMPUTED VALUES
  // =========================
  
  const realtimeStats = calculateRealTimeStats();

  // =========================
  // RETURN INTERFACE
  // =========================
  
  return {
    quizState,
    actions: {
      handleStartQuestion,
      handleEndQuestion,
      handleNextQuestion,
      handlePreviousQuestion,
      goToQuestion
    },
    realTimeStats: realtimeStats,
    loadQuizQuestions
  };
};
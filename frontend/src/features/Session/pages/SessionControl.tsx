import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { sessionApi } from '../api/sessionApi';
import type { Session } from '../api/sessionApi';
import { useSocket } from '@/hooks';
import { 
  Play, 
  Square, 
  Users, 
  Clock, 
  Award, 
  UserCheck, 
  Wifi, 
  WifiOff, 
  AlertCircle,
  CheckCircle,
  Eye,
  Monitor,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  BarChart3,
  Timer,
  PlayCircle,
  PauseCircle,
  SkipForward
} from 'lucide-react';
import { quizApi } from '../../Quiz/api/quizApi';
import SessionStatusDashboard from '../components/SessionStatusDashboard';

// Interface cho người tham gia hiển thị
interface DisplayParticipant {
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
interface SessionStats {
  totalParticipants: number;
  readyParticipants: number;
  onlineParticipants: number;
  readyPercentage: number;
}

// Interface cho câu hỏi quiz
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

// Interface cho trạng thái quiz realtime
interface QuizRealTimeState {
  currentQuestionIndex: number;
  currentQuestion: QuizQuestion | null;
  timeLeft: number;
  isQuestionActive: boolean;
  answerStats: Record<string, number>;
  participantAnswers: Record<string, string>;
}

// Thêm interface cho session realtime status
interface SessionRealtimeStatus {
  status: 'PENDING' | 'ACTIVE' | 'WAITING_NEXT_QUESTION' | 'ENDED' | 'COMPLETED' | 'CANCELED';
  lastUpdated: string;
  participantCount: number;
  activeParticipants: number;
  currentActivity: string;
  uptime: number; // thời gian session đã chạy (giây)
}

// Thêm interface cho socket session status update
interface SessionStatusUpdateData {
  status?: 'PENDING' | 'ACTIVE' | 'WAITING_NEXT_QUESTION' | 'ENDED' | 'COMPLETED' | 'CANCELED';
  currentActivity?: string;
  participantCount?: number;
  activeParticipants?: number;
  timestamp: string;
}

// Thêm interface cho participant events
interface ParticipantEventData {
  userId: string;
  fullName: string;
  role: string;
  timestamp: string;
  remainingParticipants?: number;
}

const SessionControl: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [showParticipantDetails, setShowParticipantDetails] = useState(true);
  const [lastParticipantCount, setLastParticipantCount] = useState(0);
  
  // State cho quiz realtime
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizState, setQuizState] = useState<QuizRealTimeState>({
    currentQuestionIndex: 0,
    currentQuestion: null,
    timeLeft: 0,
    isQuestionActive: false,
    answerStats: {},
    participantAnswers: {}
  });

  // State cho session realtime status
  const [realtimeStatus, setRealtimeStatus] = useState<SessionRealtimeStatus>({
    status: 'PENDING',
    lastUpdated: new Date().toISOString(),
    participantCount: 0,
    activeParticipants: 0,
    currentActivity: 'Đang chờ bắt đầu',
    uptime: 0
  });
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);

  // State cho low time warning
  const [isLowTime, setIsLowTime] = useState(false);

  console.log('🔧 [CONTROL] Debug info:', {
    sessionId,
    hasSessionId: !!sessionId
  });

  // Socket connection cho PROCTOR
  const { 
    isConnected, 
    participants, 
    startSession, 
    endSession,
    socket,
    startQuestion,
    endQuestion,
    error: socketError,
    sendPing
  } = useSocket({
    sessionId: sessionId || '',
    role: 'PROCTOR',
    token: localStorage.getItem('token') || ''
  });

  // Debug logs cho theo dõi trạng thái realtime - giảm thiểu logging
  useEffect(() => {
    if (isConnected) {
      console.log('🟢 [CONTROL] Socket connected for sessionId:', sessionId);
    } else {
      console.log('🔴 [CONTROL] Socket disconnected for sessionId:', sessionId);
    }
  }, [isConnected, sessionId]);

  // Tối ưu effect cho participants - chỉ log khi có thay đổi quan trọng
  useEffect(() => {
    const currentCount = participants.length;
    
    if (currentCount !== lastParticipantCount) {
      if (currentCount > lastParticipantCount && lastParticipantCount >= 0) {
        console.log('🔔 [CONTROL] New participant joined! Total:', currentCount);
      }
      
      if (currentCount < lastParticipantCount && lastParticipantCount > 0) {
        console.log('👋 [CONTROL] Participant left! Total:', currentCount);
      }
      
      setLastParticipantCount(currentCount);
    }
  }, [participants.length, lastParticipantCount]);

  // Load quiz questions từ API thật
  const loadQuizQuestions = useCallback(async () => {
    if (!session?.quiz?.id) {
      console.warn('⚠️ No quiz ID available');
      return;
    }
    
    try {
      console.log('🔄 Loading quiz questions for quiz ID:', session.quiz.id);
      
      // Lấy chi tiết quiz từ API để có danh sách câu hỏi
      const quizDetail = await quizApi.getQuizById(session.quiz.id);
      
      if (quizDetail && quizDetail.questions && quizDetail.questions.length > 0) {
        
        // Chuyển đổi format từ Quiz questions sang QuizQuestion interface
        const formattedQuestions: QuizQuestion[] = quizDetail.questions.map((q, index) => {
          console.log(`📝 [QUIZ API] Processing question ${index + 1}:`, q);
          
          return {
            id: q.id,
            content: q.content,
            order: q.order || (index + 1),
            timeLimit: q.timeLimit || 30,
            points: q.points || 10,
            difficulty: (q.difficulty as 'EASY' | 'MEDIUM' | 'HARD') || 'MEDIUM',
            options: q.options?.map((opt, optIndex) => {
              console.log(`  📝 [QUIZ API] Processing option ${optIndex + 1}:`, opt);
              return {
                id: opt.id,
                content: opt.content,
                order: opt.order || (optIndex + 1),
                isCorrect: opt.isCorrect || false
              };
            }) || []
          };
        });
        
        setQuizQuestions(formattedQuestions);
        
        // Initialize first question
        if (formattedQuestions.length > 0) {
          console.log('🎯 [QUIZ API] Initializing first question:', formattedQuestions[0]);
          setQuizState(prev => ({
            ...prev,
            currentQuestion: formattedQuestions[0],
            currentQuestionIndex: 0,
            timeLeft: formattedQuestions[0].timeLimit,
            answerStats: {},
            participantAnswers: {}
          }));
        }
      } else {
        console.warn('⚠️ [QUIZ API] No questions found in quiz response');
        console.log('📦 [QUIZ API] Quiz detail structure:', {
          hasQuizDetail: !!quizDetail,
          hasQuestions: !!(quizDetail?.questions),
          questionsLength: quizDetail?.questions?.length || 0,
          quizKeys: quizDetail ? Object.keys(quizDetail) : []
        });
        setQuizQuestions([]);
      }
    } catch (error) {
      console.error('❌ [QUIZ API] Error loading quiz questions:', error);
      console.log('📦 [QUIZ API] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      setQuizQuestions([]);
    }
  }, [session?.quiz?.id]);

  // Fetch session data from API
  const fetchSession = useCallback(async () => {
    if (!sessionId) {
      setError('Không có ID phiên');
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await sessionApi.getSessionById(sessionId);
      if (response) {
        setSession(response);
        setError(null);
        console.log('✅ [CONTROL] Session loaded:', response?.quiz?.title, 'Status:', response?.status);
        console.log('📋 [CONTROL] Full session data:', response);
        
      } else {
        console.warn('⚠️ [CONTROL] No valid session data returned');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      console.error('❌ [CONTROL] Error loading session:', errorMessage);
      setError('Không thể tải thông tin phiên');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  // Xử lý lỗi socket và cập nhật trạng thái
  useEffect(() => {
    if (socketError) {
      console.error('🔌 [CONTROL] Socket error:', socketError);
      setError(`Lỗi kết nối realtime: ${socketError}`);
    } else if (isConnected && error && error.includes('Lỗi kết nối realtime')) {
      // Xóa lỗi khi kết nối thành công
      setError(null);
    }
  }, [socketError, isConnected, error]);

  // Ping định kỳ để maintain connection - giảm tần suất
  useEffect(() => {
    if (!isConnected) return;

    const pingInterval = setInterval(() => {
      sendPing(); // Đã tắt log trong sendPing
    }, 60000); // Tăng từ 30s lên 60s

    return () => clearInterval(pingInterval);
  }, [isConnected, sendPing]);

  // Xử lý kết thúc phiên với WebSocket
  const handleEndSession = useCallback(async () => {
    if (!sessionId) return;
    
    try {
      setIsEnding(true);
      console.log('🏁 [CONTROL] Ending session...');
      
      // Gửi sự kiện qua socket để thông báo realtime
      endSession();
      
      // Cập nhật trạng thái qua API
      const updatedSession = await sessionApi.endSession(sessionId);
      setSession(updatedSession);
      
      console.log('✅ Session ended successfully');
      
      // Chuyển hướng đến trang kết quả sau 1 giây
      setTimeout(() => {
        navigate(`/dashboard/sessions/${sessionId}/results`);
      }, 1000);
      
    } catch (error) {
      console.error('❌ [CONTROL] Error ending session:', error);
      setError('Không thể kết thúc phiên');
    } finally {
      setIsEnding(false);
    }
  }, [sessionId, endSession, navigate]);

  // Handle next question - định nghĩa function trước khi sử dụng
  const handleNextQuestion = useCallback(() => {
    if (quizState.currentQuestionIndex < quizQuestions.length - 1) {
      const nextIndex = quizState.currentQuestionIndex + 1;
      const nextQuestion = quizQuestions[nextIndex];
      
      setQuizState(prev => ({
        ...prev,
        currentQuestionIndex: nextIndex,
        currentQuestion: nextQuestion,
        isQuestionActive: false,
        timeLeft: nextQuestion?.timeLimit || 30
      }));

      // Phát sự kiện chuyển câu hỏi qua socket để sync với participants
      if (socket) {
        socket.emit('question-changed', {
          sessionId,
          questionIndex: nextIndex,
          question: nextQuestion,
          timestamp: new Date().toISOString()
        });
        
        console.log(`🔄 [CONTROL] Đã chuyển sang câu hỏi ${nextIndex + 1}/${quizQuestions.length}`);
      }
    } else {
      // Kết thúc quiz
      console.log('🏁 [CONTROL] Quiz completed, ending session...');
      handleEndSession();
    }
  }, [quizState.currentQuestionIndex, quizQuestions, socket, sessionId, handleEndSession]);

  // Handle previous question
  const handlePreviousQuestion = useCallback(() => {
    if (quizState.currentQuestionIndex > 0) {
      const prevIndex = quizState.currentQuestionIndex - 1;
      const prevQuestion = quizQuestions[prevIndex];
      
      setQuizState(prev => ({
        ...prev,
        currentQuestionIndex: prevIndex,
        currentQuestion: prevQuestion,
        isQuestionActive: false,
        timeLeft: prevQuestion?.timeLimit || 30
      }));

      // Phát sự kiện chuyển câu hỏi qua socket
      if (socket) {
        socket.emit('question-changed', {
          sessionId,
          questionIndex: prevIndex,
          question: prevQuestion,
          timestamp: new Date().toISOString()
        });
        
        console.log(`🔄 [CONTROL] Đã quay lại câu hỏi ${prevIndex + 1}/${quizQuestions.length}`);
      }
    }
  }, [quizState.currentQuestionIndex, quizQuestions, socket, sessionId]);

  // Âm thanh cảnh báo khi sắp hết thời gian - di chuyển lên trước để tránh hoisting error
  const playWarningSound = useCallback(() => {
    try {
      // Tạo âm thanh beep đơn giản
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800; // Tần số cao để cảnh báo
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.warn('Không thể phát âm thanh cảnh báo:', error);
    }
  }, []);

  // Timer effect với tất cả dependencies
  useEffect(() => {
    if (!quizState.isQuestionActive || quizState.timeLeft <= 0) return;

    const timer = setInterval(() => {
      setQuizState(prev => {
        const newTimeLeft = Math.max(0, prev.timeLeft - 1);
        
        // Phát âm thanh cảnh báo khi còn 10s
        if (newTimeLeft === 10) {
          playWarningSound();
        }
        
        // Cập nhật low time state
        setIsLowTime(newTimeLeft <= 10 && newTimeLeft > 0);
        
        // Tự động chuyển câu khi hết thời gian
        if (newTimeLeft === 0) {
          console.log('⏰ [CONTROL] Time up! Auto advancing to next question...');
          setTimeout(() => {
            handleNextQuestion();
          }, 1000); // Delay 1s để user thấy rõ hết thời gian
        }
        
        return {
          ...prev,
          timeLeft: newTimeLeft
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizState.isQuestionActive, quizState.timeLeft, handleNextQuestion, socket, quizQuestions, quizState.currentQuestionIndex, playWarningSound]);

  // Tính toán thống kê từ socket participants thay vì manual tracking
  const calculateStats = useCallback((): SessionStats => {
    const total = participants.length;
    const ready = participants.filter(p => p.ready).length;
    const online = participants.filter(p => p.isOnline).length;
    const readyPercentage = total > 0 ? Math.round((ready / (total-1)) * 100) : 0;

    return {
      totalParticipants: total,
      readyParticipants: ready,
      onlineParticipants: online,
      readyPercentage
    };
  }, [participants]);

  // Tính toán thống kê realtime cho quiz
  const calculateRealTimeStats = useCallback(() => {
    if (!quizQuestions.length || participants.length === 0) {
      return {
        totalAnswers: 0,
        correctAnswers: 0,
        optionStats: {}
      };
    }

    const currentQuestion = quizQuestions[quizState.currentQuestionIndex];
    if (!currentQuestion) {
      return {
        totalAnswers: 0,
        correctAnswers: 0,
        optionStats: {}
      };
    }

    const totalParticipants = participants.filter(p => p.role === 'STUDENT').length;
    const mockAnswered = Math.floor(totalParticipants * 0.8);
    const mockCorrect = Math.floor(mockAnswered * 0.6);

    const optionStats: Record<string, number> = {};
    currentQuestion.options.forEach((option, index) => {
      optionStats[option.id] = Math.floor(mockAnswered * (index === 0 ? 0.4 : 0.2));
    });

    return {
      totalAnswers: mockAnswered,
      correctAnswers: mockCorrect,
      optionStats
    };
  }, [quizQuestions, participants, quizState.currentQuestionIndex]);

  const stats = calculateStats();

  // Chuyển đổi participants từ socket thành DisplayParticipant
  const displayParticipants: DisplayParticipant[] = participants.map(p => ({
    id: p.userId,
    userId: p.userId,
    fullName: p.fullName || 'Người tham gia',
    role: p.role,
    isGuest: p.isGuest,
    ready: p.ready || false,
    joinTime: p.timestamp,
    isOnline: p.isOnline || true,
    lastActivity: new Date().toISOString()
  }));

  // Xử lý bắt đầu phiên với WebSocket
  const handleStartSession = useCallback(async () => {
    if (!sessionId) return;
    
    try {
      setIsStarting(true);
      console.log('🚀 [CONTROL] Starting session...');
      
      startSession();
      
      const updatedSession = await sessionApi.startSession(sessionId);
      setSession(updatedSession);
      
      if (updatedSession.quiz?.id) {
        await loadQuizQuestions();
      }
      
      console.log('✅ Session started successfully');
      
    } catch (error) {
      console.error('❌ [CONTROL] Error starting session:', error);
      setError('Không thể bắt đầu phiên');
    } finally {
      setIsStarting(false);
    }
  }, [sessionId, startSession, loadQuizQuestions]);

  // Start question
  const handleStartQuestion = () => {
    if (quizQuestions.length === 0 || !socket) {
      console.warn('⚠️ [CONTROL] Cannot start question:', {
        hasQuizQuestions: quizQuestions.length > 0,
        hasSocket: !!socket,
        sessionId
      });
      return;
    }
    
    const question = quizQuestions[quizState.currentQuestionIndex];
    if (!question) {
      console.warn('⚠️ [CONTROL] No current question available');
      return;
    }
    
    const timeLimit = question.timeLimit || 30;
    
    setQuizState(prev => ({
      ...prev,
      isQuestionActive: true,
      timeLeft: timeLimit
    }));
    
    console.log('📤 [CONTROL] Starting question for sessionId:', sessionId, 'with data:', {
      questionId: question.id,
      questionIndex: quizState.currentQuestionIndex,
      timeLimit,
      questionContent: question.content
    });
    
    startQuestion({
      questionId: question.id,
      questionIndex: quizState.currentQuestionIndex,
      timeLimit,
      question
    });
    
    console.log('🚀 [CONTROL] Question started:', question.content);
  };

  // End question
  const handleEndQuestion = () => {
    if (!socket || quizQuestions.length === 0) return;
    
    const question = quizQuestions[quizState.currentQuestionIndex];
    if (!question) return;
    
    setQuizState(prev => ({
      ...prev,
      isQuestionActive: false,
      timeLeft: 0
    }));
    
    const stats = calculateRealTimeStats();
    
    endQuestion({
      questionId: question.id,
      results: stats
    });
    
    console.log('✅ [CONTROL] Question ended:', question.content);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    }
  };

  // Effect để load quiz questions khi session thay đổi
  useEffect(() => {
    if (session?.quiz?.id) {
      console.log('🔄 [CONTROL] Session has quiz, loading questions...');
      console.log('📋 [CONTROL] Session details:', {
        sessionId: session.id,
        quizId: session.quiz.id,
        quizTitle: session.quiz.title,
        status: session.status
      });
      loadQuizQuestions();
    } else {
      console.warn('⚠️ [CONTROL] No quiz ID in session:', session);
    }
  }, [session?.quiz?.id, loadQuizQuestions]);

  // Hàm để mô tả hoạt động hiện tại
  const getActivityDescription = useCallback((status: string, isQuestionActive: boolean, currentIndex: number, totalQuestions: number): string => {
    switch (status) {
      case 'PENDING':
        return 'Đang chờ bắt đầu';
      case 'ACTIVE':
        if (isQuestionActive) {
          return `Đang thực hiện câu hỏi ${currentIndex + 1}/${totalQuestions}`;
        } else {
          return 'Đang chờ câu hỏi tiếp theo';
        }
      case 'WAITING_NEXT_QUESTION':
        return `Chờ câu hỏi ${currentIndex + 2}/${totalQuestions}`;
      case 'ENDED':
      case 'COMPLETED':
        return 'Phiên đã kết thúc';
      case 'CANCELED':
        return 'Phiên đã bị hủy';
      default:
        return `Trạng thái: ${status}`;
    }
  }, []);

  // Effect để cập nhật realtime status - thêm dependencies cần thiết
  useEffect(() => {
    if (!session) return;

    // Cập nhật session status realtime
    const newActivity = getActivityDescription(session.status, quizState.isQuestionActive, quizState.currentQuestionIndex, quizQuestions.length);
    
    setRealtimeStatus(prev => ({
      ...prev,
      status: session.status as SessionRealtimeStatus['status'],
      lastUpdated: new Date().toISOString(),
      participantCount: participants.length,
      activeParticipants: participants.filter(p => p.ready).length,
      currentActivity: newActivity,
      uptime: sessionStartTime ? Math.floor((Date.now() - sessionStartTime) / 1000) : 0
    }));
  }, [session, participants, quizState.isQuestionActive, quizState.currentQuestionIndex, quizQuestions.length, sessionStartTime, getActivityDescription]);

  // Effect để theo dõi thời gian uptime
  useEffect(() => {
    if (session?.status === 'ACTIVE' && !sessionStartTime) {
      setSessionStartTime(Date.now());
    }
    
    if (session?.status === 'ACTIVE' && sessionStartTime) {
      const interval = setInterval(() => {
        setRealtimeStatus(prev => ({
          ...prev,
          uptime: Math.floor((Date.now() - sessionStartTime) / 1000)
        }));
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [session?.status, sessionStartTime, setRealtimeStatus]);

  // Lắng nghe socket events cho realtime updates - thêm dependencies cần thiết
  useEffect(() => {
    if (!socket) return;

    const handleSessionStatusUpdate = (data: SessionStatusUpdateData) => {
      console.log('📨 [CONTROL] Received session-status-update:', data);
      setRealtimeStatus(prev => ({
        ...prev,
        status: data.status || prev.status,
        currentActivity: data.currentActivity || prev.currentActivity,
        participantCount: data.participantCount || prev.participantCount,
        activeParticipants: data.activeParticipants || prev.activeParticipants,
        lastUpdated: new Date().toISOString(),
        uptime: prev.uptime,
        timestamp: data.timestamp
      }));
    };

    const handleParticipantJoined = (data: ParticipantEventData) => {
      console.log('👋 [CONTROL] Participant joined:', data);
      // Cập nhật realtime status với data mới từ socket participants
      setRealtimeStatus(prev => ({
        ...prev,
        participantCount: participants.length,
        activeParticipants: participants.filter(p => p.isOnline).length,
        currentActivity: `Người tham gia mới: ${data.fullName}`,
        lastUpdated: new Date().toISOString()
      }));
    };

    const handleParticipantLeft = (data: ParticipantEventData) => {
      console.log('👋 [CONTROL] Participant left:', data);
      // Cập nhật realtime status với data từ socket participants
      setRealtimeStatus(prev => ({
        ...prev,
        participantCount: participants.length,
        activeParticipants: participants.filter(p => p.isOnline).length,
        currentActivity: `Người rời đi: ${data.fullName}`,
        lastUpdated: new Date().toISOString()
      }));
    };

    socket.on('session-status-update', handleSessionStatusUpdate);
    socket.on('participant-joined', handleParticipantJoined);
    socket.on('participant-left', handleParticipantLeft);

    return () => {
      socket.off('session-status-update', handleSessionStatusUpdate);
      socket.off('participant-joined', handleParticipantJoined);
      socket.off('participant-left', handleParticipantLeft);
    };
  }, [socket, participants]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-4 md:p-8 flex items-center justify-center">
        <Card className="p-8 bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl max-w-md w-full">
          <div className="flex flex-col items-center justify-center">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity
              }}
              className="text-5xl mb-6"
            >
              🎮
            </motion.div>
            <motion.h2
              animate={{
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity
              }}
              className="text-2xl font-medium text-purple-800 mb-2"
            >
              Đang tải phòng điều khiển...
            </motion.h2>
          </div>
        </Card>
      </div>
    );
  }

  // Error state
  if (error || !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-4 md:p-8 flex items-center justify-center">
        <Card className="p-8 bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl max-w-md w-full">
          <div className="flex flex-col items-center justify-center text-center">
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity
              }}
              className="text-5xl mb-6"
            >
              ⚠️
            </motion.div>
            <h2 className="text-2xl font-medium text-red-600 mb-4">
              {error || 'Không tìm thấy thông tin phiên'}
            </h2>
            <div className="flex gap-3">
              <Button onClick={fetchSession} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Thử lại
              </Button>
              <Button onClick={() => navigate('/dashboard/sessions')}>
                Quay lại danh sách phiên
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-4 md:p-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto space-y-6"
      >
        {/* Header với trạng thái kết nối realtime */}
        <motion.div variants={itemVariants}>
          <Card className="p-6 bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="text-center md:text-left mb-4 md:mb-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-4xl">🎮</span>
                  <div>
                    <h1 className="text-3xl font-bold text-purple-800">
                      Điều Khiển Phiên Quiz
                    </h1>
                    <p className="text-lg text-gray-700">
                      {session.quiz?.title}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-purple-600">
                  {session.quiz?.description}
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Trạng thái kết nối WebSocket */}
                <motion.div 
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                    isConnected 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}
                  animate={{
                    scale: isConnected ? [1, 1.05, 1] : 1
                  }}
                  transition={{
                    duration: 2,
                    repeat: isConnected ? Infinity : 0
                  }}
                >
                  {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                  <span className="text-sm font-medium">
                    {isConnected ? 'Realtime' : 'Mất kết nối'}
                  </span>
                </motion.div>
                
                <Button onClick={fetchSession} variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Thống kê realtime từ WebSocket */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Tổng người tham gia</p>
                  <motion.p 
                    className="text-2xl font-bold text-blue-800"
                    key={stats.totalParticipants}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.3 }}
                  >
                    {stats.totalParticipants}
                  </motion.p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Đã sẵn sàng</p>
                  <motion.p 
                    className="text-2xl font-bold text-green-800"
                    key={stats.readyParticipants}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.3 }}
                  >
                    {stats.readyParticipants}
                  </motion.p>
                </div>
                <UserCheck className="w-8 h-8 text-green-600" />
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Đang online</p>
                  <motion.p 
                    className="text-2xl font-bold text-purple-800"
                    key={stats.onlineParticipants}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.3 }}
                  >
                    {stats.onlineParticipants}
                  </motion.p>
                </div>
                <Monitor className="w-8 h-8 text-purple-600" />
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 font-medium">% Sẵn sàng</p>
                  <motion.p 
                    className="text-2xl font-bold text-orange-800"
                    key={stats.readyPercentage}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.3 }}
                  >
                    {stats.readyPercentage}%
                  </motion.p>
                </div>
                <div className="relative w-8 h-8">
                  <div className="w-8 h-8 rounded-full border-4 border-orange-200"></div>
                  <motion.div 
                    className="absolute top-0 left-0 w-8 h-8 rounded-full border-4 border-orange-600 border-r-transparent transform -rotate-90"
                    animate={{
                      rotate: [270, 270 + (stats.readyPercentage * 3.6)]
                    }}
                    transition={{ duration: 0.5 }}
                  ></motion.div>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>

        {/* Realtime Status Indicator */}
        <motion.div variants={itemVariants}>
          <SessionStatusDashboard
            realtimeStatus={realtimeStatus}
            isConnected={isConnected}
          />
        </motion.div>

        {/* Điều khiển phiên với trạng thái realtime */}
        <motion.div variants={itemVariants}>
          <Card className="p-6 bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center gap-4 mb-4 md:mb-0">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-600">Trạng thái:</span>
                  <Badge variant={
                    session.status === 'PENDING' ? 'secondary' :
                    session.status === 'ACTIVE' ? 'default' :
                    (session.status === 'ENDED' || session.status === 'CANCELED') ? 'outline' : 'destructive'
                  }>
                    {session.status === 'PENDING' ? 'Chờ bắt đầu' : 
                     session.status === 'ACTIVE' ? 'Đang diễn ra' : 
                     session.status === 'ENDED' ? 'Đã kết thúc' :
                     (session.status === 'CANCELED') ? 'Đã hủy' : 
                     `Trạng thái: ${session.status}`}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-600">Mã phòng:</span>
                  <Badge variant="outline" className="font-mono">
                    {session.code}
                  </Badge>
                </div>
              </div>

              <div className="flex gap-3">
                {session.status === 'PENDING' && (
                  <Button
                    size="lg"
                    onClick={handleStartSession}
                    disabled={isStarting || !isConnected}
                    className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    {isStarting ? 'Đang bắt đầu...' : 'Bắt đầu phiên'}
                  </Button>
                )}
                
                {session.status === 'ACTIVE' && (
                  <Button
                    size="lg"
                    onClick={handleEndSession}
                    disabled={isEnding || !isConnected}
                    className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
                  >
                    <Square className="w-5 h-5 mr-2" />
                    {isEnding ? 'Đang kết thúc...' : 'Kết thúc phiên'}
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={() => setShowParticipantDetails(!showParticipantDetails)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {showParticipantDetails ? 'Ẩn chi tiết' : 'Hiện chi tiết'}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Quiz Control Panel - Chỉ hiển thị khi session ACTIVE */}
        {session.status === 'ACTIVE' && quizQuestions.length > 0 && (
          <motion.div variants={itemVariants}>
            <Card className="p-6 bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Điều khiển Quiz Realtime
                </h2>
                
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    Câu {quizState.currentQuestionIndex + 1}/{quizQuestions.length}
                  </Badge>
                  {quizState.isQuestionActive && (
                    <Badge variant="default" className="bg-green-500">
                      <Timer className="w-3 h-3 mr-1" />
                      {quizState.timeLeft}s
                    </Badge>
                  )}
                  {isLowTime && (
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [1, 0.7, 1]
                      }}
                      transition={{
                        duration: 0.5,
                        repeat: Infinity
                      }}
                    >
                      <Badge variant="destructive" className="bg-red-500">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Sắp hết thời gian!
                      </Badge>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Current Question Display */}
              {quizState.currentQuestion && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">
                          Câu {quizState.currentQuestion.order}
                        </Badge>
                        <Badge variant={
                          quizState.currentQuestion.difficulty === 'EASY' ? 'secondary' :
                          quizState.currentQuestion.difficulty === 'MEDIUM' ? 'default' :
                          'destructive'
                        }>
                          {quizState.currentQuestion.difficulty === 'EASY' ? 'Dễ' :
                           quizState.currentQuestion.difficulty === 'MEDIUM' ? 'Trung bình' : 'Khó'}
                        </Badge>
                        <Badge variant="outline">
                          {quizState.currentQuestion.points} điểm
                        </Badge>
                      </div>
                      <h3 className="text-lg font-medium text-gray-800 mb-4">
                        {quizState.currentQuestion.content}
                      </h3>
                      
                      {/* Answer Options */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {quizState.currentQuestion.options.map((option, index) => (
                          <div
                            key={option.id}
                            className={`p-3 rounded-lg border-2 ${
                              option.isCorrect 
                                ? 'border-green-200 bg-green-50' 
                                : 'border-gray-200 bg-white'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className={`w-6 h-6 flex items-center justify-center rounded-full text-sm font-medium ${
                                option.isCorrect 
                                  ? 'bg-green-500 text-white' 
                                  : 'bg-gray-300 text-gray-700'
                              }`}>
                                {String.fromCharCode(65 + index)}
                              </span>
                              <span className="text-sm">{option.content}</span>
                              {option.isCorrect && (
                                <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Time Progress */}
                    <div className="ml-6">
                      <div className="text-center">
                        <motion.div 
                          className={`text-3xl font-bold ${
                            quizState.timeLeft <= 3 ? 'text-red-500' :
                            quizState.timeLeft <= 10 ? 'text-yellow-500' : 'text-blue-500'
                          }`}
                          animate={isLowTime ? {
                            scale: [1, 1.2, 1],
                            textShadow: [
                              '0 0 0px rgba(239, 68, 68, 0)',
                              '0 0 20px rgba(239, 68, 68, 0.8)',
                              '0 0 0px rgba(239, 68, 68, 0)'
                            ]
                          } : {}}
                          transition={{
                            duration: 1,
                            repeat: isLowTime ? Infinity : 0
                          }}
                        >
                          {quizState.timeLeft}
                        </motion.div>
                        <div className="text-xs text-gray-500">giây</div>
                        <div className="w-20 h-2 bg-gray-200 rounded-full mt-2">
                          <motion.div 
                            className={`h-2 rounded-full transition-all duration-1000 ${
                              quizState.timeLeft <= 3 ? 'bg-red-500' :
                              quizState.timeLeft <= 10 ? 'bg-yellow-500' : 'bg-blue-500'
                            }`}
                            style={{ 
                              width: `${(quizState.timeLeft / (quizState.currentQuestion?.timeLimit || 30)) * 100}%` 
                            }}
                            animate={isLowTime ? {
                              opacity: [1, 0.5, 1]
                            } : {}}
                            transition={{
                              duration: 0.5,
                              repeat: isLowTime ? Infinity : 0
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Quiz Navigation Controls */}
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handlePreviousQuestion}
                    disabled={quizState.currentQuestionIndex === 0}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Câu trước
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleNextQuestion}
                    disabled={quizState.currentQuestionIndex === quizQuestions.length - 1}
                  >
                    Câu sau
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>

                <div className="flex gap-2">
                  {!quizState.isQuestionActive ? (
                    <Button
                      onClick={handleStartQuestion}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <PlayCircle className="w-4 h-4 mr-2" />
                      Bắt đầu câu hỏi
                    </Button>
                  ) : (
                    <Button
                      onClick={handleEndQuestion}
                      variant="outline"
                    >
                      <PauseCircle className="w-4 h-4 mr-2" />
                      Tạm dừng
                    </Button>
                  )}
                  
                  <Button
                    onClick={handleNextQuestion}
                    variant="outline"
                  >
                    <SkipForward className="w-4 h-4 mr-2" />
                    Bỏ qua
                  </Button>
                </div>
              </div>

              {/* Questions Overview */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Danh sách câu hỏi:</h4>
                <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                  {quizQuestions.map((question, index) => (
                    <button
                      key={question.id}
                      onClick={() => setQuizState(prev => ({
                        ...prev,
                        currentQuestionIndex: index,
                        currentQuestion: question,
                        timeLeft: question.timeLimit,
                        isQuestionActive: false
                      }))}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                        index === quizState.currentQuestionIndex
                          ? 'bg-blue-500 text-white shadow-lg scale-110'
                          : index < quizState.currentQuestionIndex
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Danh sách người tham gia realtime */}
        <AnimatePresence>
          {showParticipantDetails && (
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <Card className="p-6 bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Người tham gia realtime ({displayParticipants.length})
                  </h2>
                  
                  {stats.readyPercentage === 100 && stats.totalParticipants > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-2 text-green-600"
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Tất cả đã sẵn sàng!</span>
                    </motion.div>
                  )}
                </div>

                {displayParticipants.length > 0 ? (
                  <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <AnimatePresence>
                      {displayParticipants.map((participant) => (
                        <motion.div
                          key={participant.userId}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          layout
                          whileHover={{ scale: 1.02 }}
                        >
                          <Card className={`p-4 transition-all duration-300 ${
                            participant.ready 
                              ? 'bg-green-50 border-green-200 shadow-green-100' 
                              : 'bg-gray-50 border-gray-200'
                          }`}>
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold transition-colors ${
                                  participant.ready ? 'bg-green-500' : 'bg-gray-400'
                                }`}>
                                  {participant.fullName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-800">
                                    {participant.fullName}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge 
                                      variant={participant.isGuest ? 'secondary' : 'outline'}
                                      className="text-xs"
                                    >
                                      {participant.isGuest ? 'Khách' : 'Thành viên'}
                                    </Badge>
                                    <Badge 
                                      variant={participant.role === 'PROCTOR' ? 'default' : 'outline'}
                                      className="text-xs"
                                    >
                                      {participant.role}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Tham gia: {new Date(participant.joinTime).toLocaleTimeString('vi-VN')}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex flex-col items-end gap-2">
                                {participant.ready ? (
                                  <motion.div 
                                    className="flex items-center gap-1 text-green-600"
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 0.5 }}
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                    <span className="text-xs font-medium">Sẵn sàng</span>
                                  </motion.div>
                                ) : (
                                  <div className="flex items-center gap-1 text-gray-500">
                                    <AlertCircle className="w-4 h-4" />
                                    <span className="text-xs">Chưa sẵn sàng</span>
                                  </div>
                                )}
                                
                                <motion.div 
                                  className={`w-2 h-2 rounded-full ${
                                    participant.isOnline ? 'bg-green-400' : 'bg-gray-400'
                                  }`} 
                                  title={participant.isOnline ? 'Online' : 'Offline'}
                                  animate={participant.isOnline ? {
                                    opacity: [1, 0.5, 1]
                                  } : {}}
                                  transition={{
                                    duration: 2,
                                    repeat: Infinity
                                  }}
                                />
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                ) : (
                  <motion.div 
                    className="text-center py-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Chưa có người tham gia nào</p>
                    <p className="text-gray-400 text-sm mt-2">
                      Người tham gia sẽ xuất hiện realtime khi họ vào phòng chờ
                    </p>
                  </motion.div>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Thông báo trạng thái kết nối */}
        {!isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg"
          >
            <div className="flex items-center gap-2">
              <WifiOff className="w-5 h-5" />
              <span>Mất kết nối realtime</span>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default SessionControl; 
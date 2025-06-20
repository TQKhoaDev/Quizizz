import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

// Định nghĩa các interface
interface UseSocketOptions {
  sessionId: string;
  role: 'PROCTOR' | 'STUDENT' | 'ADMIN';
  token: string;
  autoConnect?: boolean;
}

interface TestConnectionData {
  message: string;
  userId: string;
  sessionId: string;
}



// Định nghĩa interface cho question
interface QuestionData {
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

// Định nghĩa interface cho participant - cải thiện
interface ParticipantData {
  userId: string;
  fullName: string;
  role: 'PROCTOR' | 'STUDENT' | 'ADMIN';
  isGuest: boolean;
  ready: boolean;
  timestamp: string;
  isOnline: boolean;
}

// Interface cho participant events
interface ParticipantJoinedData {
  userId: string;
  fullName: string;
  role: 'PROCTOR' | 'STUDENT' | 'ADMIN';
  isGuest: boolean;
  timestamp: string;
  totalParticipants: number;
}

interface ParticipantLeftData {
  userId: string;
  fullName: string;
  timestamp: string;
  remainingParticipants: number;
}

interface ParticipantReadyData {
  userId: string;
  fullName: string;
  timestamp: string;
}

// Thêm interface cho question events
interface QuestionStartData {
  questionId: string;
  questionIndex: number;
  timeLimit: number;
  question: QuestionData;
}

interface QuestionEndData {
  questionId: string;
  results: {
    totalAnswers: number;
    correctAnswers: number;
    optionStats: Record<string, number>;
  };
}

// Interface cho navigation state
interface NavigationState {
  path: string;
  delay?: number;
}

// Interface cho connection stats
interface ConnectionStats {
  totalParticipants: number;
  onlineParticipants: number;
  readyParticipants: number;
  lastActivity: string;
}

// Thêm interface cho session status events
interface SessionStatusData {
  sessionId: string;
  status: 'PENDING' | 'ACTIVE' | 'ENDED' | 'COMPLETED' | 'CANCELED';
  timestamp: string;
}

// Interface cho question state mới
interface CurrentQuestionState {
  questionId: string;
  questionIndex: number;
  question: QuestionData;
  timeLeft: number;
  startTime: string;
  isActive: boolean;
}

// Interface cho participant answer feedback
interface ParticipantAnsweredData {
  userId: string;
  fullName: string;
  questionId: string;
  responseTime: number;
  timestamp: string;
}

export const useSocket = ({ sessionId, role, token, autoConnect = true }: UseSocketOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testMessage, setTestMessage] = useState<string>('');
  const [participants, setParticipants] = useState<ParticipantData[]>([]);
  const [connectionStats, setConnectionStats] = useState<ConnectionStats>({
    totalParticipants: 0,
    onlineParticipants: 0,
    readyParticipants: 0,
    lastActivity: new Date().toISOString()
  });
  const [recentActivity, setRecentActivity] = useState<string>('');
  
  // Thêm state cho session status và navigation
  const [sessionStatus, setSessionStatus] = useState<'PENDING' | 'ACTIVE' | 'ENDED' | 'COMPLETED' | 'CANCELED' | 'WAITING_NEXT_QUESTION'>('PENDING');
  const [shouldNavigate, setShouldNavigate] = useState<NavigationState | null>(null);
  
  // Thêm state cho realtime question control
  const [currentQuestion, setCurrentQuestion] = useState<CurrentQuestionState | null>(null);
  const [questionStarted, setQuestionStarted] = useState(false);
  const [answerSubmissions, setAnswerSubmissions] = useState<ParticipantAnsweredData[]>([]);
  
  const socketRef = useRef<Socket | null>(null);

  // Cập nhật stats khi participants thay đổi
  const updateConnectionStats = useCallback((participantList: ParticipantData[]) => {
    const stats: ConnectionStats = {
      totalParticipants: participantList.length,
      onlineParticipants: participantList.filter(p => p.isOnline).length,
      readyParticipants: participantList.filter(p => p.ready).length,
      lastActivity: new Date().toISOString()
    };
    setConnectionStats(stats);
  }, []);

  // Hàm để sync participants
  const syncParticipants = useCallback(() => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('get-participant-list');
    }
  }, [isConnected]);

  useEffect(() => {
    if (!sessionId || !role || !token) {
      return;
    }

    const socketUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/quiz-sessions`;
    
    socketRef.current = io(socketUrl, {
      autoConnect,
      auth: { token },
      query: { 
        sessionId, 
        role,
        token
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000
    });

    const socket = socketRef.current;

    // Đăng ký các sự kiện cơ bản
    socket.on('connect', () => {
      setIsConnected(true);
      setError(null);
      
      // Yêu cầu danh sách participants ngay khi kết nối
      setTimeout(() => {
        socket.emit('get-participant-list');
        
        // Yêu cầu thông tin current question để sync state
        socket.emit('get-current-question');
      }, 500);
    });

    socket.on('test-connection', (_data: TestConnectionData) => {
      setTestMessage(_data.message);
    });

    socket.on('test-message-received', () => {
      // Silent
    });

    socket.on('connect_error', (err: Error) => {
      setError(`Lỗi kết nối: ${err.message}`);
      setIsConnected(false);
    });

    socket.on('disconnect', (reason: string) => {
      setIsConnected(false);
      
      if (reason === 'io client disconnect') {
        socket.connect();
      }
    });

    // Event handlers cải thiện cho participants
    socket.on('participant-joined', (_data: ParticipantJoinedData) => {
      setRecentActivity(`${_data.fullName} đã tham gia`);
    });

    socket.on('participant-left', (_data: ParticipantLeftData) => {
      setRecentActivity(`${_data.fullName} đã rời khỏi phòng`);
      
      // Xóa khỏi danh sách ngay lập tức cho UX mượt mà
      setParticipants(prev => {
        const updated = prev.filter(p => p.userId !== _data.userId);
        updateConnectionStats(updated);
        return updated;
      });
    });

    socket.on('participant-ready', (_data: ParticipantReadyData) => {
      setRecentActivity(`${_data.fullName} đã sẵn sàng`);
      
      setParticipants(prev => {
        const updated = prev.map(p => 
          p.userId === _data.userId ? {...p, ready: true} : p
        );
        updateConnectionStats(updated);
        return updated;
      });
    });

    socket.on('participant-not-ready', (_data: ParticipantReadyData) => {
      setRecentActivity(`${_data.fullName} chưa sẵn sàng`);
      
      setParticipants(prev => {
        const updated = prev.map(p => 
          p.userId === _data.userId ? {...p, ready: false} : p
        );
        updateConnectionStats(updated);
        return updated;
      });
    });

    // Event handler quan trọng nhất - cập nhật danh sách đầy đủ
    socket.on('participant-list-updated', (_data: ParticipantData[]) => {
      setParticipants(_data);
      updateConnectionStats(_data);
    });

    // Cập nhật session events để có navigation
    socket.on('session-started', (_data) => {
      setSessionStatus('ACTIVE');
      
      if (role === 'STUDENT') {
        // Lấy sessionId từ data hoặc sử dụng sessionId hiện tại
        const currentSessionId = _data.sessionId || _data.sessionCode || _data.code || sessionId;
        
        // Lấy quizId từ session info để tạo URL đúng
        let quizId: string | null = null;
        
        // Thử nhiều cách để lấy quizId
        // Cách 1: Từ session_info_${currentSessionId}
        const sessionInfo = localStorage.getItem(`session_info_${currentSessionId}`);
        if (sessionInfo) {
          try {
            const parsedSession = JSON.parse(sessionInfo);
            if (parsedSession && parsedSession.quiz && parsedSession.quiz.id) {
              quizId = parsedSession.quiz.id;
            }
          } catch {
            // Silent
          }
        }
        
        // Cách 2: Từ session_info_${sessionId} (nếu currentSessionId khác sessionId)
        if (!quizId && currentSessionId !== sessionId) {
          const sessionInfoById = localStorage.getItem(`session_info_${sessionId}`);
          if (sessionInfoById) {
            try {
              const parsedSession = JSON.parse(sessionInfoById);
              if (parsedSession && parsedSession.quiz && parsedSession.quiz.id) {
                quizId = parsedSession.quiz.id;
              }
            } catch {
              // Silent
            }
          }
        }
        
        // Bắt buộc phải có quizId mới navigate
        if (!quizId) {
          return;
        }
        
        // Tạo URL với sessionId (không phải sessionCode)
        const navigationPath = `/quiz/play/${currentSessionId}?quizId=${quizId}`;
        
        setShouldNavigate({
          path: navigationPath,
          delay: 1500
        });
      }
    });

    socket.on('session-ended', () => {
      console.log('🏁 [SOCKET] Session ended event received');
      setSessionStatus('ENDED');
      setRecentActivity('Phiên quiz đã kết thúc');
      
      // Navigation dựa trên role
      if (role === 'STUDENT') {
        // Lấy participantId từ localStorage
        const participantId = localStorage.getItem(`participant_${sessionId}`) || 
                            localStorage.getItem('participantId') ||
                            localStorage.getItem('userId');
        
        console.log('🔍 [SOCKET] Navigation data:', {
          role,
          sessionId,
          participantId,
          hasParticipantId: !!participantId
        });
        
        if (participantId) {
          const navPath = `/answers/participants/${participantId}/results`;
          console.log('🔗 [SOCKET] Navigating to:', navPath);
          setShouldNavigate({ 
            path: navPath,
            delay: 2000 
          });
        } else {
          // Fallback nếu không có participantId
          const fallbackPath = `/sessions/${sessionId}/results`;
          console.log('🔗 [SOCKET] Fallback navigation to:', fallbackPath);
          setShouldNavigate({ 
            path: fallbackPath,
            delay: 2000 
          });
        }
      } else if (role === 'PROCTOR') {
        const proctorPath = `/dashboard/sessions/${sessionId}/results`;
        console.log('🔗 [SOCKET] Proctor navigation to:', proctorPath);
        setShouldNavigate({ 
          path: proctorPath,
          delay: 1000 
        });
      }
    });

    socket.on('session-status-changed', (_data: SessionStatusData) => {
      setSessionStatus(_data.status);
      
      // Cập nhật activity message
      const statusMessages = {
        'PENDING': 'Đang chờ bắt đầu',
        'ACTIVE': 'Phiên đang diễn ra',
        'ENDED': 'Phiên đã kết thúc',
        'COMPLETED': 'Phiên đã hoàn thành',
        'CANCELED': 'Phiên đã bị hủy'
      };
      setRecentActivity(statusMessages[_data.status] || `Trạng thái: ${_data.status}`);
    });

    // Thêm event listeners cho question control
    socket.on('question-started', (data: QuestionStartData & { startTime: string }) => {
      console.log('🚀 [SOCKET] Question started event received:', {
        questionId: data.questionId,
        questionIndex: data.questionIndex,
        timeLimit: data.timeLimit,
        startTime: data.startTime,
        currentTime: new Date().toISOString()
      });

      setQuestionStarted(true);
      
      // Tắt realtime timer - chỉ set state ban đầu
      setCurrentQuestion({
        questionId: data.questionId,
        questionIndex: data.questionIndex,
        question: data.question,
        timeLeft: data.timeLimit, // Set thời gian đầy đủ, không countdown
        startTime: data.startTime,
        isActive: true
      });
      setRecentActivity(`Câu hỏi ${data.questionIndex + 1} đã bắt đầu`);
      
      // COMMENT OUT: Tắt countdown timer realtime
      /*
      // Tính toán thời gian còn lại
      const startTime = new Date(data.startTime).getTime();
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      const remaining = Math.max(0, data.timeLimit - elapsed);
      
      console.log('⏰ [SOCKET] Time calculation:', {
        startTime: data.startTime,
        startTimeMs: startTime,
        nowMs: now,
        elapsed: elapsed,
        timeLimit: data.timeLimit,
        remaining: remaining,
        isExpired: remaining <= 0
      });
      
      // Nếu question đã hết thời gian, không cần set timer
      if (remaining <= 0) {
        console.log('⚠️ [SOCKET] Question already expired, not setting timer');
        setCurrentQuestion({
          questionId: data.questionId,
          questionIndex: data.questionIndex,
          question: data.question,
          timeLeft: 0,
          startTime: data.startTime,
          isActive: false
        });
        setQuestionStarted(false);
        return;
      }
      
      setCurrentQuestion({
        questionId: data.questionId,
        questionIndex: data.questionIndex,
        question: data.question,
        timeLeft: remaining,
        startTime: data.startTime,
        isActive: true
      });
      setRecentActivity(`Câu hỏi ${data.questionIndex + 1} đã bắt đầu`);
      
      // Đặt timer để countdown
      const timer = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - startTime) / 1000);
        const remaining = Math.max(0, data.timeLimit - elapsed);
        
        setCurrentQuestion(prev => prev ? { ...prev, timeLeft: remaining } : null);
        
        if (remaining <= 0) {
          console.log('⏰ [SOCKET] Question timer expired');
          clearInterval(timer);
          setQuestionStarted(false);
          setCurrentQuestion(prev => prev ? { ...prev, isActive: false } : null);
        }
      }, 1000);
      */
    });

    socket.on('question-ended', () => {
      setQuestionStarted(false);
      setCurrentQuestion(prev => prev ? { ...prev, isActive: false } : null);
      setRecentActivity('Câu hỏi đã kết thúc');
      
      // Sau 3 giây clear current question
      setTimeout(() => {
        setCurrentQuestion(null);
        setAnswerSubmissions([]);
      }, 3000);
    });

    socket.on('participant-answered', (data: ParticipantAnsweredData) => {
      console.log('📝 [SOCKET] Participant answered:', data);
      setAnswerSubmissions(prev => {
        // Tránh duplicate
        const exists = prev.find(a => a.userId === data.userId && a.questionId === data.questionId);
        if (!exists) {
          return [...prev, data];
        }
        return prev;
      });
      setRecentActivity(`${data.fullName} đã trả lời`);
    });

    socket.on('current-question', (data: CurrentQuestionState | null) => {
      console.log('📋 [SOCKET] Received current-question data:', data);
      
      if (data) {
        console.log('📋 [SOCKET] Setting current question:', {
          questionId: data.questionId,
          questionIndex: data.questionIndex,
          timeLeft: data.timeLeft,
          isActive: data.isActive
        });
        setCurrentQuestion(data);
        setQuestionStarted(data.isActive);
      } else {
        console.log('📋 [SOCKET] No current question, clearing state');
        setCurrentQuestion(null);
        setQuestionStarted(false);
      }
    });

    socket.on('answer-submitted', () => {
      // Silent
    });

    socket.on('pong', () => {
      // Xử lý phản hồi ping - không log để tránh spam
    });

    socket.on('error', (errorData: { message: string }) => {
      setError(errorData.message);
    });

    // Kết nối socket nếu autoConnect là true
    if (autoConnect) {
      socket.connect();
    }

    return () => {
      if (socket && socket.connected) {
        socket.disconnect();
      }
    };
  }, [sessionId, role, token, autoConnect, updateConnectionStats]);

  // Các hàm action được cải thiện
  const markReady = useCallback(() => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('mark-ready');
    }
  }, [isConnected]);

  const markNotReady = useCallback(() => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('mark-not-ready');
    }
  }, [isConnected]);

  const startSession = useCallback(() => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('start-session');
    }
  }, [isConnected]);

  const endSession = useCallback(() => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('end-session');
    }
  }, [isConnected]);

  // Các hàm action cho question control
  const startQuestion = useCallback((data: QuestionStartData) => {
    if (socketRef.current && isConnected && role === 'PROCTOR') {
      socketRef.current.emit('start-question', {
        sessionId,
        ...data
      });
    }
  }, [isConnected, sessionId, role]);

  const endQuestion = useCallback((data: QuestionEndData) => {
    if (socketRef.current && isConnected && role === 'PROCTOR') {
      socketRef.current.emit('end-question', {
        sessionId,
        ...data
      });
    }
  }, [isConnected, sessionId, role]);

  const submitAnswerEvent = useCallback((data: {
    questionId: string;
    optionId: string;
    responseTime: number;
  }) => {
    if (socketRef.current && isConnected && role === 'STUDENT') {
      console.log('📤 [SOCKET] Submitting answer event:', data);
      socketRef.current.emit('answer-submitted', data);
    }
  }, [isConnected, role]);

  const getCurrentQuestion = useCallback(() => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('get-current-question');
    }
  }, [isConnected]);

  const autoNextQuestion = useCallback(() => {
    if (socketRef.current && isConnected && role === 'PROCTOR') {
      socketRef.current.emit('auto-next-question');
    }
  }, [isConnected, role]);

  const sendPing = useCallback(() => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('ping', {
        sessionId,
        timestamp: new Date().toISOString()
      });
    }
  }, [isConnected, sessionId]);

  return {
    socket: socketRef.current,
    isConnected,
    error,
    testMessage,
    participants,
    connectionStats,
    recentActivity,
    sessionStatus,
    shouldNavigate,
    setShouldNavigate,
    // Question control states
    currentQuestion,
    questionStarted,
    answerSubmissions,
    // Actions
    markReady,
    markNotReady,
    startSession,
    endSession,
    startQuestion,
    endQuestion,
    submitAnswerEvent,
    getCurrentQuestion,
    autoNextQuestion,
    sendPing,
    syncParticipants
  };
};
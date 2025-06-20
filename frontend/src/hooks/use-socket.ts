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

interface TestMessageData {
  message: string;
  timestamp?: string;
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

// Interface cho connection stats
interface ConnectionStats {
  totalParticipants: number;
  onlineParticipants: number;
  readyParticipants: number;
  lastActivity: string;
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
      console.log('🔄 Requesting participant list sync...');
      socketRef.current.emit('get-participant-list');
    }
  }, [isConnected]);

  useEffect(() => {
    if (!sessionId || !role || !token) {
      console.log('Thiếu thông tin cần thiết để kết nối socket:', { sessionId, role, token });
      return;
    }

    const socketUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/quiz-sessions`;
    console.log('Đang kết nối tới socket URL:', socketUrl);
    console.log('Thông tin kết nối:', { sessionId, role, token });
    
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
      console.log('✅ Socket đã kết nối thành công');
      setIsConnected(true);
      setError(null);
      
      // Yêu cầu danh sách participants ngay khi kết nối
      setTimeout(() => {
        socket.emit('get-participant-list');
      }, 500);
    });

    socket.on('test-connection', (data: TestConnectionData) => {
      console.log('✅ Nhận thông báo kết nối:', data);
      setTestMessage(data.message);
    });

    socket.on('test-message-received', (data: TestMessageData) => {
      console.log('📨 Nhận tin nhắn test:', data);
    });

    socket.on('connect_error', (err: Error) => {
      console.error('❌ Lỗi kết nối:', err.message);
      setError(`Lỗi kết nối: ${err.message}`);
      setIsConnected(false);
    });

    socket.on('disconnect', (reason: string) => {
      console.log('❌ Socket đã ngắt kết nối:', reason);
      setIsConnected(false);
      
      if (reason === 'io client disconnect') {
        console.log('Đang thử kết nối lại...');
        socket.connect();
      }
    });

    // Event handlers cải thiện cho participants
    socket.on('participant-joined', (data: ParticipantJoinedData) => {
      console.log('👥 Người tham gia mới:', data);
      setRecentActivity(`${data.fullName} đã tham gia`);
      
      // Không tự động thêm vào danh sách, đợi participant-list-updated
      // để tránh duplicate và đảm bảo consistency
    });

    socket.on('participant-left', (data: ParticipantLeftData) => {
      console.log('❌ Người tham gia rời đi:', data);
      setRecentActivity(`${data.fullName} đã rời khỏi phòng`);
      
      // Xóa khỏi danh sách ngay lập tức cho UX mượt mà
      setParticipants(prev => {
        const updated = prev.filter(p => p.userId !== data.userId);
        updateConnectionStats(updated);
        return updated;
      });
    });

    socket.on('participant-ready', (data: ParticipantReadyData) => {
      console.log('✅ Người tham gia sẵn sàng:', data);
      setRecentActivity(`${data.fullName} đã sẵn sàng`);
      
      setParticipants(prev => {
        const updated = prev.map(p => 
          p.userId === data.userId ? {...p, ready: true} : p
        );
        updateConnectionStats(updated);
        return updated;
      });
    });

    socket.on('participant-not-ready', (data: ParticipantReadyData) => {
      console.log('⏳ Người tham gia chưa sẵn sàng:', data);
      setRecentActivity(`${data.fullName} chưa sẵn sàng`);
      
      setParticipants(prev => {
        const updated = prev.map(p => 
          p.userId === data.userId ? {...p, ready: false} : p
        );
        updateConnectionStats(updated);
        return updated;
      });
    });

    // Event handler quan trọng nhất - cập nhật danh sách đầy đủ
    socket.on('participant-list-updated', (data: ParticipantData[]) => {
      console.log('📋 Cập nhật danh sách participants:', data);
      setParticipants(data);
      updateConnectionStats(data);
    });

    socket.on('session-started', (data: { sessionId: string; timestamp: string }) => {
      console.log('🚀 Phiên bắt đầu:', data);
      setRecentActivity('Phiên quiz đã bắt đầu');
    });

    socket.on('session-ended', (data: { sessionId: string; timestamp: string }) => {
      console.log('🏁 Phiên kết thúc:', data);
      setRecentActivity('Phiên quiz đã kết thúc');
    });

    // Thêm các event listeners cho question control
    socket.on('question-started', (data: QuestionStartData) => {
      console.log('📝 Câu hỏi bắt đầu:', data);
      setRecentActivity(`Câu hỏi ${data.questionIndex + 1} đã bắt đầu`);
    });

    socket.on('question-ended', (data: QuestionEndData) => {
      console.log('✅ Câu hỏi kết thúc:', data);
      setRecentActivity(`Câu hỏi đã kết thúc`);
    });

    socket.on('answer-submitted', (data: { userId: string; questionId: string; answer: string }) => {
      console.log('📝 Có câu trả lời mới:', data);
    });

    socket.on('pong', () => {
      // Xử lý phản hồi ping - không log để tránh spam
    });

    socket.on('error', (errorData: { message: string }) => {
      console.error('🚨 Socket error:', errorData);
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
      console.log('✅ Đánh dấu sẵn sàng');
      socketRef.current.emit('mark-ready');
    }
  }, [isConnected]);

  const markNotReady = useCallback(() => {
    if (socketRef.current && isConnected) {
      console.log('⏳ Hủy trạng thái sẵn sàng');
      socketRef.current.emit('mark-not-ready');
    }
  }, [isConnected]);

  const startSession = useCallback(() => {
    if (socketRef.current && isConnected) {
      console.log('🚀 Bắt đầu phiên');
      socketRef.current.emit('start-session');
    }
  }, [isConnected]);

  const endSession = useCallback(() => {
    if (socketRef.current && isConnected) {
      console.log('🏁 Kết thúc phiên');
      socketRef.current.emit('end-session');
    }
  }, [isConnected]);

  const startQuestion = useCallback((data: QuestionStartData) => {
    if (socketRef.current && isConnected) {
      console.log('📤 Starting question:', data);
      socketRef.current.emit('start-question', {
        sessionId,
        ...data
      });
    }
  }, [isConnected, sessionId]);

  const endQuestion = useCallback((data: QuestionEndData) => {
    if (socketRef.current && isConnected) {
      console.log('📤 Ending question:', data);
      socketRef.current.emit('end-question', {
        sessionId,
        ...data
      });
    }
  }, [isConnected, sessionId]);

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
    markReady,
    markNotReady,
    startSession,
    endSession,
    startQuestion,
    endQuestion,
    sendPing,
    syncParticipants
  };
};
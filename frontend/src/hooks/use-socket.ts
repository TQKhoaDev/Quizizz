import { useEffect, useRef, useState } from 'react';
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

// Định nghĩa interface cho participant
interface ParticipantData {
  userId: string;
  fullName: string;
  role: 'PROCTOR' | 'STUDENT' | 'ADMIN';
  isGuest: boolean;
  ready: boolean;
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

export const useSocket = ({ sessionId, role, token, autoConnect = true }: UseSocketOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testMessage, setTestMessage] = useState<string>('');
  const [participants, setParticipants] = useState<ParticipantData[]>([]);
  const socketRef = useRef<Socket | null>(null);

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

    // Thêm các event listener mới
    socket.on('participant-joined', (data: ParticipantData) => {
      console.log('👥 Người tham gia mới:', data);
      setParticipants(prev => [...prev, data]);
    });

    socket.on('participant-left', (data: ParticipantData) => {
      console.log('❌ Người tham gia rời đi:', data);
      setParticipants(prev => prev.filter(p => p.userId !== data.userId));
    });

    socket.on('participant-ready', (data: ParticipantData) => {
      console.log('✅ Người tham gia sẵn sàng:', data);
      setParticipants(prev => 
        prev.map(p => p.userId === data.userId ? {...p, ready: true} : p)
      );
    });

    socket.on('session-started', (data: { sessionId: string; timestamp: string }) => {
      console.log('🚀 Phiên bắt đầu:', data);
      // Xử lý khi phiên bắt đầu
    });

    socket.on('session-ended', (data: { sessionId: string; timestamp: string }) => {
      console.log('🏁 Phiên kết thúc:', data);
      // Xử lý khi phiên kết thúc
    });

    // Thêm các event listeners cho question control
    socket.on('question-started', (data: QuestionStartData) => {
      console.log('📝 Câu hỏi bắt đầu:', data);
    });

    socket.on('question-ended', (data: QuestionEndData) => {
      console.log('✅ Câu hỏi kết thúc:', data);
    });

    socket.on('answer-submitted', (data: { userId: string; questionId: string; answer: string }) => {
      console.log('📝 Có câu trả lời mới:', data);
    });

    socket.on('pong', () => {
      // Xử lý phản hồi ping - không log để tránh spam
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
  }, [sessionId, role, token, autoConnect]);

  // Thêm các hàm mới
  const markReady = () => {
    socketRef.current?.emit('ready');
  };

  const markNotReady = () => {
    socketRef.current?.emit('not-ready');
  };

  const startSession = () => {
    socketRef.current?.emit('start-session');
  };

  const endSession = () => {
    socketRef.current?.emit('end-session');
  };

  // Bổ sung các methods thiếu
  const startQuestion = (data: QuestionStartData) => {
    console.log('📤 Starting question:', data);
    socketRef.current?.emit('start-question', {
      sessionId,
      ...data
    });
  };

  const endQuestion = (data: QuestionEndData) => {
    console.log('📤 Ending question:', data);
    socketRef.current?.emit('end-question', {
      sessionId,
      ...data
    });
  };

  const sendPing = () => {
    socketRef.current?.emit('ping', {
      sessionId,
      timestamp: new Date().toISOString()
    });
  };

  return {
    socket: socketRef.current,
    isConnected,
    error,
    testMessage,
    participants,
    markReady,
    markNotReady,
    startSession,
    endSession,
    startQuestion,
    endQuestion,
    sendPing
  };
};
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

export const useSocket = ({ sessionId, role, token, autoConnect = true }: UseSocketOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testMessage, setTestMessage] = useState<string>('');
  const [participants, setParticipants] = useState<any[]>([]);
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
    socket.on('participant-joined', (data) => {
      console.log('👥 Người tham gia mới:', data);
      setParticipants(prev => [...prev, data]);
    });

    socket.on('participant-left', (data) => {
      console.log('❌ Người tham gia rời đi:', data);
      setParticipants(prev => prev.filter(p => p.userId !== data.userId));
    });

    socket.on('participant-ready', (data) => {
      console.log('✅ Người tham gia sẵn sàng:', data);
      setParticipants(prev => 
        prev.map(p => p.userId === data.userId ? {...p, ready: true} : p)
      );
    });

    socket.on('session-started', (data) => {
      console.log('🚀 Phiên bắt đầu:', data);
      // Xử lý khi phiên bắt đầu
    });

    socket.on('session-ended', (data) => {
      console.log('🏁 Phiên kết thúc:', data);
      // Xử lý khi phiên kết thúc
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

  return {
    socket: socketRef.current,
    isConnected,
    error,
    testMessage,
    participants,
    markReady,
    markNotReady,
    startSession,
    endSession
  };
};
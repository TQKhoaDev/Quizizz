import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { sessionApi } from '../api/sessionApi';
import type { Session } from '../api/sessionApi';
import { useSocket } from '@/hooks';
import { 
  Wifi, 
  WifiOff, 
  Users,
  Timer,
  CheckCircle,
  Clock,
  UserCheck,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

// Interface cho participant từ socket (khác với API)
interface SocketParticipant {
  userId: string;
  fullName: string;
  role: 'PROCTOR' | 'STUDENT' | 'ADMIN';
  isGuest: boolean;
  ready: boolean;
  timestamp: string;
  isOnline: boolean;
}

const WaitingRoom: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUserReady, setIsUserReady] = useState(false);

  const { 
    isConnected, 
    error: socketError, 
    participants: socketParticipants,
    connectionStats,
    recentActivity,
    markReady,
    markNotReady,
    syncParticipants
  } = useSocket({
    sessionId: sessionId || '',
    role: 'STUDENT',
    token: localStorage.getItem('token') || ''
  });

  // Thêm log để debug
  useEffect(() => {
    console.log('🔍 [WAITING] Socket state:', { 
      isConnected, 
      socketError, 
      participantsCount: socketParticipants.length,
      connectionStats 
    });
  }, [isConnected, socketError, socketParticipants.length, connectionStats]);

  // Hiển thị trạng thái kết nối
  useEffect(() => {
    if (!isConnected) {
      setError('Mất kết nối với máy chủ');
    } else {
      setError(null);
    }
  }, [isConnected]);

  // Hiển thị lỗi socket
  useEffect(() => {
    if (socketError) {
      setError(socketError);
    }
  }, [socketError]);

  const fetchSession = useCallback(async () => {
    if (!sessionId) return;
    
    try {
      setIsLoading(true);
      const response = await sessionApi.getSessionById(sessionId);
      
      if (response) {
        // Chỉ lấy thông tin cơ bản của session, participants sẽ được lấy từ socket
        const formattedSession: Session = {
          ...response,
          participants: [] // Sẽ sử dụng socketParticipants thay thế
        };
        
        console.log("✅ [WAITING] Session loaded:", formattedSession?.quiz?.title);
        setSession(formattedSession);
        setError(null);
      } else {
        setError("Không tìm thấy phiên");
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      setError('Không thể tải thông tin phiên');
      console.error('❌ [WAITING] Error loading session:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  // Gọi fetchSession khi component mount
  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  // Handler cho nút sẵn sàng
  const handleToggleReady = useCallback(() => {
    if (isUserReady) {
      markNotReady();
      setIsUserReady(false);
    } else {
      markReady();
      setIsUserReady(true);
    }
  }, [isUserReady, markReady, markNotReady]);

  // Hiệu ứng cho container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  // Hiệu ứng cho avatar
  const avatarVariants = {
    hidden: { y: 20, opacity: 0, scale: 0.8 },
    visible: { 
      y: 0, 
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    },
    exit: {
      y: -20,
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.3
      }
    },
    hover: { 
      scale: 1.1,
      rotate: [0, -5, 5, -5, 0],
      transition: {
        duration: 0.5
      }
    }
  };

  // Hàm tạo màu ngẫu nhiên cho background avatar
  const getRandomPastelColor = (seed: string) => {
    const colors = [
      'bg-pink-200', 'bg-purple-200', 'bg-blue-200', 
      'bg-green-200', 'bg-yellow-200', 'bg-red-200',
      'bg-indigo-200', 'bg-teal-200', 'bg-orange-200'
    ];
    
    const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  // Tạo biểu tượng động vật dễ thương cho người tham gia
  const getAnimalEmoji = (userId: string) => {
    const animals = ['🐶', '🐱', '🐰', '🦊', '🐻', '🐼', '🐨', '🦁', '🐯', '🦄', '🐸', '🦘', '🐮', '🐗', '🐷', '🦍'];
    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return animals[hash % animals.length];
  };

  // Nếu không có session, hiển thị trạng thái loading đẹp mắt
  if (isLoading || !session) {
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
              Đang tải phòng chờ...
            </motion.h2>
            
            <motion.div
              className="flex space-x-2 mt-4"
              animate={{
                scale: [1, 1.05, 1]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity
              }}
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                className="w-3 h-3 bg-purple-500 rounded-full"
              />
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                className="w-3 h-3 bg-purple-500 rounded-full"
              />
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                className="w-3 h-3 bg-purple-500 rounded-full"
              />
            </motion.div>
          </div>
        </Card>
      </div>
    );
  }

  // Nếu có lỗi, hiển thị thông báo lỗi
  if (error) {
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
              {error}
            </h2>
            <div className="flex gap-3">
              <Button onClick={fetchSession} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Thử lại
              </Button>
              <Button onClick={syncParticipants} variant="outline">
                <Users className="w-4 h-4 mr-2" />
                Đồng bộ
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-4 md:p-8">
      <Card className="max-w-4xl mx-auto p-6 md:p-8 bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl">
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-4"
          >
            <span className="text-4xl">🎮</span>
          </motion.div>
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-3xl font-bold text-purple-800 mb-2"
          >
            Phòng chờ Quiz
          </motion.h1>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-lg font-medium text-gray-700 mb-1">
              {session.quiz?.title || "Đang tải..."}
            </p>
            <p className="text-sm text-purple-600 font-medium">
              {session.quiz?.description || ""}
            </p>
          </motion.div>
        </div>

        {/* Hiển thị trạng thái kết nối realtime */}
        <div className="text-center mb-6">
          <motion.div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
              isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
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
            <span>{isConnected ? 'Kết nối realtime' : 'Mất kết nối'}</span>
          </motion.div>
        </div>

        {/* Thống kê realtime */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="text-center">
              <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <motion.p 
                className="text-2xl font-bold text-blue-800"
                key={connectionStats.totalParticipants}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.3 }}
              >
                {connectionStats.totalParticipants}
              </motion.p>
              <p className="text-xs text-blue-600">Tổng số</p>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100">
            <div className="text-center">
              <UserCheck className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <motion.p 
                className="text-2xl font-bold text-green-800"
                key={connectionStats.readyParticipants}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.3 }}
              >
                {connectionStats.readyParticipants}
              </motion.p>
              <p className="text-xs text-green-600">Sẵn sàng</p>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100">
            <div className="text-center">
              <Wifi className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <motion.p 
                className="text-2xl font-bold text-purple-800"
                key={connectionStats.onlineParticipants}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.3 }}
              >
                {connectionStats.onlineParticipants}
              </motion.p>
              <p className="text-xs text-purple-600">Online</p>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100">
            <div className="text-center">
              <Timer className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <motion.p 
                className="text-2xl font-bold text-orange-800"
                key={connectionStats.readyParticipants}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.3 }}
              >
                {connectionStats.totalParticipants > 0 
                  ? Math.round((connectionStats.readyParticipants / connectionStats.totalParticipants) * 100) 
                  : 0}%
              </motion.p>
              <p className="text-xs text-orange-600">Sẵn sàng</p>
            </div>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        {recentActivity && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400"
          >
            <p className="text-sm text-blue-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {recentActivity}
            </p>
          </motion.div>
        )}

        {/* Danh sách người tham gia realtime */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8"
        >
          <AnimatePresence mode="popLayout">
            {socketParticipants && socketParticipants.length > 0 ? (
              socketParticipants.map((participant: SocketParticipant) => (
                <motion.div
                  key={participant.userId}
                  variants={avatarVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  whileHover="hover"
                  layout
                  className="flex flex-col items-center"
                >
                  <div className="relative">
                    <motion.div 
                      className={`w-20 h-20 md:w-24 md:h-24 mb-2 rounded-full border-4 ${
                        participant.ready ? 'border-green-400' : 'border-gray-300'
                      } shadow-md flex items-center justify-center ${getRandomPastelColor(participant.userId)}`}
                      animate={participant.ready ? {
                        borderColor: ['#10b981', '#34d399', '#10b981'],
                        boxShadow: [
                          '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          '0 10px 15px -3px rgba(16, 185, 129, 0.3)',
                          '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        ]
                      } : {}}
                      transition={{
                        duration: 2,
                        repeat: participant.ready ? Infinity : 0
                      }}
                    >
                      <span className="text-4xl md:text-5xl transform hover:scale-110 transition-transform duration-300">
                        {getAnimalEmoji(participant.userId)}
                      </span>
                    </motion.div>
                    
                    {/* Status indicator */}
                    <motion.div
                      className={`absolute -top-2 -right-2 w-8 h-8 flex items-center justify-center rounded-full shadow-sm ${
                        participant.ready ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                      animate={participant.ready ? {
                        scale: [1, 1.2, 1],
                      } : {}}
                      transition={{
                        duration: 2,
                        repeat: participant.ready ? Infinity : 0
                      }}
                    >
                      {participant.ready ? (
                        <CheckCircle className="w-5 h-5 text-white" />
                      ) : (
                        <Clock className="w-4 h-4 text-gray-600" />
                      )}
                    </motion.div>

                    {/* Online indicator */}
                    <motion.div 
                      className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                        participant.isOnline ? 'bg-green-400' : 'bg-gray-400'
                      }`}
                      animate={participant.isOnline ? {
                        opacity: [1, 0.5, 1]
                      } : {}}
                      transition={{
                        duration: 2,
                        repeat: Infinity
                      }}
                    />
                  </div>
                  
                  <p className="text-sm font-medium text-gray-700 text-center max-w-[100px] truncate">
                    {participant.fullName}
                  </p>
                  
                  <div className="flex items-center gap-1 mt-1">
                    {participant.isGuest && (
                      <Badge variant="secondary" className="text-xs">Khách</Badge>
                    )}
                    {participant.role === 'PROCTOR' && (
                      <Badge variant="default" className="text-xs">GV</Badge>
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div 
                className="col-span-full text-center py-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">Chưa có người tham gia nào</p>
                <p className="text-sm text-purple-600">Họ sẽ xuất hiện ở đây khi tham gia!</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Thông tin phòng */}
        <motion.div 
          className="text-center space-y-4 bg-purple-50 p-4 rounded-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-center gap-2 text-purple-800">
            <span className="font-medium">Mã phòng:</span>
            <span className="font-mono font-bold bg-white px-2 py-1 rounded-md">
              {session.code}
            </span>
          </div>
          <p className="text-gray-600 flex items-center justify-center gap-2">
            <span>Đang chờ bắt đầu</span>
            <motion.span 
              animate={{
                opacity: [0, 1, 0],
                transition: { repeat: Infinity, duration: 1.5 }
              }}
            >
              ⏳
            </motion.span>
          </p>
        </motion.div>

        {/* Nút điều khiển */}
        <motion.div 
          className="flex justify-center mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            onClick={handleToggleReady}
            disabled={!isConnected}
            size="lg"
            className={`px-8 py-3 text-lg font-semibold transition-all duration-300 ${
              isUserReady 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isUserReady ? (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Đã sẵn sàng
              </>
            ) : (
              <>
                <Clock className="w-5 h-5 mr-2" />
                Đánh dấu sẵn sàng
              </>
            )}
          </Button>
        </motion.div>
      </Card>
    </div>
  );
};

export default WaitingRoom; 
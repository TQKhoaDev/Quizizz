import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { sessionApi } from '../api/sessionApi';
import type { Session, Participant } from '../api/sessionApi';

const WaitingRoom: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  console.log("sessionId param", sessionId);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lấy danh sách người tham gia
  useEffect(() => {
    console.log("session", session);
    if (session?.participants && Array.isArray(session.participants)) {
      console.log("Người tham gia:", session.participants);
      setParticipants(session.participants);
    } else {
      console.log("Không có danh sách người tham gia hoặc không phải mảng");
    }
  }, [session]);

  const fetchSession = useCallback(async () => {
    if (!sessionId) return;
    
    try {
      setIsLoading(true);
      const response = await sessionApi.getSessionById(sessionId);
      console.log("response", response);
      // Xử lý dữ liệu từ API
      if (response) {
        // Chuyển đổi cấu trúc dữ liệu nếu cần
        const formattedSession: Session = {
          ...response,
          // Đảm bảo có trường participants nếu không có
          participants: response.participants || []
        };
        
        console.log("Dữ liệu phiên đã xử lý:", formattedSession);
        setSession(formattedSession);
        setError(null);
      } else {
        console.log("Không có dữ liệu phiên");
        setError("Không tìm thấy phiên");
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      setError('Không thể tải thông tin phiên');
      console.error('Lỗi khi tải phiên:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  // Gọi fetchSession khi component mount
  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

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
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    },
    hover: { 
      scale: 1.1,
      rotate: [0, -10, 10, -10, 0],
      transition: {
        duration: 0.5
      }
    }
  };

  // Hiệu ứng hoạt hình cho văn bản đợi
  const loadingDots = {
    hidden: { opacity: 0 },
    visible: {
      opacity: [0, 1, 0],
      transition: {
        repeat: Infinity,
        duration: 1.5
      }
    }
  };

  // Hàm tạo màu ngẫu nhiên cho background avatar
  const getRandomPastelColor = (seed: string) => {
    const colors = [
      'bg-pink-200', 'bg-purple-200', 'bg-blue-200', 
      'bg-green-200', 'bg-yellow-200', 'bg-red-200',
      'bg-indigo-200', 'bg-teal-200'
    ];
    
    // Sử dụng string hash để chọn màu nhất quán dựa trên id
    const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  // Tạo biểu tượng động vật dễ thương cho người tham gia
  const getAnimalEmoji = () => {
    const animals = ['🐶', '🐱', '🐰', '🦊', '🐻', '🐼', '🐨', '🦁', '🐯', '🦄', '🐸', '🦘', '🐮', '🐗', '🐷', '🦍'];
    const randomIndex = Math.floor(Math.random() * animals.length);
    return animals[randomIndex];
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
              Không thể tải dữ liệu phòng chờ
            </h2>
            <p className="text-gray-600 mb-6">
              {error}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Thử lại
            </button>
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

        {/* Danh sách người tham gia */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8"
        >
          {participants && participants.length > 0 ? (
            participants.map((participant, index) => (
              <motion.div
                key={participant.id || index}
                variants={avatarVariants}
                whileHover="hover"
                custom={index}
                className="flex flex-col items-center"
              >
                <div className="relative">
                  <div className={`w-20 h-20 md:w-24 md:h-24 mb-2 rounded-full border-4 border-white shadow-md flex items-center justify-center ${getRandomPastelColor(participant.id || index.toString())}`}>
                    <span className="text-4xl md:text-5xl transform hover:scale-110 transition-transform duration-300">
                      {getAnimalEmoji()}
                    </span>
                  </div>
                  <motion.div
                    className="absolute -top-2 -right-2 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-sm"
                    animate={{
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  >
                    <span className="text-lg">⭐</span>
                  </motion.div>
                </div>
                <p className="text-sm font-medium text-gray-700 text-center max-w-[100px] truncate">
                  {participant.user.fullName || "Người tham gia"}
                </p>
                {/* {participant.user.isGuest && (
                  <span className="text-xs text-purple-600 px-2 py-0.5 bg-purple-100 rounded-full">Khách</span>
                )} */}
              </motion.div>
            ))
          ) : (
            <motion.div 
              className="col-span-full text-center py-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-gray-500 mb-2">Chưa có người tham gia nào</p>
              <p className="text-sm text-purple-600">Họ sẽ xuất hiện ở đây khi tham gia!</p>
            </motion.div>
          )}
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
              {session.code || session.quizId || "..."}
            </span>
            <motion.span
              variants={loadingDots}
              initial="hidden"
              animate="visible"
              className="text-lg"
            >
              ...
            </motion.span>
          </div>
          <p className="text-gray-600 flex items-center justify-center gap-2">
            <span>Đang chờ người tham gia</span>
            <motion.span 
              animate={{
                opacity: [0, 1, 0],
                transition: { repeat: Infinity, duration: 1.5 }
              }}
            >
              ⏳
            </motion.span>
            <span className="font-medium">({participants.length} người)</span>
          </p>
        </motion.div>
      </Card>
    </div>
  );
};

export default WaitingRoom; 
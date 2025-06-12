import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { sessionApi } from '../api/sessionApi';
import type { Session } from '../api/sessionApi';
import { Play, Square, Users, Clock, Award } from 'lucide-react';
import { useSocket } from '@/hooks';

const SessionControl: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const { isConnected, testMessage } = useSocket({
    sessionId: sessionId || '',
    role: 'ADMIN',
    token: localStorage.getItem('token') || '',

  });
  useEffect(() => {
    const fetchSession = async () => {
      if (!sessionId) return;
      
      try {
        setIsLoading(true);
        const response = await sessionApi.getSessionById(sessionId);
        setSession(response);
        setError(null);
      } catch (error) {
        setError('Không thể tải thông tin phiên');
        console.error('Lỗi khi tải phiên:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  const handleStartSession = async () => {
    if (!sessionId) return;
    
    try {
      setIsStarting(true);
      const updatedSession = await sessionApi.startSession(sessionId);
      setSession(updatedSession);
      // Chuyển hướng đến trang phòng quiz
      navigate(`/quiz/play/${sessionId}`);
    } catch (error) {
      setError('Không thể bắt đầu phiên');
      console.error('Lỗi khi bắt đầu phiên:', error);
    } finally {
      setIsStarting(false);
    }
  };

  const handleEndSession = async () => {
    if (!sessionId) return;
    
    try {
      const updatedSession = await sessionApi.endSession(sessionId);
      setSession(updatedSession);
      // Chuyển hướng đến trang kết quả
      navigate(`/dashboard/sessions/${sessionId}/results`);
    } catch (error) {
      setError('Không thể kết thúc phiên');
      console.error('Lỗi khi kết thúc phiên:', error);
    }
  };

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
              Đang tải thông tin phiên...
            </motion.h2>
          </div>
        </Card>
      </div>
    );
  }

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
            <Button 
              onClick={() => navigate('/dashboard/sessions')}
              className="mt-4"
            >
              Quay lại danh sách phiên
            </Button>
          </div>
        </Card>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-4 md:p-8">
       <div>
      <h2>Test Socket Connection</h2>
      <div>Trạng thái: {isConnected ? '✅ Đã kết nối' : '❌ Chưa kết nối'}</div>
      {error && <div style={{ color: 'red' }}>Lỗi: {error}</div>}
      {testMessage && <div>Tin nhắn test: {testMessage}</div>}
      

    </div>
      <Card className="max-w-4xl mx-auto p-6 md:p-8 bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl">
        {/* Header */}
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
            Điều Khiển Phiên Quiz
          </motion.h1>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-lg font-medium text-gray-700 mb-1">
              {session.quiz?.title}
            </p>
            <p className="text-sm text-purple-600 font-medium">
              {session.quiz?.description}
            </p>
          </motion.div>
        </div>

        {/* Thống kê */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-4 bg-purple-50">
            <div className="flex items-center space-x-3">
              <Users className="w-6 h-6 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Người tham gia</p>
                <p className="text-xl font-bold text-purple-800">
                  {session.participants?.length || 0}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-blue-50">
            <div className="flex items-center space-x-3">
              <Clock className="w-6 h-6 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Trạng thái</p>
                <p className="text-xl font-bold text-blue-800">
                  {session.status === 'PENDING' ? 'Chờ bắt đầu' : 
                   session.status === 'ACTIVE' ? 'Đang diễn ra' : 
                   session.status === 'ENDED' ? 'Đã kết thúc' : 'Đã hủy'}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-green-50">
            <div className="flex items-center space-x-3">
              <Award className="w-6 h-6 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Mã phiên</p>
                <p className="text-xl font-bold text-green-800">
                  {session.code}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Danh sách người tham gia */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Danh sách người tham gia</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {session.participants?.map((participant) => (
              <Card key={participant.id} className="p-4 bg-white">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="text-xl">
                      {(participant.user?.fullName || '?').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      {participant.user?.fullName || 'Người dùng ẩn danh'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {participant.user?.isGuest ? 'Khách' : 'Thành viên'}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Nút điều khiển */}
        <div className="flex justify-center space-x-4">
          {session.status === 'PENDING' && (
            <Button
              size="lg"
              onClick={handleStartSession}
              disabled={isStarting}
              className="bg-green-600 hover:bg-green-700"
            >
              <Play className="w-5 h-5 mr-2" />
              {isStarting ? 'Đang bắt đầu...' : 'Bắt đầu phiên'}
            </Button>
          )}
          {session.status === 'ACTIVE' && (
            <Button
              size="lg"
              onClick={handleEndSession}
              className="bg-red-600 hover:bg-red-700"
            >
              <Square className="w-5 h-5 mr-2" />
              Kết thúc phiên
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default SessionControl; 
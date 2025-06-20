import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, UserMinus, Wifi, WifiOff } from 'lucide-react';
import { useSocket } from '@/hooks';

interface RealTimeTestProps {
  sessionId: string;
}

const RealTimeTest: React.FC<RealTimeTestProps> = ({ sessionId }) => {
  const [logs, setLogs] = useState<string[]>([]);
  
  const { 
    isConnected, 
    participants, 
    socket,
    error: socketError 
  } = useSocket({
    sessionId,
    role: 'PROCTOR',
    token: localStorage.getItem('token') || ''
  });

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('vi-VN');
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 19)]);
  };

  useEffect(() => {
    if (isConnected) {
      addLog('✅ Kết nối WebSocket thành công');
    } else {
      addLog('❌ Mất kết nối WebSocket');
    }
  }, [isConnected]);

  useEffect(() => {
    addLog(`👥 Participants updated: ${participants.length} người`);
  }, [participants.length]);

  useEffect(() => {
    if (!socket) return;

    const handleParticipantJoined = (data: any) => {
      addLog(`🔵 ${data.fullName} đã tham gia (${data.role})`);
    };

    const handleParticipantLeft = (data: any) => {
      addLog(`🔴 ${data.fullName} đã rời khỏi phòng`);
    };

    const handleParticipantReady = (data: any) => {
      addLog(`✅ ${data.fullName} đã sẵn sàng`);
    };

    const handleParticipantNotReady = (data: any) => {
      addLog(`⏳ ${data.fullName} chưa sẵn sàng`);
    };

    socket.on('participant-joined', handleParticipantJoined);
    socket.on('participant-left', handleParticipantLeft);
    socket.on('participant-ready', handleParticipantReady);
    socket.on('participant-not-ready', handleParticipantNotReady);

    return () => {
      socket.off('participant-joined', handleParticipantJoined);
      socket.off('participant-left', handleParticipantLeft);
      socket.off('participant-ready', handleParticipantReady);
      socket.off('participant-not-ready', handleParticipantNotReady);
    };
  }, [socket]);

  const simulateJoin = () => {
    if (socket) {
      const mockUser = {
        userId: `test-${Date.now()}`,
        fullName: `Test User ${Math.floor(Math.random() * 100)}`,
        role: 'STUDENT',
        isGuest: true
      };
      socket.emit('test-join', mockUser);
      addLog(`📤 Gửi test join: ${mockUser.fullName}`);
    }
  };

  const clearLogs = () => setLogs([]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🧪</span>
            <div>
              <h2 className="text-lg font-semibold">Real-time Test Console</h2>
              <p className="text-sm text-gray-600">Session ID: {sessionId}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <motion.div 
              className={`flex items-center gap-2 px-3 py-1 rounded-lg ${
                isConnected 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}
              animate={isConnected ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
              <span className="text-sm font-medium">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </motion.div>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{participants.length}</div>
            <div className="text-sm text-gray-600">Tổng participants</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {participants.filter(p => p.ready).length}
            </div>
            <div className="text-sm text-gray-600">Đã sẵn sàng</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {participants.filter(p => p.isOnline).length}
            </div>
            <div className="text-sm text-gray-600">Online</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {participants.length > 0 
                ? Math.round((participants.filter(p => p.ready).length / participants.length) * 100)
                : 0}%
            </div>
            <div className="text-sm text-gray-600">% Sẵn sàng</div>
          </div>
        </div>
      </Card>

      {/* Controls */}
      <Card className="p-4">
        <div className="flex gap-3">
          <Button onClick={simulateJoin} disabled={!isConnected}>
            <UserPlus className="w-4 h-4 mr-2" />
            Simulate Join
          </Button>
          <Button onClick={clearLogs} variant="outline">
            Clear Logs
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Participants List */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Participants ({participants.length})
          </h3>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            <AnimatePresence>
              {participants.map((participant) => (
                <motion.div
                  key={participant.userId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      participant.ready ? 'bg-green-500' : 'bg-gray-400'
                    }`}>
                      {participant.fullName.charAt(0)}
                    </div>
                    <span className="text-sm font-medium">{participant.fullName}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant={participant.isGuest ? 'secondary' : 'outline'} className="text-xs">
                      {participant.role}
                    </Badge>
                    <div className={`w-2 h-2 rounded-full ${
                      participant.isOnline ? 'bg-green-400' : 'bg-gray-400'
                    }`} />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          
          {participants.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Chưa có participants</p>
            </div>
          )}
        </Card>

        {/* Event Logs */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Event Logs</h3>
          
          <div className="bg-black text-green-400 p-3 rounded-lg font-mono text-xs space-y-1 max-h-64 overflow-y-auto">
            <AnimatePresence>
              {logs.map((log, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="whitespace-pre-wrap"
                >
                  {log}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          
          {logs.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>Không có logs</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default RealTimeTest; 
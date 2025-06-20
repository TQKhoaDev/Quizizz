import React from 'react';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Clock, 
  Users, 
  Wifi, 
  WifiOff,
  Monitor,
  CheckCircle,
  AlertCircle,
  Timer,
  TrendingUp
} from 'lucide-react';
import type { SessionRealtimeStatus } from '../types';

interface SessionStatusDashboardProps {
  realtimeStatus: SessionRealtimeStatus;
  isConnected: boolean;
}

const SessionStatusDashboard: React.FC<SessionStatusDashboardProps> = ({
  realtimeStatus,
  isConnected
}) => {
  // Format uptime từ giây thành MM:SS hoặc HH:MM:SS
  const formatUptime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Lấy màu status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'WAITING_NEXT_QUESTION':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ENDED':
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'CANCELED':
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Lấy icon status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4" />;
      case 'ACTIVE':
        return <Activity className="w-4 h-4" />;
      case 'WAITING_NEXT_QUESTION':
        return <Timer className="w-4 h-4" />;
      case 'ENDED':
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4" />;
      case 'CANCELED':
      case 'CANCELLED':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <Card className="p-4 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-2 border-blue-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Trạng thái Realtime
        </h3>
        
        <div className="flex items-center gap-3">
          {/* Connection Status */}
          <motion.div 
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
              isConnected 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'bg-red-100 text-red-700 border border-red-200'
            }`}
            animate={isConnected ? {
              scale: [1, 1.05, 1]
            } : {}}
            transition={{
              duration: 2,
              repeat: isConnected ? Infinity : 0
            }}
          >
            {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {isConnected ? 'Kết nối' : 'Mất kết nối'}
          </motion.div>

          {/* Last Updated */}
          <div className="text-xs text-gray-500">
            Cập nhật: {new Date(realtimeStatus.lastUpdated).toLocaleTimeString('vi-VN')}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status */}
        <div className="space-y-2">
          <div className="text-xs text-gray-500 font-medium">Trạng thái phiên</div>
          <motion.div 
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${getStatusColor(realtimeStatus.status)}`}
            key={realtimeStatus.status}
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 0.3 }}
          >
            {getStatusIcon(realtimeStatus.status)}
            <span className="text-sm font-medium">
              {realtimeStatus.status === 'PENDING' ? 'Chờ bắt đầu' : 
               realtimeStatus.status === 'ACTIVE' ? 'Đang diễn ra' : 
               realtimeStatus.status === 'WAITING_NEXT_QUESTION' ? 'Chờ câu hỏi' :
               realtimeStatus.status === 'ENDED' || realtimeStatus.status === 'COMPLETED' ? 'Đã kết thúc' : 
               realtimeStatus.status === 'CANCELED' ? 'Đã hủy' : 
               realtimeStatus.status}
            </span>
          </motion.div>
        </div>

        {/* Participants */}
        <div className="space-y-2">
          <div className="text-xs text-gray-500 font-medium">Người tham gia</div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <motion.span 
              className="text-lg font-bold text-blue-800"
              key={realtimeStatus.participantCount}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.3 }}
            >
              {realtimeStatus.participantCount}
            </motion.span>
            <span className="text-sm text-gray-600">
              ({realtimeStatus.activeParticipants} hoạt động)
            </span>
          </div>
        </div>

        {/* Uptime */}
        <div className="space-y-2">
          <div className="text-xs text-gray-500 font-medium">Thời gian hoạt động</div>
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4 text-purple-600" />
            <motion.span 
              className="text-lg font-bold text-purple-800 font-mono"
              key={realtimeStatus.uptime}
              animate={realtimeStatus.status === 'ACTIVE' ? {
                scale: [1, 1.05, 1]
              } : {}}
              transition={{ duration: 1 }}
            >
              {formatUptime(realtimeStatus.uptime)}
            </motion.span>
          </div>
        </div>

        {/* Current Activity */}
        <div className="space-y-2">
          <div className="text-xs text-gray-500 font-medium">Hoạt động hiện tại</div>
          <motion.div 
            className="flex items-center gap-2 text-sm text-gray-700"
            key={realtimeStatus.currentActivity}
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Activity className="w-4 h-4 text-orange-500" />
            <span className="truncate">
              {realtimeStatus.currentActivity}
            </span>
          </motion.div>
        </div>
      </div>

      {/* Activity Timeline (Optional) */}
      {realtimeStatus.status === 'ACTIVE' && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <motion.div 
            className="flex items-center gap-2 text-xs text-green-600"
            animate={{
              opacity: [1, 0.6, 1]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity
            }}
          >
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Phiên đang hoạt động - Dữ liệu được cập nhật realtime</span>
          </motion.div>
        </div>
      )}
    </Card>
  );
};

export default SessionStatusDashboard; 
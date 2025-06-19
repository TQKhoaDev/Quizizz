import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { 
  Users, 
  UserCheck, 
  Monitor,
  TrendingUp
} from 'lucide-react';
import type { SessionStats } from '../types/sessionControl';

/**
 * Props cho SessionStats component
 */
interface SessionStatsProps {
  /** Dữ liệu thống kê session */
  stats: SessionStats;
  /** Animation delay cho stagger effect */
  animationDelay?: number;
}

/**
 * Interface cho từng item thống kê
 */
interface StatItem {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: {
    bg: string;
    text: string;
    icon: string;
  };
  formatter?: (value: number) => string;
}

/**
 * Component hiển thị thống kê realtime của session
 * Bao gồm số người tham gia, sẵn sàng, online và phần trăm sẵn sàng
 */
const SessionStats: React.FC<SessionStatsProps> = ({
  stats,
  animationDelay = 0
}) => {
  
  /**
   * Cấu hình các item thống kê với màu sắc và icons
   */
  const statItems: StatItem[] = [
    {
      label: 'Tổng người tham gia',
      value: stats.totalParticipants,
      icon: Users,
      color: {
        bg: 'from-blue-50 to-blue-100',
        text: 'text-blue-800',
        icon: 'text-blue-600'
      }
    },
    {
      label: 'Đã sẵn sàng',
      value: stats.readyParticipants,
      icon: UserCheck,
      color: {
        bg: 'from-green-50 to-green-100',
        text: 'text-green-800',
        icon: 'text-green-600'
      }
    },
    {
      label: 'Đang online',
      value: stats.onlineParticipants,
      icon: Monitor,
      color: {
        bg: 'from-purple-50 to-purple-100',
        text: 'text-purple-800',
        icon: 'text-purple-600'
      }
    },
    {
      label: '% Sẵn sàng',
      value: stats.readyPercentage,
      icon: TrendingUp,
      color: {
        bg: 'from-orange-50 to-orange-100',
        text: 'text-orange-800',
        icon: 'text-orange-600'
      },
      formatter: (value: number) => `${value}%`
    }
  ];

  /**
   * Render circular progress cho phần trăm sẵn sàng
   */
  const renderCircularProgress = (percentage: number) => {
    const strokeDasharray = 2 * Math.PI * 12; // radius = 12
    const strokeDashoffset = strokeDasharray - (strokeDasharray * percentage) / 100;

    return (
      <div className="relative w-8 h-8">
        <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 32 32">
          {/* Background circle */}
          <circle
            cx="16"
            cy="16"
            r="12"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            className="text-orange-200"
          />
          {/* Progress circle */}
          <motion.circle
            cx="16"
            cy="16"
            r="12"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            className="text-orange-600"
            strokeLinecap="round"
            initial={{ strokeDasharray, strokeDashoffset: strokeDasharray }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "easeInOut" }}
            style={{ strokeDasharray }}
          />
        </svg>
        {/* Percentage text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-orange-800">
            {percentage}
          </span>
        </div>
      </div>
    );
  };

  /**
   * Render một item thống kê
   */
  const renderStatItem = (item: StatItem, index: number) => {
    const IconComponent = item.icon;
    const displayValue = item.formatter ? item.formatter(item.value) : item.value;
    
    return (
      <motion.div
        key={item.label}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.6, 
          delay: animationDelay + (index * 0.1),
          type: "spring",
          stiffness: 260,
          damping: 20
        }}
      >
        <Card className={`p-4 bg-gradient-to-br ${item.color.bg} border-0 shadow-md hover:shadow-lg transition-shadow duration-300`}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className={`text-sm font-medium ${item.color.icon} mb-1`}>
                {item.label}
              </p>
              <motion.p 
                className={`text-2xl font-bold ${item.color.text}`}
                key={item.value} // Key để trigger animation khi value thay đổi
                animate={{ 
                  scale: [1, 1.2, 1],
                  color: item.value > 0 ? item.color.text : '#6B7280'
                }}
                transition={{ duration: 0.3 }}
              >
                {displayValue}
              </motion.p>
            </div>
            
            <div className="ml-3">
              {item.label === '% Sẵn sàng' ? (
                renderCircularProgress(item.value)
              ) : (
                <motion.div
                  animate={item.value > 0 ? {
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  } : {}}
                  transition={{ 
                    duration: 2, 
                    repeat: item.value > 0 ? Infinity : 0,
                    repeatType: "reverse"
                  }}
                >
                  <IconComponent className={`w-8 h-8 ${item.color.icon}`} />
                </motion.div>
              )}
            </div>
          </div>

          {/* Progress bar cho một số metrics */}
          {(item.label === 'Đã sẵn sàng' || item.label === 'Đang online') && stats.totalParticipants > 0 && (
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <motion.div 
                  className={`h-1.5 rounded-full ${
                    item.label === 'Đã sẵn sàng' ? 'bg-green-500' : 'bg-purple-500'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${(item.value / stats.totalParticipants) * 100}%` 
                  }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {item.value} / {stats.totalParticipants}
              </p>
            </div>
          )}
        </Card>
      </motion.div>
    );
  };

  /**
   * Render thông báo khi tất cả đã sẵn sàng
   */
  const renderAllReadyNotification = () => {
    if (stats.readyPercentage === 100 && stats.totalParticipants > 0) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-4"
        >
          <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 360]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                className="text-2xl"
              >
                🎉
              </motion.div>
              <div>
                <p className="font-semibold text-green-800">
                  Tuyệt vời! Tất cả đã sẵn sàng
                </p>
                <p className="text-sm text-green-600">
                  Có thể bắt đầu phiên quiz ngay bây giờ
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      );
    }
    return null;
  };

  return (
    <div>
      {/* Grid thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statItems.map((item, index) => renderStatItem(item, index))}
      </div>

      {/* Notification khi tất cả sẵn sàng */}
      {renderAllReadyNotification()}

      {/* Summary text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-4 text-center"
      >
        <p className="text-sm text-gray-600">
          {stats.totalParticipants === 0 ? (
            'Chưa có người tham gia nào'
          ) : stats.readyPercentage === 100 ? (
            `Tất cả ${stats.totalParticipants} người tham gia đã sẵn sàng! 🚀`
          ) : (
            `${stats.readyParticipants} / ${stats.totalParticipants} người đã sẵn sàng (${stats.readyPercentage}%)`
          )}
        </p>
      </motion.div>
    </div>
  );
};

export default SessionStats;
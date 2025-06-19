import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Filter,
  Users,
  UserCheck,
  User,
  Shield,
  Clock,
  Wifi,
  WifiOff,
  Eye,
  EyeOff,
  MoreVertical,
  MessageSquare
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { DisplayParticipant, UserRole } from '../types/sessionControl';

/**
 * Props cho ParticipantsList component
 */
interface ParticipantsListProps {
  /** Danh sách người tham gia */
  participants: DisplayParticipant[];
  /** Có hiển thị chi tiết không */
  showDetails: boolean;
  /** Toggle hiển thị chi tiết */
  onToggleDetails: () => void;
  /** Callback khi click vào participant */
  onParticipantClick?: (participant: DisplayParticipant) => void;
}

/**
 * Filter options cho participants
 */
type FilterType = 'ALL' | 'ONLINE' | 'READY' | 'OFFLINE' | 'NOT_READY';

/**
 * Component hiển thị danh sách người tham gia realtime
 * Bao gồm search, filter và hiển thị thông tin chi tiết
 */
const ParticipantsList: React.FC<ParticipantsListProps> = ({
  participants,
  showDetails,
  onToggleDetails,
  onParticipantClick
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'joinTime' | 'role'>('name');

  /**
   * Filter và search participants
   */
  const filteredParticipants = useMemo(() => {
    let filtered = participants;

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(p => 
        p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    switch (filterType) {
      case 'ONLINE':
        filtered = filtered.filter(p => p.isOnline);
        break;
      case 'OFFLINE':
        filtered = filtered.filter(p => !p.isOnline);
        break;
      case 'READY':
        filtered = filtered.filter(p => p.ready);
        break;
      case 'NOT_READY':
        filtered = filtered.filter(p => !p.ready);
        break;
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.fullName.localeCompare(b.fullName);
        case 'joinTime':
          return new Date(b.joinTime).getTime() - new Date(a.joinTime).getTime();
        case 'role':
          return a.role.localeCompare(b.role);
        default:
          return 0;
      }
    });

    return filtered;
  }, [participants, searchTerm, filterType, sortBy]);

  /**
   * Get role display info
   */
  const getRoleInfo = (role: UserRole) => {
    switch (role) {
      case 'PROCTOR':
        return { label: 'Giám thị', color: 'bg-purple-100 text-purple-800', icon: Shield };
      case 'STUDENT':
        return { label: 'Học sinh', color: 'bg-blue-100 text-blue-800', icon: User };
      case 'ADMIN':
        return { label: 'Admin', color: 'bg-red-100 text-red-800', icon: Shield };
      default:
        return { label: 'Khách', color: 'bg-gray-100 text-gray-800', icon: User };
    }
  };

  /**
   * Format thời gian tham gia
   */
  const formatJoinTime = (joinTime: string): string => {
    const now = new Date();
    const join = new Date(joinTime);
    const diffMs = now.getTime() - join.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Vừa tham gia';
    if (diffMins < 60) return `${diffMins} phút trước`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours} giờ trước`;
  };

  /**
   * Get status color
   */
  const getStatusColor = (participant: DisplayParticipant): string => {
    if (!participant.isOnline) return 'text-gray-400';
    if (participant.ready) return 'text-green-600';
    return 'text-yellow-600';
  };

  /**
   * Get status icon
   */
  const getStatusIcon = (participant: DisplayParticipant) => {
    if (!participant.isOnline) return WifiOff;
    if (participant.ready) return UserCheck;
    return Clock;
  };

  /**
   * Render filter buttons
   */
  const renderFilterButtons = () => {
    const filters: { type: FilterType; label: string; count: number }[] = [
      { type: 'ALL', label: 'Tất cả', count: participants.length },
      { type: 'ONLINE', label: 'Online', count: participants.filter(p => p.isOnline).length },
      { type: 'READY', label: 'Sẵn sàng', count: participants.filter(p => p.ready).length },
      { type: 'OFFLINE', label: 'Offline', count: participants.filter(p => !p.isOnline).length },
      { type: 'NOT_READY', label: 'Chưa sẵn sàng', count: participants.filter(p => !p.ready).length },
    ];

    return (
      <div className="flex flex-wrap gap-2">
        {filters.map(filter => (
          <Button
            key={filter.type}
            variant={filterType === filter.type ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType(filter.type)}
            className="flex items-center gap-2"
          >
            {filter.label}
            <Badge variant="secondary" className="text-xs">
              {filter.count}
            </Badge>
          </Button>
        ))}
      </div>
    );
  };

  /**
   * Render participant card
   */
  const renderParticipantCard = (participant: DisplayParticipant, index: number) => {
    const roleInfo = getRoleInfo(participant.role);
    const StatusIcon = getStatusIcon(participant);
    const RoleIcon = roleInfo.icon;

    return (
      <motion.div
        key={participant.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        layout
      >
        <Card 
          className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
            participant.isOnline ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-gray-300'
          }`}
          onClick={() => onParticipantClick?.(participant)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              {/* Avatar */}
              <div className={`relative w-10 h-10 rounded-full flex items-center justify-center ${
                participant.isOnline ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                <RoleIcon className={`w-5 h-5 ${participant.isOnline ? 'text-green-600' : 'text-gray-400'}`} />
                
                {/* Online status indicator */}
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                  participant.isOnline ? 'bg-green-500' : 'bg-gray-400'
                }`} />
              </div>

              {/* Participant info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-gray-900 truncate">
                    {participant.fullName}
                  </h4>
                  {participant.isGuest && (
                    <Badge variant="outline" className="text-xs">
                      Khách
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Badge className={`${roleInfo.color} text-xs`}>
                    {roleInfo.label}
                  </Badge>
                  
                  {showDetails && (
                    <span className="text-gray-500 text-xs">
                      {formatJoinTime(participant.joinTime)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Status and actions */}
            <div className="flex items-center gap-2">
              {/* Status icon */}
              <motion.div
                animate={participant.ready ? {
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, 0]
                } : {}}
                transition={{ duration: 0.5, repeat: participant.ready ? Infinity : 0, repeatDelay: 3 }}
              >
                <StatusIcon className={`w-5 h-5 ${getStatusColor(participant)}`} />
              </motion.div>

              {/* Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Gửi tin nhắn
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Eye className="w-4 h-4 mr-2" />
                    Xem chi tiết
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Additional details when expanded */}
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-3 pt-3 border-t border-gray-100"
            >
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">ID người dùng:</span>
                  <p className="font-mono text-xs">{participant.userId}</p>
                </div>
                <div>
                  <span className="text-gray-500">Hoạt động cuối:</span>
                  <p className="text-xs">
                    {participant.lastActivity 
                      ? formatJoinTime(participant.lastActivity)
                      : 'Không có dữ liệu'
                    }
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </Card>
      </motion.div>
    );
  };

  /**
   * Render header với controls
   */
  const renderHeader = () => {
    return (
      <div className="space-y-4">
        {/* Title and toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold">
              Người tham gia ({participants.length})
            </h2>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleDetails}
            className="flex items-center gap-2"
          >
            {showDetails ? (
              <>
                <EyeOff className="w-4 h-4" />
                Ẩn chi tiết
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                Hiện chi tiết
              </>
            )}
          </Button>
        </div>

        {/* Search and sort */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Tìm kiếm theo tên hoặc vai trò..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Sắp xếp
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSortBy('name')}>
                Theo tên
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('joinTime')}>
                Theo thời gian tham gia
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('role')}>
                Theo vai trò
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Filter buttons */}
        {renderFilterButtons()}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {renderHeader()}

      {/* Participants list */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredParticipants.length > 0 ? (
            filteredParticipants.map((participant, index) => 
              renderParticipantCard(participant, index)
            )
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">
                {searchTerm || filterType !== 'ALL' 
                  ? 'Không tìm thấy người tham gia nào phù hợp' 
                  : 'Chưa có người tham gia nào'
                }
              </p>
              {(searchTerm || filterType !== 'ALL') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setFilterType('ALL');
                  }}
                  className="mt-2"
                >
                  Xóa bộ lọc
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Summary */}
      {filteredParticipants.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-sm text-gray-600"
        >
          {searchTerm || filterType !== 'ALL' ? (
            `Hiển thị ${filteredParticipants.length} / ${participants.length} người tham gia`
          ) : (
            `Tổng cộng ${participants.length} người tham gia`
          )}
        </motion.div>
      )}
    </div>
  );
};

export default ParticipantsList;
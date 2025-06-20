import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye, Play, Users, Clock, X, Square } from "lucide-react"
import type { Session } from "../api/sessionApi"
import { useNavigate } from 'react-router-dom';

interface SessionCardProps {
  session: Session;
  onStart?: (id: string) => void;
  onEnd?: (id: string) => void;
  onCancel?: (id: string) => void;
  onView?: () => void;
}

/**
 * Component hiển thị thông tin chi tiết của một phiên học
 */
export const SessionCard = ({ session, onStart, onEnd, onCancel }: SessionCardProps) => {
  const navigate = useNavigate();

  const handleView = () => {
    navigate(`/dashboard/sessions/${session.id}/control`);
  };

  // Hàm định dạng trạng thái session
  const formatStatus = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Chờ bắt đầu'
      case 'ACTIVE': return 'Đang diễn ra'
      case 'ENDED': return 'Đã kết thúc'
      case 'CANCELED': return 'Đã hủy'
      default: return status
    }
  }

  // Màu nền cho thanh trạng thái
  const getStatusBarColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500'
      case 'ENDED': return 'bg-blue-500'
      case 'CANCELED': return 'bg-red-500'
      default: return 'bg-gray-300'
    }
  }

  // Variant cho badge trạng thái
  const getStatusVariant = (status: string): "default" | "secondary" | "outline" => {
    switch (status) {
      case 'ACTIVE': return 'default'
      case 'ENDED': return 'secondary'
      default: return 'outline'
    }
  }

  // Format thời gian
  const formatDateTime = (dateTime?: string) => {
    if (!dateTime) return 'Chưa bắt đầu';
    
    return new Date(dateTime).toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  return (
    <Card className="relative overflow-hidden">
      <div
        className={`absolute top-0 left-0 w-full h-1 ${getStatusBarColor(session.status)}`}
      />
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg leading-tight">
            {session.quiz?.title || "Không có tiêu đề"}
          </CardTitle>
          <Badge
            variant={getStatusVariant(session.status)}
            className="ml-2 flex-shrink-0"
          >
            {formatStatus(session.status)}
          </Badge>
        </div>
        <CardDescription>
          {session.quiz?.description?.substring(0, 60)}
          {session.quiz?.description && session.quiz.description.length > 60 ? "..." : ""}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Users className="w-4 h-4 mr-2 flex-shrink-0" />
            {session._count?.participants ?? 0} người tham gia
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
            {formatDateTime(session.startTime)}
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1"
            onClick={handleView}
          >
            <Eye className="w-4 h-4 mr-1" />
            Xem
          </Button>
          {session.status === "PENDING" && onStart && (
            <Button 
              size="sm" 
              variant="default" 
              className="flex-1"
              onClick={() => onStart(session.id)}
            >
              <Play className="w-4 h-4 mr-1" />
              Bắt đầu
            </Button>
          )}
          {session.status === "ACTIVE" && onEnd && (
            <Button 
              size="sm" 
              variant="destructive" 
              className="flex-1"
              onClick={() => onEnd(session.id)}
            >
              <Square className="w-4 h-4 mr-1" />
              Kết thúc
            </Button>
          )}
          {(session.status === "PENDING" || session.status === "ACTIVE") && onCancel && (
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1 text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={() => onCancel(session.id)}
            >
              <X className="w-4 h-4 mr-1" />
              Hủy
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 
import { Button } from "@/components/ui/button"
import { AlertCircle, Loader2, Plus } from "lucide-react"
import { useSessionManagement } from "../hooks/useSessionManagement"
import { CreateSessionDialog } from "../components/CreateSessionDialog"
import { EmptySessionState } from "../components/EmptySessionState"
import { SessionList } from "../components/SessionList"

export default function SessionTab() {
  const {
    sessions,
    quizzes,
    isSessionLoading,
    isQuizzesLoading,
    error,
    isCreateSessionOpen,
    newSession,
    handleQuizChange,
    handleCreateSession,
    handleStartSession,
    handleEndSession,
    handleCancelSession,
    handleViewSession,
    openCreateSessionDialog,
    setIsCreateSessionOpen
  } = useSessionManagement();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Quản lý Phiên học</h2>
          <p className="text-gray-600">Theo dõi các phiên học trực tiếp</p>
        </div>
        <Button 
          onClick={openCreateSessionDialog}
          className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tạo phiên mới
        </Button>
      </div>

      {/* Dialog tạo phiên mới */}
      <CreateSessionDialog
        isOpen={isCreateSessionOpen}
        onOpenChange={setIsCreateSessionOpen}
        quizzes={quizzes}
        isQuizzesLoading={isQuizzesLoading}
        newSession={newSession}
        onQuizChange={handleQuizChange}
        onCreateSession={handleCreateSession}
      />

      {/* Hiển thị thông báo lỗi nếu có */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      {/* Hiển thị loading */}
      {isSessionLoading && (
        <div className="flex justify-center items-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          <span className="ml-2 text-gray-500">Đang tải...</span>
        </div>
      )}

      {/* Hiển thị khi không có session nào */}
      {!isSessionLoading && sessions.length === 0 && !error && (
        <EmptySessionState 
          onCreateSession={openCreateSessionDialog}
          hasQuizzes={quizzes.length > 0}
        />
      )}

      {/* Hiển thị danh sách session */}
      {!isSessionLoading && sessions.length > 0 && (
        <SessionList
          sessions={sessions}
          onStart={handleStartSession}
          onEnd={handleEndSession}
          onCancel={handleCancelSession}
          onView={handleViewSession}
        />
      )}
    </div>
  )
} 
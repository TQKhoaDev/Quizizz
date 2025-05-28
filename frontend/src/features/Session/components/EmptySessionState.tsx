import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface EmptySessionStateProps {
  onCreateSession: () => void;
  hasQuizzes: boolean;
}

export function EmptySessionState({ onCreateSession, hasQuizzes }: EmptySessionStateProps) {
  return (
    <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center">
      <h3 className="text-lg font-medium text-gray-600 mb-2">Chưa có phiên học nào</h3>
      <p className="text-gray-500 mb-4">Bắt đầu bằng cách tạo phiên học đầu tiên</p>
      <Button 
        onClick={onCreateSession} 
        className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
        disabled={!hasQuizzes}
      >
        <Plus className="w-4 h-4 mr-2" />
        Tạo phiên mới
      </Button>
      {!hasQuizzes && (
        <p className="mt-3 text-sm text-amber-600">
          Bạn cần tạo ít nhất một bài kiểm tra trước khi tạo phiên học.
        </p>
      )}
    </div>
  )
} 
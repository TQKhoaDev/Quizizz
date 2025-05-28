import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import type { Quiz } from "@/features/Quiz/api/quizApi"
import type { CreateSessionRequest } from "../api/sessionApi"

interface CreateSessionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  quizzes: Quiz[];
  isQuizzesLoading: boolean;
  newSession: CreateSessionRequest;
  onQuizChange: (quizId: string) => void;
  onCreateSession: () => void;
}

export function CreateSessionDialog({
  isOpen,
  onOpenChange,
  quizzes,
  isQuizzesLoading,
  newSession,
  onQuizChange,
  onCreateSession
}: CreateSessionDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tạo phiên học mới</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quiz" className="text-right">
              Bài kiểm tra
            </Label>
            {isQuizzesLoading ? (
              <div className="flex items-center justify-center col-span-3">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span>Đang tải danh sách quiz...</span>
              </div>
            ) : quizzes.length === 0 ? (
              <div className="col-span-3 text-amber-600">
                Bạn chưa có bài kiểm tra nào. Vui lòng tạo bài kiểm tra trước!
              </div>
            ) : (
              <Select
                value={newSession.quizId}
                onValueChange={onQuizChange}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Chọn bài kiểm tra" />
                </SelectTrigger>
                <SelectContent>
                  {quizzes.map(quiz => (
                    <SelectItem key={quiz.id} value={quiz.id}>
                      {quiz.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button 
            type="submit" 
            onClick={onCreateSession}
            disabled={isQuizzesLoading || quizzes.length === 0 || !newSession.quizId}
          >
            Tạo phiên
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 
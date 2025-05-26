import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Edit,
  Eye,
  MoreHorizontal,
  Play,
  Plus,
  Trash2,
  Loader2,
} from "lucide-react"
import { quizApi, type Quiz, type QuizCreateData } from "../api/quizApi"

export default function QuizTab() {
  const [isCreateQuizOpen, setIsCreateQuizOpen] = useState(false)
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Form state cho việc tạo quiz mới
  const [newQuiz, setNewQuiz] = useState<QuizCreateData>({
    title: "",
    description: "",
    timeLimit: 30 // Đặt giá trị mặc định
  })

  // Hàm xử lý thay đổi dữ liệu form
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setNewQuiz({
      ...newQuiz,
      [id]: id === "timeLimit" ? parseInt(value) || 0 : value
    })
  }

  // Hàm xử lý tạo quiz mới
  const handleCreateQuiz = async () => {
    try {
      await quizApi.createQuiz({
        title: newQuiz.title,
        description: newQuiz.description,
        timeLimit: (newQuiz.timeLimit || 30) * 60, // Kiểm tra undefined và cung cấp giá trị mặc định
        isPublic: false // Mặc định là nháp (draft)
      })
      
      // Đóng dialog và làm mới danh sách quiz
      setIsCreateQuizOpen(false)
      fetchQuizzes()
      
      // Reset form
      setNewQuiz({
        title: "",
        description: "",
        timeLimit: 30
      })
    } catch (err) {
      console.error("Lỗi khi tạo quiz:", err)
      setError("Không thể tạo quiz. Vui lòng thử lại sau.")
    }
  }

  // Lấy danh sách quiz khi component được mount
  useEffect(() => {
    fetchQuizzes()
  }, [])

  // Hàm lấy danh sách quiz
  const fetchQuizzes = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const data = await quizApi.getQuizzes()
      console.log(data)
      setQuizzes(data)
    } catch (err) {
      console.error("Lỗi khi lấy danh sách quiz:", err)
      setError("Không thể lấy danh sách quiz. Vui lòng thử lại sau.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Quản lý Quiz</h2>
          <p className="text-gray-600">Tạo và quản lý các bài quiz</p>
        </div>

        <Dialog open={isCreateQuizOpen} onOpenChange={setIsCreateQuizOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Tạo Quiz mới
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] mx-4">
            <DialogHeader>
              <DialogTitle>Tạo Quiz mới</DialogTitle>
              <DialogDescription>Tạo một bài quiz mới cho học sinh</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Tiêu đề</Label>
                <Input 
                  id="title" 
                  placeholder="Nhập tiêu đề quiz..." 
                  value={newQuiz.title} 
                  onChange={handleFormChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea 
                  id="description" 
                  placeholder="Mô tả ngắn về quiz..." 
                  value={newQuiz.description} 
                  onChange={handleFormChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="timeLimit">Thời gian (phút)</Label>
                <Input 
                  id="timeLimit" 
                  type="number" 
                  placeholder="30" 
                  value={(newQuiz.timeLimit || 0).toString()}  // Kiểm tra undefined
                  onChange={handleFormChange}
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="submit" 
                onClick={handleCreateQuiz} 
                className="w-full sm:w-auto"
              >
                Tạo Quiz
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Hiển thị thông báo lỗi nếu có */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
          {error}
        </div>
      )}

      {/* Hiển thị loading */}
      {isLoading && (
        <div className="flex justify-center items-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          <span className="ml-2 text-gray-500">Đang tải...</span>
        </div>
      )}

      {/* Hiển thị khi không có quiz nào */}
      {!isLoading && quizzes.length === 0 && !error && (
        <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center">
          <h3 className="text-lg font-medium text-gray-600 mb-2">Chưa có quiz nào</h3>
          <p className="text-gray-500 mb-4">Bắt đầu bằng cách tạo quiz đầu tiên của bạn</p>
          <Button 
            onClick={() => setIsCreateQuizOpen(true)} 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tạo Quiz mới
          </Button>
        </div>
      )}

      {/* Mobile Quiz Cards */}
      {!isLoading && quizzes.length > 0 && (
        <div className="block md:hidden space-y-4">
          {quizzes.map((quiz) => (
            <Card key={quiz.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{quiz.title}</h3>
                    <p className="text-sm text-gray-500">
                      {quiz.questions} câu hỏi • {quiz.participants} người tham gia
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        Xem
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Play className="mr-2 h-4 w-4" />
                        Bắt đầu
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Xóa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Điểm TB: {quiz.avgScore}%</span>
                    <span>{quiz.createdAt}</span>
                  </div>
                  <Badge
                    variant={
                      quiz.status === "active" ? "default" : quiz.status === "draft" ? "secondary" : "outline"
                    }
                  >
                    {quiz.status === "active"
                      ? "Hoạt động"
                      : quiz.status === "draft"
                        ? "Nháp"
                        : "Hoàn thành"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Desktop Table */}
      {!isLoading && quizzes.length > 0 && (
        <Card className="hidden md:block">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tiêu đề</TableHead>
                    <TableHead>Câu hỏi</TableHead>
                    <TableHead>Người tham gia</TableHead>
                    <TableHead>Điểm TB</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quizzes.map((quiz) => (
                    <TableRow key={quiz.id}>
                      <TableCell className="font-medium">{quiz.title}</TableCell>
                      <TableCell>{quiz.questions}</TableCell>
                      <TableCell>{quiz.participants}</TableCell>
                      <TableCell>{quiz.avgScore}%</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            quiz.status === "active"
                              ? "default"
                              : quiz.status === "draft"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {quiz.status === "active"
                            ? "Hoạt động"
                            : quiz.status === "draft"
                              ? "Nháp"
                              : "Hoàn thành"}
                        </Badge>
                      </TableCell>
                      <TableCell>{quiz.createdAt}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              Xem
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Play className="mr-2 h-4 w-4" />
                              Bắt đầu
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 
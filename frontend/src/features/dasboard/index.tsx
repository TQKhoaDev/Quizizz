
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  BarChart3,
  BookOpen,
  Clock,
  Edit,
  Eye,
  Menu,
  MoreHorizontal,
  Play,
  Plus,
  Search,
  Settings,
  Trash2,
  Users,
  Trophy,
  TrendingUp,
  Bell,
  LogOut,
  Home,
} from "lucide-react"

export default function QuizizzDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [isCreateQuizOpen, setIsCreateQuizOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Mock data
  const stats = {
    totalQuizzes: 24,
    totalSessions: 156,
    totalParticipants: 1247,
    avgScore: 78.5,
  }

  const recentQuizzes = [
    {
      id: 1,
      title: "Toán học cơ bản",
      questions: 15,
      participants: 45,
      avgScore: 82,
      status: "active",
      createdAt: "2024-01-15",
    },
    {
      id: 2,
      title: "Lịch sử Việt Nam",
      questions: 20,
      participants: 32,
      avgScore: 75,
      status: "draft",
      createdAt: "2024-01-14",
    },
    {
      id: 3,
      title: "Tiếng Anh giao tiếp",
      questions: 25,
      participants: 67,
      avgScore: 88,
      status: "completed",
      createdAt: "2024-01-13",
    },
  ]

  const recentSessions = [
    {
      id: 1,
      quizTitle: "Toán học cơ bản",
      code: "ABC123",
      participants: 25,
      status: "live",
      startTime: "14:30",
    },
    {
      id: 2,
      quizTitle: "Lịch sử Việt Nam",
      code: "XYZ789",
      participants: 18,
      status: "ended",
      startTime: "13:15",
    },
  ]

  const navigationItems = [
    { id: "overview", label: "Tổng quan", icon: Home },
    { id: "quizzes", label: "Quiz", icon: BookOpen },
    { id: "sessions", label: "Phiên học", icon: Play },
    { id: "analytics", label: "Thống kê", icon: BarChart3 },
  ]

  const MobileNavigation = () => (
    <div className="flex flex-col space-y-2 p-4">
      {navigationItems.map((item) => {
        const Icon = item.icon
        return (
          <Button
            key={item.id}
            variant={activeTab === item.id ? "default" : "ghost"}
            className="justify-start h-12"
            onClick={() => {
              setActiveTab(item.id)
              setIsMobileMenuOpen(false)
            }}
          >
            <Icon className="w-5 h-5 mr-3" />
            {item.label}
          </Button>
        )
      })}
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Mobile Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            {/* Mobile Menu Button */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-lg">Quizizz</span>
                  </div>
                </div>
                <ScrollArea className="flex-1">
                  <MobileNavigation />
                </ScrollArea>
              </SheetContent>
            </Sheet>

            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Quizizz
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Search - Hidden on small screens */}
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input placeholder="Tìm kiếm..." className="pl-10 w-48 md:w-64" />
            </div>

            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Avatar" />
                    <AvatarFallback>AD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Admin User</p>
                    <p className="text-xs leading-none text-muted-foreground">admin@quizizz.com</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Cài đặt</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="px-4 pb-3 sm:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input placeholder="Tìm kiếm quiz..." className="pl-10 w-full" />
          </div>
        </div>
      </header>

      {/* Desktop Navigation Tabs */}
      <div className="hidden md:block bg-white border-b px-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 lg:w-[500px] h-12">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <TabsTrigger key={item.id} value={item.id} className="flex items-center space-x-2">
                  <Icon className="w-4 h-4" />
                  <span className="hidden lg:inline">{item.label}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>
        </Tabs>
      </div>

      {/* Main Content */}
      <main className="p-4 md:p-6">
        <div className="space-y-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Quiz</CardTitle>
                    <BookOpen className="h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalQuizzes}</div>
                    <p className="text-xs opacity-80">+2 tháng trước</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Phiên</CardTitle>
                    <Play className="h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalSessions}</div>
                    <p className="text-xs opacity-80">+12 tuần trước</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Người dùng</CardTitle>
                    <Users className="h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalParticipants}</div>
                    <p className="text-xs opacity-80">+89 tuần trước</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Điểm TB</CardTitle>
                    <Trophy className="h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.avgScore}%</div>
                    <p className="text-xs opacity-80">+2.1% tháng trước</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quiz gần đây</CardTitle>
                    <CardDescription>Các quiz được tạo gần đây nhất</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recentQuizzes.slice(0, 3).map((quiz) => (
                        <div key={quiz.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                          <div className="flex items-center space-x-3 min-w-0 flex-1">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <BookOpen className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium truncate">{quiz.title}</p>
                              <p className="text-sm text-gray-500">{quiz.questions} câu hỏi</p>
                            </div>
                          </div>
                          <Badge
                            variant={
                              quiz.status === "active" ? "default" : quiz.status === "draft" ? "secondary" : "outline"
                            }
                            className="ml-2 flex-shrink-0"
                          >
                            {quiz.status === "active" ? "Hoạt động" : quiz.status === "draft" ? "Nháp" : "Hoàn thành"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Phiên học hiện tại</CardTitle>
                    <CardDescription>Các phiên học đang diễn ra</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recentSessions.map((session) => (
                        <div key={session.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                          <div className="flex items-center space-x-3 min-w-0 flex-1">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Play className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium truncate">{session.quizTitle}</p>
                              <p className="text-sm text-gray-500">
                                {session.code} • {session.participants} người
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant={session.status === "live" ? "default" : "secondary"}
                            className="ml-2 flex-shrink-0"
                          >
                            {session.status === "live" ? "Live" : "Kết thúc"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Quizzes Tab */}
          {activeTab === "quizzes" && (
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
                        <Input id="title" placeholder="Nhập tiêu đề quiz..." />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description">Mô tả</Label>
                        <Textarea id="description" placeholder="Mô tả ngắn về quiz..." />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="timeLimit">Thời gian (phút)</Label>
                        <Input id="timeLimit" type="number" placeholder="30" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" onClick={() => setIsCreateQuizOpen(false)} className="w-full sm:w-auto">
                        Tạo Quiz
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Mobile Quiz Cards */}
              <div className="block md:hidden space-y-4">
                {recentQuizzes.map((quiz) => (
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
                          {quiz.status === "active" ? "Hoạt động" : quiz.status === "draft" ? "Nháp" : "Hoàn thành"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Desktop Table */}
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
                        {recentQuizzes.map((quiz) => (
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
            </div>
          )}

          {/* Sessions Tab */}
          {activeTab === "sessions" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold">Quản lý Phiên học</h2>
                  <p className="text-gray-600">Theo dõi các phiên học trực tiếp</p>
                </div>
                <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 w-full sm:w-auto">
                  <Play className="w-4 h-4 mr-2" />
                  Tạo phiên mới
                </Button>
              </div>

              <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {recentSessions.map((session) => (
                  <Card key={session.id} className="relative overflow-hidden">
                    <div
                      className={`absolute top-0 left-0 w-full h-1 ${session.status === "live" ? "bg-green-500" : "bg-gray-300"}`}
                    />
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg leading-tight">{session.quizTitle}</CardTitle>
                        <Badge
                          variant={session.status === "live" ? "default" : "secondary"}
                          className="ml-2 flex-shrink-0"
                        >
                          {session.status === "live" ? "Live" : "Kết thúc"}
                        </Badge>
                      </div>
                      <CardDescription>Mã: {session.code}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                          {session.participants} người tham gia
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                          Bắt đầu lúc {session.startTime}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Eye className="w-4 h-4 mr-1" />
                          Xem
                        </Button>
                        {session.status === "live" && (
                          <Button size="sm" variant="destructive" className="flex-1">
                            Kết thúc
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">Thống kê & Báo cáo</h2>
                <p className="text-gray-600">Phân tích hiệu suất và xu hướng</p>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <TrendingUp className="w-5 h-5 mr-2" />
                      Xu hướng tham gia
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48 md:h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                      <p className="text-gray-500 text-center">Biểu đồ xu hướng tham gia theo thời gian</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <BarChart3 className="w-5 h-5 mr-2" />
                      Phân bố điểm số
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48 md:h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                      <p className="text-gray-500 text-center">Biểu đồ phân bố điểm số</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Top Quiz phổ biến</CardTitle>
                  <CardDescription>Các quiz có nhiều người tham gia nhất</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentQuizzes.map((quiz, index) => (
                      <div key={quiz.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600 flex-shrink-0">
                            {index + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate">{quiz.title}</p>
                            <p className="text-sm text-gray-500">{quiz.participants} người tham gia</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <p className="font-medium">{quiz.avgScore}%</p>
                          <p className="text-sm text-gray-500">Điểm TB</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

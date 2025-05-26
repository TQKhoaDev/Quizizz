import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Play, Users, Trophy } from "lucide-react"
import { mockStats, mockQuizzes, mockSessions } from "../models"

export default function OverviewTab() {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quiz</CardTitle>
            <BookOpen className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalQuizzes}</div>
            <p className="text-xs opacity-80">+2 tháng trước</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Phiên</CardTitle>
            <Play className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalSessions}</div>
            <p className="text-xs opacity-80">+12 tuần trước</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Người dùng</CardTitle>
            <Users className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalParticipants}</div>
            <p className="text-xs opacity-80">+89 tuần trước</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Điểm TB</CardTitle>
            <Trophy className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.avgScore}%</div>
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
              {mockQuizzes.slice(0, 3).map((quiz) => (
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
              {mockSessions.map((session) => (
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
  )
} 
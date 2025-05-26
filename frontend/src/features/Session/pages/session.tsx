import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Play, Users, Clock } from "lucide-react"
import { mockSessions } from "../../dasboard/models"

export default function SessionTab() {
  return (
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
        {mockSessions.map((session) => (
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
  )
} 
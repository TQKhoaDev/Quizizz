import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, BarChart3 } from "lucide-react"
import { mockQuizzes } from "../models"

export default function AnalyticsTab() {
  return (
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
            {mockQuizzes.map((quiz, index) => (
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
  )
} 
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  BarChart3,
  BookOpen,
  Menu,
  Play,
  Search,
  Settings,
  Bell,
  LogOut,
  Home,
} from "lucide-react"

// Import các tab components
import OverviewTab from "./components/OverviewTab"
import QuizTab from "../Quiz/pages/quiz"
import SessionTab from "../session/pages/session"
import AnalyticsTab from "./components/AnalyticsTab"

export default function QuizizzDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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
          {/* Hiển thị tab tương ứng dựa vào activeTab */}
          {activeTab === "overview" && <OverviewTab />}
          {activeTab === "quizzes" && <QuizTab />}
          {activeTab === "sessions" && <SessionTab />}
          {activeTab === "analytics" && <AnalyticsTab />}
        </div>
      </main>
    </div>
  )
}

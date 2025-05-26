import { createBrowserRouter } from "react-router-dom";

// Layouts
import MainLayout from "@/layouts/MainLayout";
import AuthLayout from "@/layouts/AuthLayout";
import ProtectedRoute from "./ProtectedRoute";

// Pages
import Home from "@/features/Home";
import Dashboard from "@/features/dasboard";
import Login from "@/features/Auth/pages/Login";
import Register from "@/features/Auth/pages/Register";
import QuizList from "@/features/Quiz";
import SessionPage from "@/features/Session/index";
import NotFound from "@/features/NotFound";

// Tạo các routes cho ứng dụng
const router = createBrowserRouter([
  // Route chính cho người dùng chưa đăng nhập
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "play/:code",
        // Trang chơi quiz sẽ được tạo sau
        element: <div>Trang chơi quiz - Tham gia phòng</div>,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
  
  // Routes xác thực
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
    ],
  },
  
  // Routes bảng điều khiển - yêu cầu đăng nhập
  {
    path: "/dashboard",
    element: <ProtectedRoute />,
    children: [
      {
        children: [
          {
            index: true,
            element: <Dashboard />,
          },
          {
            path: "quizzes",
            element: <QuizList />,
          },
          {
            path: "quizzes/create",
            // Trang tạo quiz sẽ được tạo sau
            element: <div>Trang tạo quiz mới</div>,
          },
          {
            path: "quizzes/:id/edit",
            // Trang chỉnh sửa quiz sẽ được tạo sau
            element: <div>Trang chỉnh sửa quiz</div>,
          },
          {
            path: "sessions",
            element: <SessionPage />,
          },
        ],
      },
    ],
  },
]);

export default router; 
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/features/Auth/hooks/useAuth";

// // Hook xác thực tạm thời. Sau này sẽ thay thế bằng hook useAuth thật
// const useAuth = () => {
//   // Lấy token từ localStorage
//   const token = localStorage.getItem("token");
  
//   return {
//     isAuthenticated: !!token,
//     isLoading: false
//   };
// };

interface ProtectedRouteProps {
  redirectPath?: string;
}

const ProtectedRoute = ({ redirectPath = "/auth/login" }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Nếu đang tải thông tin xác thực
  if (isLoading) {
    return <div>Đang tải...</div>;
  }
  
  // Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }
  
  // Nếu đã đăng nhập, hiển thị nội dung được bảo vệ
  return <Outlet />;
};

export default ProtectedRoute; 
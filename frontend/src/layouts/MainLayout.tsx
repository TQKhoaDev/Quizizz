import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto py-4 px-6">
          <h1 className="text-2xl font-bold text-blue-600">Quizizz</h1>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto py-6 px-6">
        <Outlet />
      </main>
      
      <footer className="bg-gray-100 py-4">
        <div className="container mx-auto px-6 text-center text-gray-500">
          <p>© {new Date().getFullYear()} Quizizz. Đã đăng ký bản quyền.</p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout; 
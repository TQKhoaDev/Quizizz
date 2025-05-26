import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LoginForm } from '../../Auth';
import { useAuth } from '../../Auth/hooks/useAuth';

const Login = () => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setError('');
    
    try {
      const success = await login(email, password);
      
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Email hoặc mật khẩu không chính xác');
      }
    } catch {
      setError('Đã xảy ra lỗi trong quá trình đăng nhập');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm 
          onSubmit={handleLogin} 
          isLoading={isLoading}
          error={error}
        />
        
        <div className="mt-4 text-center text-sm">
          Chưa có tài khoản?{" "}
          <Link to="/auth/register" className="text-blue-600 hover:underline">
            Đăng ký
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
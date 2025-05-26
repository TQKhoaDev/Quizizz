import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [quizCode, setQuizCode] = useState('');
  const navigate = useNavigate();

  const handleJoinQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (quizCode.trim()) {
      navigate(`/play/${quizCode.trim()}`);
    }
  };

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          Chào mừng đến với Quizizz
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Nền tảng tạo và tham gia quiz trực tuyến tương tác.
        </p>

        {/* Form nhập mã phòng */}
        <div className="max-w-md mx-auto mb-10">
          <form onSubmit={handleJoinQuiz} className="mt-8 space-y-4">
            <div className="text-left">
              <label htmlFor="quiz-code" className="block text-sm font-medium text-gray-700 mb-1">
                Nhập mã phòng để tham gia
              </label>
              <input
                type="text"
                id="quiz-code"
                value={quizCode}
                onChange={(e) => setQuizCode(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập mã phòng"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              Tham gia
            </button>
          </form>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Tạo quiz của riêng bạn</h2>
            <p className="text-gray-600 mb-4">
              Đăng ký để tạo quiz tương tác, theo dõi kết quả và tùy chỉnh trải nghiệm.
            </p>
            <button
              onClick={() => navigate('/auth/register')}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Đăng ký ngay
            </button>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Đã có tài khoản?</h2>
            <p className="text-gray-600 mb-4">
              Đăng nhập để truy cập vào tất cả các quiz của bạn và quản lý phiên.
            </p>
            <button
              onClick={() => navigate('/auth/login')}
              className="mt-2 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors"
            >
              Đăng nhập
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 
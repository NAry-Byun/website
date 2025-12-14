import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { userAPI } from '../api';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // 이미 로그인된 사용자 체크
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
      // 이미 로그인된 상태면 메인 페이지로 이동
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해주세요';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다';
    }

    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await userAPI.login(formData.email, formData.password);

      // 서버 응답 확인
      if (response && response.success) {
        // 로컬 스토리지에 토큰과 사용자 정보 저장
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));

        // 환영 메시지 표시
        alert(response.message);

        // 홈으로 이동
        navigate('/');
      } else {
        // success가 false인 경우
        setErrors({ submit: response.error || '로그인에 실패했습니다. 다시 시도해주세요.' });
      }
    } catch (error) {
      // 에러 처리
      console.error('Login error:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);

      if (error.response && error.response.data) {
        // 서버에서 반환한 에러 메시지
        const errorMessage = error.response.data.error || '로그인에 실패했습니다. 다시 시도해주세요.';
        setErrors({ submit: errorMessage });
        console.log('Server error message:', errorMessage);
      } else if (error.request) {
        // 요청은 보냈지만 응답을 받지 못함
        setErrors({ submit: '서버와 연결할 수 없습니다. 네트워크 연결을 확인해주세요.' });
      } else {
        // 그 외 에러
        setErrors({ submit: '로그인 중 오류가 발생했습니다. 다시 시도해주세요.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full">
        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-center mb-2">
            로그인
          </h1>
          <p className="text-sm text-gray-500 text-center mb-8">
            계정에 로그인하여 쇼핑을 시작하세요
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 이메일 */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                이메일
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="이메일"
                className={`w-full px-4 py-2.5 bg-blue-50 border ${
                  errors.email ? 'border-red-500' : 'border-blue-100'
                } rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            {/* 비밀번호 */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="********"
                className={`w-full px-4 py-2.5 bg-blue-50 border ${
                  errors.password ? 'border-red-500' : 'border-blue-100'
                } rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded text-base font-medium bg-gray-600 text-white hover:bg-gray-700 transition-all"
              >
                {isLoading ? '로그인 중...' : '로그인'}
              </Button>
            </div>

            {/* Sign Up Link */}
            <div className="text-center pt-2">
              <p className="text-sm text-gray-600">
                계정이 없으신가요?{' '}
                <Link
                  to="/signup"
                  className="text-blue-600 hover:text-blue-700 font-medium underline"
                >
                  회원가입
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;

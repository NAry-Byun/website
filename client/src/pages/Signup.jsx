import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    phone: '',
    address: '',
    agreements: {
      termsOfService: false,
      privacyPolicy: false,
      marketingConsent: false,
      eventNotifications: false
    }
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

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

  const handleAgreementChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      agreements: {
        ...prev.agreements,
        [name]: checked
      }
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요';
    }

    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해주세요';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다';
    }

    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요';
    } else if (formData.password.length < 8) {
      newErrors.password = '비밀번호는 최소 8자 이상이어야 합니다';
    }

    if (!formData.passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호 확인을 입력해주세요';
    } else if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다';
    }

    if (!formData.agreements.termsOfService) {
      newErrors.agreements = '이용 약관에 동의해주세요';
    }

    if (!formData.agreements.privacyPolicy) {
      newErrors.agreements = '개인정보 수집 및 이용에 동의해주세요';
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

    try {
      const response = await fetch('http://localhost:3000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          user_type: 'customer',
          address: formData.address || undefined
        }),
      });

      if (response.ok) {
        alert('회원가입이 완료되었습니다!');
        navigate('/');
      } else {
        const data = await response.json();
        setErrors({ submit: data.error || '회원가입에 실패했습니다' });
      }
    } catch (error) {
      setErrors({ submit: '네트워크 오류가 발생했습니다. 다시 시도해주세요.' });
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
            회원가입
          </h1>
          <p className="text-sm text-gray-500 text-center mb-8">
            새로운 계정을 만들어 스킨케어 여정을 시작하세요
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 이름 */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                이름
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="이름"
                className={`w-full px-4 py-2.5 bg-gray-50 border ${
                  errors.name ? 'border-red-500' : 'border-gray-200'
                } rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-500">{errors.name}</p>
              )}
            </div>

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

            {/* 비밀번호 확인 */}
            <div>
              <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호 확인
              </label>
              <input
                type="password"
                id="passwordConfirm"
                name="passwordConfirm"
                value={formData.passwordConfirm}
                onChange={handleChange}
                placeholder="********"
                className={`w-full px-4 py-2.5 bg-blue-50 border ${
                  errors.passwordConfirm ? 'border-red-500' : 'border-blue-100'
                } rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
              />
              {errors.passwordConfirm && (
                <p className="mt-1 text-xs text-red-500">{errors.passwordConfirm}</p>
              )}
            </div>

            {/* 주소 (선택) */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                주소 (선택)
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="주소를 입력해주세요"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* 약관 동의 */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="termsOfService"
                  name="termsOfService"
                  checked={formData.agreements.termsOfService}
                  onChange={handleAgreementChange}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="termsOfService" className="ml-2 text-sm text-gray-700">
                  이용 약관 <span className="text-gray-400">(필수)</span>
                  <Link to="#" className="ml-2 text-blue-600 underline text-xs">보기</Link>
                </label>
              </div>

              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="privacyPolicy"
                  name="privacyPolicy"
                  checked={formData.agreements.privacyPolicy}
                  onChange={handleAgreementChange}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="privacyPolicy" className="ml-2 text-sm text-gray-700">
                  개인정보 수집 및 이용 <span className="text-gray-400">(필수)</span>
                  <Link to="#" className="ml-2 text-blue-600 underline text-xs">보기</Link>
                </label>
              </div>

              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="marketingConsent"
                  name="marketingConsent"
                  checked={formData.agreements.marketingConsent}
                  onChange={handleAgreementChange}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="marketingConsent" className="ml-2 text-sm text-gray-700">
                  개인정보보호법 동의 <span className="text-gray-400">(필수)</span>
                  <Link to="#" className="ml-2 text-blue-600 underline text-xs">보기</Link>
                </label>
              </div>

              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="eventNotifications"
                  name="eventNotifications"
                  checked={formData.agreements.eventNotifications}
                  onChange={handleAgreementChange}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="eventNotifications" className="ml-2 text-sm text-gray-700">
                  이벤트 정보 수신 동의 <span className="text-gray-400">(선택)</span>
                </label>
              </div>

              {errors.agreements && (
                <p className="text-xs text-red-500">{errors.agreements}</p>
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
                {isLoading ? '가입 중...' : '회원가입'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;

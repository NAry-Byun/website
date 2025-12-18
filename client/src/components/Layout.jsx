import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Leaf, Search, User, ShoppingCart, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { useState, useEffect, useCallback } from 'react';

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [cartItemCount, setCartItemCount] = useState(0);
  const [user, setUser] = useState(null);

  const updateCartCount = useCallback(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    setCartItemCount(count);
  }, []);

  const updateUserInfo = useCallback(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    updateCartCount();
    updateUserInfo();

    // Custom event listeners for same-tab updates
    const handleCartUpdate = () => updateCartCount();
    const handleUserUpdate = () => updateUserInfo();

    window.addEventListener('cart-updated', handleCartUpdate);
    window.addEventListener('user-updated', handleUserUpdate);

    // Storage event listener for cross-tab updates
    const handleStorageChange = (e) => {
      if (e.key === 'cart') {
        updateCartCount();
      }
      if (e.key === 'user' || e.key === 'token') {
        updateUserInfo();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('cart-updated', handleCartUpdate);
      window.removeEventListener('user-updated', handleUserUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [updateCartCount, updateUserInfo]);

  // Update user info when navigating (for logout/login on different pages)
  useEffect(() => {
    updateUserInfo();
  }, [location.pathname, updateUserInfo]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.dispatchEvent(new Event('user-updated'));
    navigate('/');
  }, [navigate]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2">
                <Leaf className="w-6 h-6 text-primary" />
                <span className="text-xl font-semibold tracking-tight">NATURELLE</span>
              </Link>
              <nav className="hidden md:flex items-center gap-6 text-sm">
                <Link to="/products?category=skincare" className="text-foreground hover:text-primary transition-colors">
                  스킨케어
                </Link>
                <Link to="/products?category=bodycare" className="text-foreground hover:text-primary transition-colors">
                  바디케어
                </Link>
                <Link to="/products" className="text-foreground hover:text-primary transition-colors">
                  베스트셀러
                </Link>
                <Link to="/products" className="text-foreground hover:text-primary transition-colors">
                  새로운 제품
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm">
                <Search className="w-4 h-4 mr-1" />
                검색
              </Button>
              {user ? (
                <>
                  <span className="text-sm font-medium text-foreground">
                    {user.name}님
                  </span>
                  {user.user_type === 'admin' && (
                    <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>
                      관리자
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-1" />
                    로그아웃
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                    <User className="w-4 h-4 mr-1" />
                    로그인
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/signup')}>
                    회원가입
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="relative"
                onClick={() => navigate('/cart')}
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="ml-1">장바구니</span>
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                    {cartItemCount}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-secondary py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Leaf className="w-5 h-5 text-primary" />
                <span className="font-semibold">NATURELLE</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                자연에서 온 순수한 아름다움을 선사합니다
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-4">쇼핑</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/products" className="hover:text-primary transition-colors">
                    전체 제품
                  </Link>
                </li>
                <li>
                  <Link to="/products" className="hover:text-primary transition-colors">
                    베스트셀러
                  </Link>
                </li>
                <li>
                  <Link to="/products" className="hover:text-primary transition-colors">
                    신제품
                  </Link>
                </li>
                <li>
                  <Link to="/products" className="hover:text-primary transition-colors">
                    특가 상품
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">고객 지원</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="#" className="hover:text-primary transition-colors">
                    자주 묻는 질문
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-primary transition-colors">
                    배송 정보
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-primary transition-colors">
                    반품 및 교환
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-primary transition-colors">
                    문의하기
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">회사</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="#" className="hover:text-primary transition-colors">
                    브랜드 스토리
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-primary transition-colors">
                    지속가능성
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-primary transition-colors">
                    채용
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-primary transition-colors">
                    매장 찾기
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>&copy; 2025 NATURELLE. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Layout;

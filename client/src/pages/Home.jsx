import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { ArrowRight, Leaf, Heart, Star, ShoppingCart } from 'lucide-react';
import { productAPI } from '../api';

function Home() {
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [showCartNotification, setShowCartNotification] = useState(false);

  useEffect(() => {
    fetchProducts();
    loadCart();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await productAPI.getAll();
      setProducts(data.slice(0, 4)); // Get first 4 products
    } catch (err) {
      console.error('Failed to load products:', err);
    }
  };

  const loadCart = () => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(savedCart);
  };

  const addToCart = (product) => {
    const existingItem = cart.find((item) => item.id === product.id);
    let newCart;

    if (existingItem) {
      newCart = cart.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      newCart = [...cart, { ...product, quantity: 1 }];
    }

    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));

    setShowCartNotification(true);
    setTimeout(() => setShowCartNotification(false), 2000);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {showCartNotification && (
        <div className="fixed top-20 right-4 z-50 bg-primary text-primary-foreground px-6 py-3 rounded-lg shadow-lg animate-in fade-in slide-in-from-top-2">
          장바구니에 추가되었습니다!
        </div>
      )}

      {/* Hero Section */}
      <section className="relative bg-muted">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center min-h-[600px] py-12">
            <div className="space-y-6">
              <div className="inline-block px-4 py-1.5 bg-secondary rounded-full text-sm text-secondary-foreground">
                자연에서 온 순수한 아름다움
              </div>
              <h1 className="text-5xl md:text-6xl font-light tracking-tight">
                자연의 힘으로
                <br />
                <span className="text-primary font-medium">피부를 깨우다</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
                100% 천연 보태니컬 성분으로 만든 프리미엄 스킨케어. 피부 본연의 건강함을 되찾아드립니다.
              </p>
              <div className="flex gap-4">
                <Link to="/products">
                  <Button size="lg" className="bg-primary hover:bg-primary/90">
                    제품 둘러보기
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline">
                  더 알아보기
                </Button>
              </div>
            </div>
            <div className="relative h-[500px]">
              <img
                src="/images/Screenshot 2025-12-12 002428.png"
                alt="Natural Skincare Products"
                className="w-full h-full object-cover rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center">
                <Leaf className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-lg font-medium">100% 천연 성분</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                자연에서 온 순수한 보태니컬 추출물만을 사용합니다
              </p>
            </div>
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center">
                <Heart className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-lg font-medium">피부 친화적</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                민감한 피부도 안심하고 사용할 수 있습니다
              </p>
            </div>
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center">
                <Star className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-lg font-medium">임상 테스트 완료</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                엄격한 품질 관리와 피부과 테스트를 거쳤습니다
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-4xl font-light tracking-tight">베스트셀러</h2>
            <p className="text-muted-foreground">가장 사랑받는 제품들을 만나보세요</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {products.length > 0 ? (
              products.map((product) => (
                <Card key={product.id} className="group overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl text-muted-foreground">
                        {product.name?.charAt(0) || 'P'}
                      </div>
                    )}
                  </div>
                  <div className="p-4 space-y-3">
                    <h3 className="font-medium text-sm">{product.name}</h3>
                    <p className="text-primary font-medium">₩{product.price?.toLocaleString()}</p>
                    <Button
                      onClick={() => addToCart(product)}
                      className="w-full bg-primary hover:bg-primary/90"
                      size="sm"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      장바구니 담기
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <div className="col-span-4 text-center py-12 text-muted-foreground">
                상품을 불러오는 중입니다...
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Category Showcase */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="relative overflow-hidden group cursor-pointer border-0">
              <Link to="/products?category=skincare">
                <div className="relative h-96">
                  <img
                    src="/images/Screenshot 2025-12-12 002351.png"
                    alt="Skincare Collection"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                    <h3 className="text-3xl font-light mb-2">스킨케어 컬렉션</h3>
                    <p className="mb-4 text-white/90">얼굴 피부를 위한 완벽한 솔루션</p>
                    <Button variant="secondary" size="sm">
                      둘러보기
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Link>
            </Card>
            <Card className="relative overflow-hidden group cursor-pointer border-0">
              <Link to="/products?category=bodycare">
                <div className="relative h-96">
                  <img
                    src="/images/Screenshot 2025-12-12 002408.png"
                    alt="Body Care Collection"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                    <h3 className="text-3xl font-light mb-2">바디케어 컬렉션</h3>
                    <p className="mb-4 text-white/90">전신을 위한 럭셔리 케어</p>
                    <Button variant="secondary" size="sm">
                      둘러보기
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-3xl font-light tracking-tight">뉴스레터 구독</h2>
            <p className="text-muted-foreground">최신 제품과 특별한 혜택을 가장 먼저 만나보세요</p>
            <div className="flex gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="이메일을 입력하세요"
                className="flex-1 px-4 py-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button className="bg-primary hover:bg-primary/90">구독하기</Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { productAPI } from '../api';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Minus, Plus, ShoppingCart, ChevronDown } from 'lucide-react';
import './ProductDetail.css';

function ProductDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category');
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showNotification, setShowNotification] = useState(false);

  // Accordion states
  const [showDescription, setShowDescription] = useState(true);
  const [showIngredients, setShowIngredients] = useState(false);
  const [showUsage, setShowUsage] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id, category]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const data = await productAPI.getById(id, category);
      setProduct(data);
      setError(null);
    } catch (err) {
      setError('상품 정보를 불러오는데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category,
        image: product.image,
        quantity: quantity,
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));

    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    setTimeout(() => navigate('/cart'), 500);
  };

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" role="status">
            <span className="sr-only">로딩 중...</span>
          </div>
          <p className="mt-4 text-muted-foreground">상품 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-destructive">{error || '상품을 찾을 수 없습니다'}</p>
          <Button onClick={() => navigate('/products')}>상품 목록으로 돌아가기</Button>
        </div>
      </div>
    );
  }

  // Mock image gallery (using main image multiple times for demo)
  const productImages = product.image ? [product.image] : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Notification */}
      {showNotification && (
        <div className="fixed top-20 right-4 z-50 bg-primary text-primary-foreground px-6 py-3 rounded-lg shadow-lg animate-in fade-in slide-in-from-top-2">
          장바구니에 추가되었습니다!
        </div>
      )}

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Product Content */}
        <div className="grid md:grid-cols-2 gap-12">
          {/* Left Column - Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
              {product.image ? (
                <img
                  src={productImages[selectedImage] || product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl text-muted-foreground">
                  {product.name?.charAt(0) || 'P'}
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {productImages.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {productImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square overflow-hidden rounded-md border-2 ${
                      selectedImage === idx ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Product Info */}
          <div className="space-y-6">
            {/* Product Title */}
            <div>
              <h1 className="text-3xl font-light tracking-tight mb-2">{product.name}</h1>
              <p className="text-sm text-muted-foreground">{product.description || '프리미엄 천연 스킨케어 제품입니다.'}</p>
            </div>

            {/* Price */}
            <div className="text-3xl font-medium">{product.price?.toLocaleString()}원</div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {product.stock > 0 ? (
                <span className="text-sm text-green-600">재고 있음 ({product.stock}개)</span>
              ) : (
                <span className="text-sm text-destructive">품절</span>
              )}
            </div>

            {/* Quantity Selector */}
            {product.stock > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium">수량</label>
                  <div className="flex items-center border border-border rounded-md">
                    <button
                      onClick={decrementQuantity}
                      className="p-2 hover:bg-muted transition-colors"
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-6 py-2 border-x border-border min-w-[60px] text-center">{quantity}</span>
                    <button
                      onClick={incrementQuantity}
                      className="p-2 hover:bg-muted transition-colors"
                      disabled={quantity >= product.stock}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleAddToCart}
                    variant="outline"
                    className="flex-1"
                    size="lg"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    장바구니 담기
                  </Button>
                  <Button
                    onClick={handleBuyNow}
                    className="flex-1 bg-primary hover:bg-primary/90"
                    size="lg"
                  >
                    구매하기
                  </Button>
                </div>
              </div>
            )}

            {/* Product Features (Icons) */}
            <div className="grid grid-cols-4 gap-4 pt-6 border-t border-border">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                  <span className="text-xs">천연</span>
                </div>
                <span className="text-xs text-muted-foreground">100% 천연</span>
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                  <span className="text-xs">무첨가</span>
                </div>
                <span className="text-xs text-muted-foreground">화학성분 무첨가</span>
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                  <span className="text-xs">친환경</span>
                </div>
                <span className="text-xs text-muted-foreground">친환경 포장</span>
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                  <span className="text-xs">비건</span>
                </div>
                <span className="text-xs text-muted-foreground">비건 인증</span>
              </div>
            </div>

            {/* Accordion Sections */}
            <div className="space-y-2 pt-6 border-t border-border">
              {/* Description */}
              <Card className="border-0 shadow-none">
                <button
                  onClick={() => setShowDescription(!showDescription)}
                  className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                >
                  <span className="font-medium">제품설명</span>
                  <ChevronDown className={`w-5 h-5 transition-transform ${showDescription ? 'rotate-180' : ''}`} />
                </button>
                {showDescription && (
                  <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">
                    <p>{product.description || '이 제품은 천연 성분으로 만들어진 프리미엄 스킨케어 제품입니다. 피부에 자극을 주지 않으며, 모든 피부 타입에 사용 가능합니다.'}</p>
                  </div>
                )}
              </Card>

              {/* Ingredients */}
              <Card className="border-0 shadow-none">
                <button
                  onClick={() => setShowIngredients(!showIngredients)}
                  className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                >
                  <span className="font-medium">성분</span>
                  <ChevronDown className={`w-5 h-5 transition-transform ${showIngredients ? 'rotate-180' : ''}`} />
                </button>
                {showIngredients && (
                  <div className="px-4 pb-4 text-sm text-muted-foreground">
                    <p>천연 식물 추출물, 유기농 오일, 비타민 E, 히알루론산</p>
                  </div>
                )}
              </Card>

              {/* Usage */}
              <Card className="border-0 shadow-none">
                <button
                  onClick={() => setShowUsage(!showUsage)}
                  className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                >
                  <span className="font-medium">사용 방법</span>
                  <ChevronDown className={`w-5 h-5 transition-transform ${showUsage ? 'rotate-180' : ''}`} />
                </button>
                {showUsage && (
                  <div className="px-4 pb-4 text-sm text-muted-foreground">
                    <p>세안 후 적당량을 손바닥에 덜어 얼굴 전체에 부드럽게 펴 발라줍니다. 아침, 저녁으로 사용하시면 더욱 효과적입니다.</p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;

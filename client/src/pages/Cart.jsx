import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Minus, Plus } from 'lucide-react';
import './Cart.css';

function Cart() {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(savedCart);
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(id);
      return;
    }

    const updatedCart = cart.map(item =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    );
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const removeItem = (id) => {
    const updatedCart = cart.filter(item => item.id !== id);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const getSubtotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getShippingFee = () => {
    return 0; // 무료 배송
  };

  const getTotalPrice = () => {
    return getSubtotal() + getShippingFee();
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('장바구니가 비어있습니다!');
      return;
    }
    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="empty-cart">
            <h1>장바구니</h1>
            <p>장바구니가 비어있습니다.</p>
            <button onClick={() => navigate('/products')} className="btn-continue">
              쇼핑 계속하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <div className="cart-layout">
          {/* Left Column - Cart Items */}
          <div className="cart-items-section">
            <div className="cart-header">
              <button onClick={() => navigate(-1)} className="back-button">
                <ArrowLeft size={20} />
              </button>
              <h1>장바구니</h1>
            </div>

            <div className="cart-items-list">
              {cart.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="item-image">
                    {item.image ? (
                      <img src={item.image} alt={item.name} />
                    ) : (
                      <div className="placeholder-image">
                        <span>{item.name?.charAt(0) || 'P'}</span>
                      </div>
                    )}
                  </div>

                  <div className="item-details">
                    <h3 className="item-name">{item.name}</h3>
                    <p className="item-sku">SKU: {item.id}</p>
                    <p className="item-price">₩{item.price.toLocaleString()}</p>
                  </div>

                  <div className="item-actions">
                    <div className="quantity-controls">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="qty-btn"
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={16} />
                      </button>
                      <span className="quantity">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="qty-btn"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <p className="item-total">₩{(item.price * item.quantity).toLocaleString()}</p>

                    <button onClick={() => removeItem(item.id)} className="remove-btn">
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="order-summary-section">
            <div className="order-summary">
              <h2>주문 요약</h2>

              <div className="summary-details">
                <div className="summary-row">
                  <span>상품 수량 ({getTotalItems()}개)</span>
                  <span>₩{getSubtotal().toLocaleString()}</span>
                </div>
                <div className="summary-row">
                  <span>배송비</span>
                  <span>{getShippingFee() === 0 ? '무료' : `₩${getShippingFee().toLocaleString()}`}</span>
                </div>
              </div>

              <div className="summary-total">
                <span>총 결제금액</span>
                <span className="total-price">₩{getTotalPrice().toLocaleString()}</span>
              </div>

              <button onClick={handleCheckout} className="checkout-btn">
                결제하기
              </button>

              <button onClick={() => navigate('/products')} className="continue-shopping-link">
                쇼핑 계속하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;

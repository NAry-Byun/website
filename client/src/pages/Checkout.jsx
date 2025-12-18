import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock } from 'lucide-react';
import { orderAPI } from '../api';
import './Checkout.css';

function Checkout() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);

  // 포트원 결제 모듈 초기화
  useEffect(() => {
    const IMP = window.IMP;
    if (IMP) {
      IMP.init('imp72457828'); // 고객사 식별코드
    }
  }, []);

  const cart = JSON.parse(localStorage.getItem('cart') || '[]');

  const getSubtotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTax = () => {
    return Math.round(getSubtotal() * 0.08); // 8% 세금
  };

  const getShippingFee = () => {
    return 0; // 무료 배송
  };

  const getTotalAmount = () => {
    return getSubtotal() + getTax() + getShippingFee();
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();

    // 배송 정보 유효성 검증
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.address) {
      alert('배송 정보를 모두 입력해주세요.');
      return;
    }

    if (cart.length === 0) {
      alert('장바구니가 비어있습니다!');
      return;
    }

    const IMP = window.IMP;
    if (!IMP) {
      alert('결제 모듈을 불러오는데 실패했습니다. 페이지를 새로고침해주세요.');
      return;
    }

    try {
      setLoading(true);
      setCurrentStep(2);

      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const merchantUid = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // 포트원 결제 요청
      IMP.request_pay(
        {
          pg: 'html5_inicis', // PG사 (이니시스)
          pay_method: 'card', // 결제 수단
          merchant_uid: merchantUid, // 주문번호
          name: cart.length === 1 ? cart[0].name : `${cart[0].name} 외 ${cart.length - 1}건`, // 주문명
          amount: getTotalAmount(), // 결제 금액
          buyer_email: formData.email,
          buyer_name: `${formData.firstName} ${formData.lastName}`,
          buyer_tel: formData.phone,
          buyer_addr: formData.address,
        },
        async (rsp) => {
          // 결제 성공 여부 확인
          if (rsp.success) {
            // 결제 성공 시 주문 생성
            try {
              setCurrentStep(3);

              const orderData = {
                userId: user.id || 'guest',
                items: cart.map(item => ({
                  productId: item.id,
                  name: item.name,
                  price: item.price,
                  quantity: item.quantity,
                  category: item.category,
                  image: item.image,
                })),
                totalAmount: getTotalAmount(),
                tax: getTax(),
                shippingFee: getShippingFee(),
                status: 'pending',
                shippingAddress: {
                  firstName: formData.firstName,
                  lastName: formData.lastName,
                  email: formData.email,
                  phone: formData.phone,
                  address: formData.address,
                },
                paymentInfo: {
                  imp_uid: rsp.imp_uid,
                  merchant_uid: rsp.merchant_uid,
                  paid_amount: rsp.paid_amount,
                  pay_method: rsp.pay_method,
                  paid_at: rsp.paid_at,
                },
              };

              const response = await orderAPI.create(orderData);
              console.log('주문 생성 응답:', response);

              localStorage.removeItem('cart');
              window.dispatchEvent(new Event('storage'));

              // 주문 성공 페이지로 이동 (response 또는 response.data 확인)
              const createdOrder = response.data || response;
              console.log('생성된 주문:', createdOrder);

              navigate('/order-success', { state: { order: createdOrder } });
            } catch (error) {
              console.error('주문 생성 실패:', error);
              alert('결제는 완료되었으나 주문 생성에 실패했습니다. 고객센터에 문의해주세요.');
              setCurrentStep(1);
            }
          } else {
            // 결제 실패
            alert(`결제에 실패했습니다.\n${rsp.error_msg}`);
            setCurrentStep(1);
          }
          setLoading(false);
        }
      );
    } catch (error) {
      console.error('결제 오류:', error);
      alert('결제 중 오류가 발생했습니다. 다시 시도해주세요.');
      setCurrentStep(1);
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="empty-checkout">
            <h1>체크아웃</h1>
            <p>장바구니가 비어있습니다.</p>
            <button onClick={() => navigate('/products')} className="btn-go-products">
              상품 보러가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="container">
        {/* Header */}
        <div className="checkout-header">
          <button onClick={() => navigate(-1)} className="back-button">
            <ArrowLeft size={20} />
          </button>
          <h1>Checkout</h1>
        </div>

        {/* Progress Steps */}
        <div className="checkout-steps">
          <div className={`step ${currentStep === 1 ? 'active' : ''}`}>
            <div className="step-number">1</div>
            <span className="step-label">Shipping</span>
          </div>
          <div className={`step ${currentStep === 2 ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <span className="step-label">Payment</span>
          </div>
          <div className={`step ${currentStep === 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <span className="step-label">Review</span>
          </div>
        </div>

        <div className="checkout-layout">
          {/* Left Column - Shipping Form */}
          <div className="checkout-form-section">
            <div className="form-card">
              <div className="form-header">
                <h2>Shipping Information</h2>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="John"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 123-4567"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">Address</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="123 Main Street"
                  required
                />
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="order-summary-section">
            <div className="order-summary-card">
              <h2>Order Summary</h2>

              <div className="order-items">
                {cart.map((item, index) => (
                  <div key={item.id} className="order-item">
                    <div className="item-badge">{index + 1}</div>
                    <div className="item-image">
                      {item.image ? (
                        <img src={item.image} alt={item.name} />
                      ) : (
                        <div className="placeholder-image">
                          <span>{item.name?.charAt(0) || 'P'}</span>
                        </div>
                      )}
                    </div>
                    <div className="item-info">
                      <h3>{item.name}</h3>
                      <p className="item-variant">M - Blue</p>
                      <div className="item-pricing">
                        <span className="item-price">₩{item.price.toLocaleString()}</span>
                        {item.quantity > 1 && (
                          <span className="item-original">₩{(item.price * 1.2).toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="summary-details">
                <div className="summary-row">
                  <span>Subtotal ({getTotalItems()} items)</span>
                  <span>₩{getSubtotal().toLocaleString()}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <span className="free-shipping">FREE</span>
                </div>
                <div className="summary-row">
                  <span>Tax</span>
                  <span>₩{getTax().toLocaleString()}</span>
                </div>
              </div>

              <div className="summary-total">
                <span>Total</span>
                <span className="total-amount">₩{getTotalAmount().toLocaleString()}</span>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="place-order-btn"
              >
                <Lock size={18} />
                {loading ? 'Processing...' : 'PLACE ORDER'}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Checkout;

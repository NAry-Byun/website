import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import './OrderSuccess.css';

function OrderSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const [orderInfo, setOrderInfo] = useState(null);

  useEffect(() => {
    // location.state에서 주문 정보 가져오기
    if (location.state?.order) {
      setOrderInfo(location.state.order);
    } else {
      // 주문 정보가 없으면 홈으로 리다이렉트
      navigate('/');
    }
  }, [location, navigate]);

  if (!orderInfo) {
    return null;
  }

  return (
    <div className="order-success-page">
      <div className="container">
        <div className="success-card">
          <div className="success-icon">
            <CheckCircle size={80} />
          </div>

          <h1>주문이 완료되었습니다!</h1>
          <p className="success-message">
            주문해 주셔서 감사합니다. 주문 확인 이메일이 발송되었습니다.
          </p>

          <div className="order-details">
            <h2>주문 정보</h2>
            <div className="detail-row">
              <span className="label">주문 번호</span>
              <span className="value">{orderInfo.id}</span>
            </div>
            <div className="detail-row">
              <span className="label">주문 일시</span>
              <span className="value">
                {new Date(orderInfo.createdAt).toLocaleString('ko-KR')}
              </span>
            </div>
            <div className="detail-row">
              <span className="label">주문 상태</span>
              <span className="value status">{orderInfo.status === 'pending' ? '주문 접수' : orderInfo.status}</span>
            </div>
          </div>

          <div className="order-summary">
            <h2>주문 상품</h2>
            <div className="order-items">
              {orderInfo.items.map((item, index) => (
                <div key={index} className="order-item">
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
                    <p>수량: {item.quantity}개</p>
                    <p className="item-price">₩{item.price.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="payment-summary">
            <div className="summary-row">
              <span>상품 금액</span>
              <span>₩{(orderInfo.totalAmount - orderInfo.tax - orderInfo.shippingFee).toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span>배송비</span>
              <span>{orderInfo.shippingFee === 0 ? '무료' : `₩${orderInfo.shippingFee.toLocaleString()}`}</span>
            </div>
            <div className="summary-row">
              <span>세금</span>
              <span>₩{orderInfo.tax.toLocaleString()}</span>
            </div>
            <div className="summary-row total">
              <span>총 결제 금액</span>
              <span>₩{orderInfo.totalAmount.toLocaleString()}</span>
            </div>
          </div>

          <div className="shipping-info">
            <h2>배송 정보</h2>
            <p><strong>받는 분:</strong> {orderInfo.shippingAddress.firstName} {orderInfo.shippingAddress.lastName}</p>
            <p><strong>연락처:</strong> {orderInfo.shippingAddress.phone}</p>
            <p><strong>이메일:</strong> {orderInfo.shippingAddress.email}</p>
            <p><strong>주소:</strong> {orderInfo.shippingAddress.address}</p>
          </div>

          <div className="action-buttons">
            <button onClick={() => navigate('/orders')} className="btn-orders">
              주문 내역 보기
            </button>
            <button onClick={() => navigate('/')} className="btn-home">
              홈으로 가기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccess;

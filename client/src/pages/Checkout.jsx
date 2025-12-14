import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderAPI } from '../api';
import './Checkout.css';

function Checkout() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userId: '',
    name: '',
    email: '',
    address: '',
    city: '',
    zipCode: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);

  const cart = JSON.parse(localStorage.getItem('cart') || '[]');

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    try {
      setLoading(true);

      const orderData = {
        userId: formData.userId || 'guest',
        items: cart.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        totalAmount: parseFloat(getTotalAmount()),
        status: 'pending',
        shippingAddress: {
          name: formData.name,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          zipCode: formData.zipCode,
          phone: formData.phone,
        },
      };

      await orderAPI.create(orderData);
      localStorage.removeItem('cart');
      alert('Order placed successfully!');
      navigate('/orders');
    } catch (error) {
      alert('Failed to place order. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="checkout empty-checkout">
        <h1>Checkout</h1>
        <p>Your cart is empty.</p>
        <button onClick={() => navigate('/products')}>Go to Products</button>
      </div>
    );
  }

  return (
    <div className="checkout">
      <h1>Checkout</h1>

      <div className="checkout-container">
        <div className="checkout-form">
          <h2>Shipping Information</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>User ID (optional)</label>
              <input
                type="text"
                name="userId"
                value={formData.userId}
                onChange={handleChange}
                placeholder="Enter your user ID or leave blank for guest checkout"
              />
            </div>

            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Address *</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Zip Code *</label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Phone *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" disabled={loading} className="place-order-btn">
              {loading ? 'Processing...' : 'Place Order'}
            </button>
          </form>
        </div>

        <div className="order-summary">
          <h2>Order Summary</h2>
          <div className="summary-items">
            {cart.map((item) => (
              <div key={item.id} className="summary-item">
                <span>{item.name} x {item.quantity}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="summary-total">
            <span>Total:</span>
            <span>${getTotalAmount()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;

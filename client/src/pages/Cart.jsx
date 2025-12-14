import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <div className="cart empty-cart">
        <h1>Shopping Cart</h1>
        <p>Your cart is empty.</p>
        <button onClick={() => navigate('/products')} className="continue-shopping">
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="cart">
      <h1>Shopping Cart</h1>

      <div className="cart-items">
        {cart.map((item) => (
          <div key={item.id} className="cart-item">
            <div className="item-info">
              <h3>{item.name}</h3>
              <p className="item-category">{item.category}</p>
              <p className="item-price">${item.price}</p>
            </div>

            <div className="item-controls">
              <div className="quantity-controls">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
              </div>

              <p className="item-total">${(item.price * item.quantity).toFixed(2)}</p>

              <button onClick={() => removeItem(item.id)} className="remove-btn">
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <div className="summary-row">
          <span>Subtotal:</span>
          <span>${getTotalPrice()}</span>
        </div>
        <div className="summary-row total">
          <span>Total:</span>
          <span>${getTotalPrice()}</span>
        </div>

        <button onClick={handleCheckout} className="checkout-btn">
          Proceed to Checkout
        </button>

        <button onClick={() => navigate('/products')} className="continue-shopping">
          Continue Shopping
        </button>
      </div>
    </div>
  );
}

export default Cart;

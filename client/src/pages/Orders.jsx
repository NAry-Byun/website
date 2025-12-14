import { useState, useEffect } from 'react';
import { orderAPI } from '../api';
import './Orders.css';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderAPI.getAll();
      setOrders(data);
      setError(null);
    } catch (err) {
      setError('Failed to load orders.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserOrders = async () => {
    if (!userId.trim()) {
      fetchOrders();
      return;
    }

    try {
      setLoading(true);
      const data = await orderAPI.getByUserId(userId);
      setOrders(data);
      setError(null);
    } catch (err) {
      setError('Failed to load orders for this user.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#ffc107';
      case 'processing':
        return '#17a2b8';
      case 'shipped':
        return '#007bff';
      case 'delivered':
        return '#28a745';
      case 'cancelled':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  if (loading) {
    return <div className="loading">Loading orders...</div>;
  }

  return (
    <div className="orders">
      <h1>Orders</h1>

      <div className="filter-section">
        <input
          type="text"
          placeholder="Filter by User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
        <button onClick={fetchUserOrders}>Filter</button>
        <button onClick={() => { setUserId(''); fetchOrders(); }}>Clear</button>
      </div>

      {error && <div className="error">{error}</div>}

      {orders.length === 0 ? (
        <p className="no-orders">No orders found.</p>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div>
                  <h3>Order #{order.id}</h3>
                  <p className="order-date">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className="order-status"
                  style={{ backgroundColor: getStatusColor(order.status) }}
                >
                  {order.status}
                </span>
              </div>

              <div className="order-items">
                <h4>Items:</h4>
                {order.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <span>{item.name} x {item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {order.shippingAddress && (
                <div className="shipping-address">
                  <h4>Shipping Address:</h4>
                  <p>{order.shippingAddress.name}</p>
                  <p>{order.shippingAddress.address}</p>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.zipCode}</p>
                  <p>{order.shippingAddress.phone}</p>
                </div>
              )}

              <div className="order-total">
                <strong>Total: ${order.totalAmount.toFixed(2)}</strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Orders;

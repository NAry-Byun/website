import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { productAPI } from '../api';
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
      setError('Failed to load product details.');
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
        quantity: quantity,
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Added to cart!');
  };

  if (loading) {
    return <div className="loading">Loading product...</div>;
  }

  if (error || !product) {
    return (
      <div className="error">
        <p>{error || 'Product not found'}</p>
        <button onClick={() => navigate('/products')}>Back to Products</button>
      </div>
    );
  }

  return (
    <div className="product-detail">
      <button onClick={() => navigate('/products')} className="back-button">
        ← Back to Products
      </button>

      <div className="detail-container">
        <div className="detail-image">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} />
          ) : (
            <div className="placeholder-image">No Image</div>
          )}
        </div>

        <div className="detail-info">
          <h1>{product.name}</h1>
          <p className="category">Category: {product.category}</p>
          <p className="price">${product.price}</p>
          <p className="description">{product.description || 'No description available.'}</p>

          <div className="stock-info">
            {product.stock > 0 ? (
              <span className="in-stock">In Stock: {product.stock}</span>
            ) : (
              <span className="out-of-stock">Out of Stock</span>
            )}
          </div>

          {product.stock > 0 && (
            <div className="purchase-section">
              <div className="quantity-selector">
                <label>Quantity:</label>
                <input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                />
              </div>
              <button onClick={handleAddToCart} className="add-to-cart-btn">
                Add to Cart
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;

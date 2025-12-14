import { Link } from 'react-router-dom';
import './ProductCard.css';

function ProductCard({ product }) {
  const renderStars = (rating = 4.5) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) {
        stars.push(
          <svg key={i} width="12" height="12" viewBox="0 0 12 12" fill="#4A90E2">
            <path d="M6 0l1.545 4.755h5l-4.045 2.94 1.545 4.755L6 9.51l-4.045 2.94 1.545-4.755L0 4.755h5L6 0z"/>
          </svg>
        );
      } else if (i - rating < 1) {
        stars.push(
          <svg key={i} width="12" height="12" viewBox="0 0 12 12" fill="#4A90E2" opacity="0.5">
            <path d="M6 0l1.545 4.755h5l-4.045 2.94 1.545 4.755L6 9.51l-4.045 2.94 1.545-4.755L0 4.755h5L6 0z"/>
          </svg>
        );
      } else {
        stars.push(
          <svg key={i} width="12" height="12" viewBox="0 0 12 12" fill="#E0E0E0">
            <path d="M6 0l1.545 4.755h5l-4.045 2.94 1.545 4.755L6 9.51l-4.045 2.94 1.545-4.755L0 4.755h5L6 0z"/>
          </svg>
        );
      }
    }
    return stars;
  };

  const reviewCount = product.reviews || Math.floor(Math.random() * 100) + 1;
  const isBestSeller = product.bestSeller || Math.random() > 0.7;

  return (
    <div className="product-card">
      {isBestSeller && <span className="best-seller-badge">Best Seller</span>}

      <Link
        to={`/products/${product.id}?category=${product.category}`}
        className="product-link"
      >
        <div className="product-image">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} />
          ) : (
            <div className="placeholder-image">
              <span>{product.name?.charAt(0) || 'P'}</span>
            </div>
          )}
          <button className="add-to-bag">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M3 3h10l1 10H2L3 3zm5-2v2m-2 0h4"/>
            </svg>
          </button>
        </div>

        <div className="product-info">
          <div className="rating">
            {renderStars()}
            <span className="review-count">{reviewCount} reviews</span>
          </div>

          <h3 className="product-name">{product.name}</h3>
          <p className="product-price">${product.price?.toFixed(2)}</p>

          {product.description && (
            <p className="product-description">
              Helps with: {product.description}
            </p>
          )}
        </div>
      </Link>
    </div>
  );
}

export default ProductCard;

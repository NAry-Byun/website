import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { productAPI } from '../api';
import ProductCard from '../components/ProductCard';
import './Products.css';

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productAPI.getAll();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError('Failed to load products. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = categoryFilter
    ? products.filter(p => p.category?.toLowerCase() === categoryFilter.toLowerCase())
    : products;

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="products-page">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link to="/">Home</Link>
        <span> &gt; </span>
        <Link to="/products">Collection</Link>
        {categoryFilter && (
          <>
            <span> &gt; </span>
            <span>{categoryFilter}</span>
          </>
        )}
      </div>

      {/* Page Header */}
      <div className="page-header">
        <h1>BODY CARE</h1>
      </div>

      {/* Filter and View Controls */}
      <div className="controls-bar">
        <button
          className="filter-button"
          onClick={() => setShowFilters(!showFilters)}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Filter
        </button>

        <div className="view-controls">
          <button className="view-button active">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <rect width="7" height="7" />
              <rect x="9" width="7" height="7" />
              <rect y="9" width="7" height="7" />
              <rect x="9" y="9" width="7" height="7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <p className="no-products">No products available at the moment.</p>
      ) : (
        <div className="products-grid">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Products;

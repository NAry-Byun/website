import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import './Products.css';

const API_URL = "http://localhost:3000/api";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category');

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2; // 페이지당 2개씩 표시

  useEffect(() => {
    fetchProducts();
    setCurrentPage(1); // 카테고리 변경시 첫 페이지로
  }, [categoryFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let url = `${API_URL}/products`;

      // 카테고리 필터가 있으면 해당 카테고리만 가져오기
      if (categoryFilter) {
        url = `${API_URL}/products/category/${categoryFilter}`;
      }

      const response = await axios.get(url);
      setProducts(response.data);
      setError(null);
    } catch (err) {
      setError('상품을 불러오는데 실패했습니다. 나중에 다시 시도해주세요.');
      console.error('상품 조회 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  // 페이지네이션 계산
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = products.slice(startIndex, endIndex);

  // 페이지 변경 핸들러
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="products-page">
        <div className="loading" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" role="status">
            <span className="sr-only">로딩 중...</span>
          </div>
          <p style={{ marginTop: '16px', color: '#666' }}>상품을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="products-page">
        <div className="error" style={{ textAlign: 'center', padding: '60px 20px', color: '#dc2626' }}>
          <p>{error}</p>
          <button
            onClick={fetchProducts}
            style={{ marginTop: '16px', padding: '8px 24px', border: '1px solid #dc2626', background: 'white', cursor: 'pointer' }}
          >
            다시 시도
          </button>
        </div>
      </div>
    );
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
        <h1>{categoryFilter ? categoryFilter.toUpperCase() : 'ALL PRODUCTS'}</h1>
        <p style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
          {products.length}개의 상품
        </p>
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
      {products.length === 0 ? (
        <p className="no-products" style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>
          {categoryFilter ? `${categoryFilter} 카테고리에 등록된 상품이 없습니다.` : '등록된 상품이 없습니다.'}
        </p>
      ) : (
        <>
          <div className="products-grid">
            {currentProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pagination" style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px',
              marginTop: '40px',
              marginBottom: '40px'
            }}>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #ddd',
                  background: currentPage === 1 ? '#f5f5f5' : 'white',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  opacity: currentPage === 1 ? 0.5 : 1
                }}
              >
                이전
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    background: currentPage === pageNum ? '#000' : 'white',
                    color: currentPage === pageNum ? '#fff' : '#000',
                    cursor: 'pointer',
                    fontWeight: currentPage === pageNum ? 'bold' : 'normal'
                  }}
                >
                  {pageNum}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #ddd',
                  background: currentPage === totalPages ? '#f5f5f5' : 'white',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  opacity: currentPage === totalPages ? 0.5 : 1
                }}
              >
                다음
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Products;

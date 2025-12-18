import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Layout from './components/Layout';
import './App.css';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const Orders = lazy(() => import('./pages/Orders'));
const Signup = lazy(() => import('./pages/Signup'));
const Login = lazy(() => import('./pages/Login'));
const Admin = lazy(() => import('./pages/Admin'));
const ProductManagement = lazy(() => import('./pages/ProductManagement'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
        <span className="sr-only">로딩 중...</span>
      </div>
      <p className="mt-2 text-sm text-gray-600">페이지를 불러오는 중...</p>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="products" element={<Products />} />
            <Route path="products/:id" element={<ProductDetail />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="order-success" element={<OrderSuccess />} />
            <Route path="orders" element={<Orders />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path="signup" element={<Signup />} />
          <Route path="login" element={<Login />} />
          <Route path="admin" element={<Admin />} />
          <Route path="admin/products" element={<ProductManagement />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;

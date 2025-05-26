import './App.css';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import MainPage from './pages/MainPage';
import LoginPage from './pages/LoginPage';
import { useEffect, useState } from 'react';
import SignupPage from './pages/SignupPage';
import KakaoCallback from './pages/KaKaoCallback';
import MyPage from './pages/MyPage';
import UserUpdate from './pages/UserUpdate';
import SignupType from './pages/SignupType';
import OrderListDetail from './pages/OrderListDetail';
import OrderList from './pages/OrderList';
import AdminMain from './pages/admin/AdminMain';
import ChattingPage from './pages/ChattingPage';
import PickupRequestPage from './pages/PickupRequestPage';
import PickupResultPage from './pages/PickupResultPage';
import PickupCompletePage from './pages/PickupCompletePage';
import PickupList from './pages/PickupList';
import PickupListDetail from './pages/PickupListDetail';
import PickupLocation from './pages/PickupLocation';
import ProductDetial from './pages/ProductDetailPage';
import PickupDeliverPage from './pages/PickupDeliverPage';
import SearchResultsPage from './pages/SearhResultsPage';
import DesignerProfilePage from './pages/DesignerProfilePage';
import TestPage from './pages/TestPage';
import CategoryProductsPage from './pages/CategoryProductsPage';
import ShoppingCart from './pages/ShoppingCart';
import PaymentCheckPage from './pages/PaymentCheckPage';
import PaymentProcessPape from './pages/PaymentProcessPape';
import PaymentFailedPage from './pages/PaymentFailedPage';
import PaymentCompletePage from './pages/PaymentCompletePage';

function AppContent() {
  const [role, setRole] = useState('user');
  const navigate = useNavigate();

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (storedRole) {
      setRole(storedRole);
      if (storedRole === 'admin') {
        navigate("/admin-main");
      } else if (storedRole === 'Deliver') {
        navigate("/deliver-main");
      }
    }
  }, [navigate]);

  useEffect(() => {
    if (role === 'admin') {
      navigate("/admin-main");
    } else if (role === 'Deliver') {
      navigate("/deliver-main");
    }
  }, [role, navigate]);

  return (
    <div className={role === 'admin' ? 'web-container' : role === 'Deliver' ? 'mobile-container' : 'mobile-container'}>
      <Routes>
        {/* ✅ 관리자 전용 라우트 - 권한 체크 추가 */}
        <Route
          path="/admin-main"
          element={
            role === 'admin' ?
              <AdminMain setRole={setRole} /> :
              <Navigate to="/" replace />
          }
        />

        {/* ✅ 배송기사 전용 라우트 - 권한 체크 추가 */}
        <Route
          path="/deliver-main"
          element={
            role === 'Deliver' ?
              <PickupDeliverPage setRole={setRole} /> :
              <Navigate to="/" replace />
          }
        />

        {/* 일반 사용자 라우트들 */}
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<LoginPage setRole={setRole} />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/auth" element={<KakaoCallback />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/user-update" element={<UserUpdate />} />
        <Route path="/signup-type" element={<SignupType />} />
        <Route path="/order-list" element={<OrderList />} />
        <Route path="/order-list-detail" element={<OrderListDetail />} />
        <Route path="/chat" element={<ChattingPage />} />
        <Route path="/pickup-request" element={<PickupRequestPage />} />
        <Route path="/pickup/result" element={<PickupResultPage />} />
        <Route path="/pickup/complete" element={<PickupCompletePage />} />
        <Route path="/pickup-list" element={<PickupList />} />
        <Route path="/pickup-list-detail/:pickupId" element={<PickupListDetail />} />
        <Route path="/pickup-location" element={<PickupLocation />} />
        <Route path="/product-detail" element={<ProductDetial />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/designer" element={<DesignerProfilePage />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="/category-products" element={<CategoryProductsPage />} />
        <Route path="/cart" element={<ShoppingCart />} />
        <Route path="/payment-check" element={<PaymentCheckPage />} />
        <Route path="/payment-process" element={<PaymentProcessPape />} />
        <Route path="/payment-failed" element={<PaymentFailedPage />} />
        <Route path="/payment-complete" element={<PaymentCompletePage />} />
      </Routes>
    </div>
  );
}


function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppContent />
    </Router>
  );
}

export default App;

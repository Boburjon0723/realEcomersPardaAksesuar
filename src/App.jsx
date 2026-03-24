// ==========================================
// src/App.jsx - ASOSIY FAYL (React Router + URL)
// ==========================================
import React, { useEffect } from 'react';
import { Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { useApp } from './hooks/useApp';

// Layout
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import FloatingContacts from './components/layout/FloatingContacts';

// Pages
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import ContactPage from './pages/ContactPage';
import MyOrdersPage from './pages/MyOrdersPage';
import ProfilePage from './pages/ProfilePage';
import AlbumPage from './pages/AlbumPage';
import ShippingPage from './pages/ShippingPage';
import ReturnsPage from './pages/ReturnsPage';
import FaqPage from './pages/FaqPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import NotFoundPage from './pages/NotFoundPage';

// Components
import AuthModal from './components/auth/AuthModal';
import ChangePasswordModal from './components/auth/ChangePasswordModal';
import ErrorBoundary from './components/common/ErrorBoundary';
import { useLanguage } from './contexts/LanguageContext';

function ErrorBoundaryWrapper({ children }) {
  const { t } = useLanguage();
  return <ErrorBoundary t={t}>{children}</ErrorBoundary>;
}

function MainLayout() {
  const location = useLocation();
  const { showAuth, showPasswordRecovery, setShowPasswordRecovery } = useApp();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-gray-900">
      <Header />
      <main className="flex-1 mt-20">
        <Outlet />
      </main>
      <FloatingContacts />
      <Footer />
      {showAuth && <AuthModal />}
      {showPasswordRecovery && (
        <ChangePasswordModal
          onClose={() => setShowPasswordRecovery(false)}
          onSuccess={() => setShowPasswordRecovery(false)}
        />
      )}
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="shop" element={<ShopPage />} />
        <Route path="product/:productId" element={<ProductPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="orders" element={<MyOrdersPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="album" element={<AlbumPage />} />
        <Route path="shipping" element={<ShippingPage />} />
        <Route path="returns" element={<ReturnsPage />} />
        <Route path="faq" element={<FaqPage />} />
        <Route path="terms" element={<TermsPage />} />
        <Route path="privacy" element={<PrivacyPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppProvider>
          <ErrorBoundaryWrapper>
            <AppRoutes />
          </ErrorBoundaryWrapper>
        </AppProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;

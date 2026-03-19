// ==========================================
// src/App.jsx - ASOSIY FAYL
// ==========================================
import React, { useEffect } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';

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
import ErrorBoundary from './components/common/ErrorBoundary';
import { useLanguage } from './contexts/LanguageContext';

function ErrorBoundaryWrapper({ children }) {
  const { t } = useLanguage();
  return <ErrorBoundary t={t}>{children}</ErrorBoundary>;
}

function MainApp() {
  const { currentPage, selectedProduct, showAuth } = useApp();

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-gray-900">
      <Header />

      <main className="flex-1 mt-20">
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'shop' && <ShopPage />}
        {currentPage === 'product' && selectedProduct && <ProductPage />}
        {currentPage === 'product' && !selectedProduct && <NotFoundPage />}
        {currentPage === 'cart' && <CartPage />}
        {currentPage === 'checkout' && <CheckoutPage />}
        {currentPage === 'about' && <AboutPage />}
        {currentPage === 'services' && <ServicesPage />}
        {currentPage === 'contact' && <ContactPage />}
        {currentPage === 'orders' && <MyOrdersPage />}
        {currentPage === 'profile' && <ProfilePage />}
        {currentPage === 'album' && <AlbumPage />}
        {currentPage === 'shipping' && <ShippingPage />}
        {currentPage === 'returns' && <ReturnsPage />}
        {currentPage === 'faq' && <FaqPage />}
        {currentPage === 'terms' && <TermsPage />}
        {currentPage === 'privacy' && <PrivacyPage />}
        {!['home', 'shop', 'product', 'cart', 'checkout', 'about', 'services', 'contact', 'orders', 'profile', 'album', 'shipping', 'returns', 'faq', 'terms', 'privacy'].includes(currentPage) && <NotFoundPage />}
      </main>

      <FloatingContacts />
      <Footer />

      {showAuth && <AuthModal />}
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppProvider>
          <ErrorBoundaryWrapper>
            <MainApp />
          </ErrorBoundaryWrapper>
        </AppProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
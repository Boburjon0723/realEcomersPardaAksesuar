import { useContext, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import { pathToPage, pageToPath } from '../config/routes';

/**
 * AppContext + React Router — havolalar, yangilash, SEO uchun URL
 */
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within AppProvider');
  }

  const navigate = useNavigate();
  const location = useLocation();
  const { setSelectedProduct, selectedProduct } = ctx;

  const currentPage = useMemo(() => pathToPage(location.pathname), [location.pathname]);

  const setCurrentPage = useCallback(
    (page, opts = {}) => {
      const { product, productId } = opts;

      if (page === 'product' && product) {
        setSelectedProduct(product);
        navigate(`/product/${product.id}`);
        return;
      }
      if (page === 'product' && productId) {
        navigate(`/product/${productId}`);
        return;
      }
      if (page === 'product' && selectedProduct?.id) {
        navigate(`/product/${selectedProduct.id}`);
        return;
      }

      navigate(pageToPath(page));
    },
    [navigate, setSelectedProduct, selectedProduct?.id]
  );

  return {
    ...ctx,
    currentPage,
    setCurrentPage,
    navigate,
    pathname: location.pathname,
  };
}

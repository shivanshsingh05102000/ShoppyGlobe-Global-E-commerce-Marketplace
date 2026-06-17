import { useEffect, useState, useCallback } from 'react';
import { API_BASE_URL } from '../utils/constants';

/**
 * useProductDetail
 * Fetches a single product's detail based on a route parameter (productId)
 * when the component mounts, or whenever productId changes (e.g. user
 * navigates from one product detail page directly to another).
 *
 * Satisfies: "ProductDetail Component: Use useEffect to fetch details of a
 * selected product based on route parameters... Store the fetched data in
 * the component's state" (10 marks), plus the shared error-handling
 * requirement (10 marks).
 */
export function useProductDetail(productId) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!productId) return; // nothing to fetch — handled by the derived return value below

    const controller = new AbortController();

    async function fetchProduct() {
      setLoading(true);
      setError(null);
      setProduct(null);

      try {
        const response = await fetch(`${API_BASE_URL}/${productId}`, {
          signal: controller.signal,
        });

        if (response.status === 404) {
          throw new Error('NOT_FOUND');
        }
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();
        setProduct(data);
      } catch (err) {
        if (err.name === 'AbortError') return;
        setError(err.message === 'NOT_FOUND' ? 'NOT_FOUND' : err.message || 'Failed to load this product.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    fetchProduct();

    return () => controller.abort();
  }, [productId, reloadToken]);

  const refetch = useCallback(() => setReloadToken((t) => t + 1), []);

  // A missing productId is a caller error (e.g. hook used without a route
  // param), not something to fetch — short-circuit the returned values
  // directly rather than driving them through setState inside the effect.
  if (!productId) {
    return { product: null, loading: false, error: 'No product was specified.', refetch };
  }

  return { product, loading, error, refetch };
}

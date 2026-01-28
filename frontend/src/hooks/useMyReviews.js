import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const DEFAULT_LIMIT = 10;

/**
 * Hook za dohvat vlastitih recenzija (profil).
 * @param {Object} options - { page, limit }
 * @returns {Object} - { items, page, pages, total, loading, error, refetch, deleteReview, mutating }
 */
export default function useMyReviews(options = {}) {
  const { page: initialPage = 1, limit = DEFAULT_LIMIT } = options;
  const [page, setPage] = useState(initialPage);
  const [data, setData] = useState({ items: [], total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mutating, setMutating] = useState(false);

  const fetchMyReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/reviews/me', { params: { page, limit } });
      if (response.data.success) {
        const { items, total, pages } = response.data.data;
        setData({ items, total, pages });
      } else {
        setError(response.data.message || 'Greška pri dohvaćanju recenzija');
        setData({ items: [], total: 0, pages: 0 });
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Greška pri dohvaćanju recenzija');
      setData({ items: [], total: 0, pages: 0 });
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchMyReviews();
  }, [fetchMyReviews]);

  const deleteReview = useCallback(
    async (reviewId) => {
      setMutating(true);
      try {
        const response = await api.delete(`/reviews/${reviewId}`);
        if (response.data.success) {
          await fetchMyReviews();
          return { success: true };
        }
        return { success: false, message: response.data.message };
      } catch (err) {
        const message = err.response?.data?.message || err.message;
        return { success: false, message };
      } finally {
        setMutating(false);
      }
    },
    [fetchMyReviews]
  );

  const goToPage = useCallback((newPage) => {
    setPage((p) => Math.max(1, newPage));
  }, []);

  return {
    items: data.items,
    page,
    pages: data.pages,
    total: data.total,
    limit,
    loading,
    error,
    refetch: fetchMyReviews,
    deleteReview,
    mutating,
    setPage,
    goToPage,
  };
}

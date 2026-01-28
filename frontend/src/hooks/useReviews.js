import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const DEFAULT_LIMIT = 10;

/**
 * Custom hook za dohvat recenzija alata i mutacije (create, update, delete).
 * @param {string} toolId - ID alata
 * @param {Object} options - { page, limit }
 * @returns {Object} - { items, page, pages, total, loading, error, refetch, createReview, updateReview, deleteReview, mutating }
 */
const useReviews = (toolId, options = {}) => {
  const { page: initialPage = 1, limit = DEFAULT_LIMIT } = options;
  const [page, setPage] = useState(initialPage);
  const [data, setData] = useState({
    items: [],
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mutating, setMutating] = useState(false);

  const fetchReviews = useCallback(async () => {
    if (!toolId) {
      setData({ items: [], total: 0, pages: 0 });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/reviews/tools/${toolId}/reviews`, {
        params: { page, limit },
      });

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
  }, [toolId, page, limit]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const createReview = useCallback(
    async (payload) => {
      if (!toolId) throw new Error('ID alata nije naveden');
      setMutating(true);
      try {
        const response = await api.post(`/reviews/tools/${toolId}/reviews`, payload);
        if (response.data.success) {
          await fetchReviews();
          return { success: true, data: response.data.data };
        }
        return { success: false, message: response.data.message };
      } catch (err) {
        const message = err.response?.data?.message || err.message;
        return { success: false, message };
      } finally {
        setMutating(false);
      }
    },
    [toolId, fetchReviews]
  );

  const updateReview = useCallback(
    async (reviewId, payload) => {
      setMutating(true);
      try {
        const response = await api.put(`/reviews/${reviewId}`, payload);
        if (response.data.success) {
          await fetchReviews();
          return { success: true, data: response.data.data };
        }
        return { success: false, message: response.data.message };
      } catch (err) {
        const message = err.response?.data?.message || err.message;
        return { success: false, message };
      } finally {
        setMutating(false);
      }
    },
    [fetchReviews]
  );

  const deleteReview = useCallback(
    async (reviewId) => {
      setMutating(true);
      try {
        const response = await api.delete(`/reviews/${reviewId}`);
        if (response.data.success) {
          await fetchReviews();
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
    [fetchReviews]
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
    refetch: fetchReviews,
    createReview,
    updateReview,
    deleteReview,
    mutating,
    setPage,
    goToPage,
  };
};

export default useReviews;

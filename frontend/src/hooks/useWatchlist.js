import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

/**
 * Hook za watchlist: dohvat, dodavanje i uklanjanje alata.
 * @returns {Object} - { tools, loading, error, refetch, addToWatchlist, removeFromWatchlist, mutating }
 */
export default function useWatchlist() {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mutating, setMutating] = useState(false);

  const fetchWatchlist = useCallback(async () => {
    if (!localStorage.getItem('token')) {
      setTools([]);
      setLoading(false);
      setError(null);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/watchlist');
      if (response.data.success) {
        const wl = response.data.data.watchlist;
        setTools(Array.isArray(wl?.tools) ? wl.tools : []);
      } else {
        setTools([]);
        setError(response.data.message || 'Greška pri dohvaćanju watchliste');
      }
    } catch (err) {
      setTools([]);
      setError(err.response?.data?.message || err.message || 'Greška pri dohvaćanju watchliste');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  const addToWatchlist = useCallback(
    async (toolId) => {
      setMutating(true);
      try {
        const response = await api.post(`/watchlist/${toolId}`);
        if (response.data.success) {
          await fetchWatchlist();
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
    [fetchWatchlist]
  );

  const removeFromWatchlist = useCallback(
    async (toolId) => {
      setMutating(true);
      try {
        const response = await api.delete(`/watchlist/${toolId}`);
        if (response.data.success) {
          await fetchWatchlist();
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
    [fetchWatchlist]
  );

  return {
    tools,
    loading,
    error,
    refetch: fetchWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    mutating,
  };
}

import { useState, useEffect } from 'react';
import api from '../services/api';

/**
 * Custom hook for fetching and filtering tools
 * @param {Object} filters - Filter parameters
 * @returns {Object} - { tools, loading, error, pagination, refetch }
 */
const useTools = (filters = {}) => {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  });

  const fetchTools = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      
      // Add filters
      if (filters.search && filters.search.trim()) {
        params.append('search', filters.search.trim());
      }
      if (filters.category) params.append('category', filters.category);
      if (filters.pricing) params.append('pricing', filters.pricing);
      if (filters.minRating !== undefined && filters.minRating !== null) {
        params.append('minRating', filters.minRating);
      }
      if (filters.tags && filters.tags.length > 0) {
        params.append('tags', filters.tags.join(','));
      }
      if (filters.models && filters.models.length > 0) {
        params.append('models', filters.models.join(','));
      }
      if (filters.sort) params.append('sort', filters.sort);
      if (filters.order) params.append('order', filters.order);
      
      // Pagination
      const page = filters.page || 1;
      const limit = filters.limit || 12;
      params.append('page', page);
      params.append('limit', limit);

      const url = `/tools?${params.toString()}`;
      const response = await api.get(url);
      
      if (response.data.success) {
        setTools(response.data.data.items || []);
        setPagination({
          page: response.data.data.page || 1,
          limit: response.data.data.limit || 12,
          total: response.data.data.total || 0,
          pages: response.data.data.pages || 0,
        });
      } else {
        setError(response.data.message || 'Greška pri dohvaćanju alata');
        setTools([]);
      }
    } catch (err) {
      console.error('Error fetching tools:', err);
      setError(err.response?.data?.message || err.message || 'Greška pri dohvaćanju alata');
      setTools([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTools();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.search,
    filters.category,
    filters.pricing,
    filters.minRating,
    filters.tags?.join(','),
    filters.models?.join(','),
    filters.sort,
    filters.order,
    filters.page,
    filters.limit,
  ]);

  return {
    tools,
    loading,
    error,
    pagination,
    refetch: fetchTools,
  };
};

export default useTools;

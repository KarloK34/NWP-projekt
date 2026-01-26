import { useState, useEffect } from 'react';
import api from '../services/api';

/**
 * Custom hook for fetching a single tool by ID
 * @param {string} toolId - Tool ID
 * @returns {Object} - { tool, loading, error, refetch }
 */
const useTool = (toolId) => {
  const [tool, setTool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTool = async () => {
    if (!toolId) {
      setError('ID alata nije naveden');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/tools/${toolId}`);
      
      if (response.data.success) {
        setTool(response.data.data.tool);
      } else {
        setError(response.data.message || 'Greška pri dohvaćanju alata');
        setTool(null);
      }
    } catch (err) {
      console.error('Error fetching tool:', err);
      setError(err.response?.data?.message || err.message || 'Greška pri dohvaćanju alata');
      setTool(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTool();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toolId]);

  return {
    tool,
    loading,
    error,
    refetch: fetchTool,
  };
};

export default useTool;

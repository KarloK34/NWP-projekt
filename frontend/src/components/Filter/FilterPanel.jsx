import { useState, useEffect } from 'react';
import api from '../../services/api';

const FilterPanel = ({ filters, onFiltersChange }) => {
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch categories and tags (for now, we'll use empty arrays if API doesn't exist)
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Try to fetch categories - if endpoint doesn't exist, use empty array
        try {
          const catResponse = await api.get('/categories');
          if (catResponse.data.success) {
            setCategories(catResponse.data.data || []);
          }
        } catch (err) {
          // Categories endpoint doesn't exist yet - that's okay
          console.log('Categories endpoint not available yet');
        }

        // Try to fetch tags - if endpoint doesn't exist, use empty array
        try {
          const tagsResponse = await api.get('/tags');
          if (tagsResponse.data.success) {
            setTags(tagsResponse.data.data || []);
          }
        } catch (err) {
          // Tags endpoint doesn't exist yet - that's okay
          console.log('Tags endpoint not available yet');
        }
      } catch (err) {
        console.error('Error fetching filter data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCategoryChange = (categoryId) => {
    onFiltersChange({
      ...filters,
      category: filters.category === categoryId ? null : categoryId,
      page: 1, // Reset to first page when filter changes
    });
  };

  const handleTagToggle = (tagId) => {
    const currentTags = filters.tags || [];
    const newTags = currentTags.includes(tagId)
      ? currentTags.filter((id) => id !== tagId)
      : [...currentTags, tagId];
    
    onFiltersChange({
      ...filters,
      tags: newTags.length > 0 ? newTags : null,
      page: 1,
    });
  };

  const handlePricingChange = (pricing) => {
    onFiltersChange({
      ...filters,
      pricing: filters.pricing === pricing ? null : pricing,
      page: 1,
    });
  };

  const handleMinRatingChange = (minRating) => {
    onFiltersChange({
      ...filters,
      minRating: filters.minRating === minRating ? null : minRating,
      page: 1,
    });
  };

  const handleSortChange = (sort) => {
    const [sortField, order] = sort.split('-');
    onFiltersChange({
      ...filters,
      sort: sortField,
      order: order || 'desc',
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      page: 1,
      limit: 12,
      sort: 'rating',
      order: 'desc',
      category: null,
      tags: null,
      pricing: null,
      minRating: null,
      models: null,
    });
  };

  if (loading) {
    return (
      <div style={styles.panel}>
        <p>Učitavanje filtera...</p>
      </div>
    );
  }

  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        <h3 style={styles.title}>Filteri</h3>
        <button onClick={clearFilters} style={styles.clearBtn}>
          Resetiraj
        </button>
      </div>

      {/* Sortiranje */}
      <div style={styles.section}>
        <label style={styles.label}>Sortiranje</label>
        <select
          value={`${filters.sort || 'rating'}-${filters.order || 'desc'}`}
          onChange={(e) => handleSortChange(e.target.value)}
          style={styles.select}
        >
          <option value="rating-desc">Ocjena (najviša)</option>
          <option value="rating-asc">Ocjena (najniža)</option>
          <option value="name-asc">Naziv (A-Z)</option>
          <option value="name-desc">Naziv (Z-A)</option>
          <option value="newest-desc">Najnoviji</option>
          <option value="oldest-asc">Najstariji</option>
        </select>
      </div>

      {/* Cijena */}
      <div style={styles.section}>
        <label style={styles.label}>Cijena</label>
        <div style={styles.radioGroup}>
          {['free', 'paid', 'freemium'].map((pricing) => (
            <label key={pricing} style={styles.radioLabel}>
              <input
                type="radio"
                name="pricing"
                checked={filters.pricing === pricing}
                onChange={() => handlePricingChange(pricing)}
                style={styles.radio}
              />
              <span>
                {pricing === 'free' && 'Besplatno'}
                {pricing === 'paid' && 'Plaćeno'}
                {pricing === 'freemium' && 'Freemium'}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Minimalna ocjena */}
      <div style={styles.section}>
        <label style={styles.label}>Minimalna ocjena</label>
        <select
          value={filters.minRating || ''}
          onChange={(e) => handleMinRatingChange(e.target.value ? Number(e.target.value) : null)}
          style={styles.select}
        >
          <option value="">Sve ocjene</option>
          <option value="1">1+ zvjezdica</option>
          <option value="2">2+ zvjezdice</option>
          <option value="3">3+ zvjezdice</option>
          <option value="4">4+ zvjezdice</option>
          <option value="4.5">4.5+ zvjezdica</option>
        </select>
      </div>

      {/* Kategorije */}
      {categories.length > 0 && (
        <div style={styles.section}>
          <label style={styles.label}>Kategorije</label>
          <div style={styles.checkboxGroup}>
            {categories.map((category) => (
              <label key={category._id} style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={filters.category === category._id}
                  onChange={() => handleCategoryChange(category._id)}
                  style={styles.checkbox}
                />
                <span>{category.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Tagovi */}
      {tags.length > 0 && (
        <div style={styles.section}>
          <label style={styles.label}>Tagovi</label>
          <div style={styles.checkboxGroup}>
            {tags.slice(0, 10).map((tag) => (
              <label key={tag._id} style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={(filters.tags || []).includes(tag._id)}
                  onChange={() => handleTagToggle(tag._id)}
                  style={styles.checkbox}
                />
                <span>{tag.name}</span>
              </label>
            ))}
            {tags.length > 10 && (
              <p style={styles.moreInfo}>+{tags.length - 10} više tagova</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  panel: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '1.5rem',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    marginBottom: '2rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    paddingBottom: '1rem',
    borderBottom: '2px solid #ecf0f1',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    margin: 0,
    color: '#2c3e50',
  },
  clearBtn: {
    padding: '0.5rem 1rem',
    backgroundColor: '#e74c3c',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  section: {
    marginBottom: '1.5rem',
  },
  label: {
    display: 'block',
    fontSize: '0.9rem',
    fontWeight: '600',
    marginBottom: '0.75rem',
    color: '#2c3e50',
  },
  select: {
    width: '100%',
    padding: '0.5rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '0.9rem',
    outline: 'none',
  },
  radioGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  radio: {
    cursor: 'pointer',
  },
  checkboxGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    maxHeight: '200px',
    overflowY: 'auto',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  checkbox: {
    cursor: 'pointer',
  },
  moreInfo: {
    fontSize: '0.8rem',
    color: '#999',
    fontStyle: 'italic',
    marginTop: '0.5rem',
  },
};

export default FilterPanel;

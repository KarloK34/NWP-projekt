import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import Button from '../UI/Button';
import Spinner from '../UI/Spinner';

const FilterPanel = ({ filters, onFiltersChange }) => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        try {
          const catResponse = await api.get('/categories');
          if (catResponse.data.success) {
            setCategories(catResponse.data.data || []);
          }
        } catch (_) {}

        try {
          const tagsResponse = await api.get('/tags');
          if (tagsResponse.data.success) {
            setTags(tagsResponse.data.data || []);
          }
        } catch (_) {}
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
      page: 1,
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

  const pricingLabels = {
    free: t('filters.pricingFree'),
    paid: t('filters.pricingPaid'),
    freemium: t('filters.pricingFreemium'),
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-center gap-2 text-slate-600">
          <Spinner size="sm" />
          <span>{t('filters.loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-[var(--shadow-card)]">
      <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4">
        <h3 className="m-0 text-lg font-bold text-slate-800">{t('filters.title')}</h3>
        <Button variant="danger" size="sm" onClick={clearFilters}>
          {t('filters.reset')}
        </Button>
      </div>

      <div className="mb-6">
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          {t('filters.sort')}
        </label>
        <select
          value={`${filters.sort || 'rating'}-${filters.order || 'desc'}`}
          onChange={(e) => handleSortChange(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
        >
          <option value="rating-desc">{t('filters.sortRatingDesc')}</option>
          <option value="rating-asc">{t('filters.sortRatingAsc')}</option>
          <option value="name-asc">{t('filters.sortNameAsc')}</option>
          <option value="name-desc">{t('filters.sortNameDesc')}</option>
          <option value="newest-desc">{t('filters.sortNewest')}</option>
          <option value="oldest-asc">{t('filters.sortOldest')}</option>
        </select>
      </div>

      <div className="mb-6">
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          {t('filters.price')}
        </label>
        <div className="flex flex-col gap-2">
          {['free', 'paid', 'freemium'].map((pricing) => (
            <label
              key={pricing}
              className="flex cursor-pointer items-center gap-2 text-sm"
            >
              <input
                type="radio"
                name="pricing"
                checked={filters.pricing === pricing}
                onChange={() => handlePricingChange(pricing)}
                className="cursor-pointer"
              />
              <span>{pricingLabels[pricing]}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          {t('filters.minRating')}
        </label>
        <select
          value={filters.minRating ?? ''}
          onChange={(e) =>
            handleMinRatingChange(e.target.value ? Number(e.target.value) : null)
          }
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
        >
          <option value="">{t('filters.allRatings')}</option>
          <option value="1">{t('filters.stars1')}</option>
          <option value="2">{t('filters.stars2')}</option>
          <option value="3">{t('filters.stars3')}</option>
          <option value="4">{t('filters.stars4')}</option>
          <option value="4.5">{t('filters.stars45')}</option>
        </select>
      </div>

      {categories.length > 0 && (
        <div className="mb-6">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            {t('filters.categories')}
          </label>
          <div className="max-h-[200px] flex flex-col gap-2 overflow-y-auto">
            {categories.map((category) => (
              <label
                key={category._id}
                className="flex cursor-pointer items-center gap-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={filters.category === category._id}
                  onChange={() => handleCategoryChange(category._id)}
                  className="cursor-pointer"
                />
                <span>{category.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {tags.length > 0 && (
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            {t('filters.tags')}
          </label>
          <div className="max-h-[200px] flex flex-col gap-2 overflow-y-auto">
            {tags.slice(0, 10).map((tag) => (
              <label
                key={tag._id}
                className="flex cursor-pointer items-center gap-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={(filters.tags || []).includes(tag._id)}
                  onChange={() => handleTagToggle(tag._id)}
                  className="cursor-pointer"
                />
                <span>{tag.name}</span>
              </label>
            ))}
            {tags.length > 10 && (
              <p className="mt-2 text-xs italic text-slate-500">
                {t('filters.moreTags', { count: tags.length - 10 })}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;

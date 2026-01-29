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
            setCategories(catResponse.data.data?.items || catResponse.data.data || []);
          }
        } catch (_) {}

        try {
          const tagsResponse = await api.get('/tags');
          if (tagsResponse.data.success) {
            setTags(tagsResponse.data.data?.items || tagsResponse.data.data || []);
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

  const handleCategoryToggle = (categoryId) => {
    const currentCategories = filters.categories || [];
    const newCategories = currentCategories.includes(categoryId)
      ? currentCategories.filter((id) => id !== categoryId)
      : [...currentCategories, categoryId];

    onFiltersChange({
      ...filters,
      categories: newCategories.length > 0 ? newCategories : null,
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

  const clearFilters = () => {
    onFiltersChange({
      page: 1,
      limit: 12,
      sort: 'rating',
      order: 'desc',
      categories: null,
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
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-[var(--shadow-card)] dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400">
          <Spinner size="sm" />
          <span>{t('filters.loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-[var(--shadow-card)] dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-700">
        <h3 className="m-0 text-lg font-bold text-slate-800 dark:text-slate-100">{t('filters.title')}</h3>
        <Button variant="danger" size="sm" onClick={clearFilters}>
          {t('filters.reset')}
        </Button>
      </div>

      {categories.length > 0 && (
        <div className="mb-6">
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
            {t('filters.categories')}
          </label>
          <div className="max-h-[100px] flex flex-col gap-2 overflow-y-auto">
            {categories.map((category) => (
              <label
                key={category._id}
                className="flex cursor-pointer items-center gap-2 text-sm dark:text-slate-300"
              >
                <input
                  type="checkbox"
                  checked={(filters.categories || []).includes(category._id)}
                  onChange={() => handleCategoryToggle(category._id)}
                  className="cursor-pointer"
                />
                <span>{category.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="mb-6">
        <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
          {t('filters.price')}
        </label>
        <div className="flex flex-col gap-2">
          {['free', 'paid', 'freemium'].map((pricing) => (
            <label
              key={pricing}
              className="flex cursor-pointer items-center gap-2 text-sm dark:text-slate-300"
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
        <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
          {t('filters.minRating')}
        </label>
        <select
          value={filters.minRating ?? ''}
          onChange={(e) =>
            handleMinRatingChange(e.target.value ? Number(e.target.value) : null)
          }
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
        >
          <option value="">{t('filters.allRatings')}</option>
          <option value="1">{t('filters.stars1')}</option>
          <option value="2">{t('filters.stars2')}</option>
          <option value="3">{t('filters.stars3')}</option>
          <option value="4">{t('filters.stars4')}</option>
          <option value="4.5">{t('filters.stars45')}</option>
        </select>
      </div>

      {tags.length > 0 && (
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
            {t('filters.tags')}
          </label>
          <div className="max-h-[100px] flex flex-col gap-2 overflow-y-auto">
            {tags.map((tag) => (
              <label
                key={tag._id}
                className="flex shrink-0 cursor-pointer items-center gap-2 text-sm dark:text-slate-300"
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
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;

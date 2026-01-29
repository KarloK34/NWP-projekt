import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useWatchlist from '../hooks/useWatchlist';
import { Card } from '../components/UI/Card';
import Spinner from '../components/UI/Spinner';
import Button from '../components/UI/Button';
import ToolCard from '../components/Tool/ToolCard';

const Watchlist = () => {
  const { t } = useTranslation();
  const { tools, loading, error, removeFromWatchlist, mutating } = useWatchlist();
  const [selectedCategories, setSelectedCategories] = useState([]);

  const categories = useMemo(() => {
    const seen = new Map();
    tools.forEach((tool) => {
      const cat = tool.category;
      if (cat && cat._id && !seen.has(cat._id)) {
        seen.set(cat._id, { _id: cat._id, name: cat.name });
      }
    });
    return Array.from(seen.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [tools]);

  const filteredTools = useMemo(() => {
    if (selectedCategories.length === 0) return tools;
    return tools.filter((tool) => tool.category && selectedCategories.includes(tool.category._id));
  }, [tools, selectedCategories]);

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
    );
  };

  const handleResetFilters = () => {
    setSelectedCategories([]);
  };

  const handleRemove = async (e, toolId) => {
    e.preventDefault();
    e.stopPropagation();
    await removeFromWatchlist(toolId);
  };

  if (loading) {
    return (
      <div className="container-app mx-auto max-w-4xl p-6 md:p-8">
        <div className="flex items-center justify-center gap-2 py-16 text-slate-600 dark:text-slate-400">
          <Spinner size="lg" />
          <span>{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-app mx-auto max-w-4xl p-6 md:p-8">
      <h1 className="mb-8 text-2xl font-bold text-slate-800 dark:text-slate-100">
        {t('watchlist.title')}
      </h1>

      {error && (
        <p className="mb-6 rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </p>
      )}

      {tools.length === 0 ? (
        <Card>
          <p className="py-8 text-center text-slate-600 dark:text-slate-400">
            {t('watchlist.empty')}
          </p>
          <div className="flex justify-center">
            <Link to="/">
              <Button variant="primary">{t('nav.home')}</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <>
          {categories.length > 1 && (
            <Card className="mb-6 p-4">
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {t('filters.categories')}:
                </span>
                <div className="flex flex-wrap gap-3">
                  {categories.map((category) => (
                    <label
                      key={category._id}
                      className="flex cursor-pointer items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category._id)}
                        onChange={() => handleCategoryToggle(category._id)}
                        className="cursor-pointer rounded border-slate-300 text-primary-600 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-700"
                      />
                      <span className="text-slate-600 dark:text-slate-300">{category.name}</span>
                    </label>
                  ))}
                </div>
                {selectedCategories.length > 0 && (
                  <Button variant="secondary" size="sm" onClick={handleResetFilters}>
                    {t('filters.reset')}
                  </Button>
                )}
              </div>
            </Card>
          )}

          {filteredTools.length === 0 ? (
            <Card>
              <p className="py-8 text-center text-slate-600 dark:text-slate-400">
                {t('watchlist.noMatch')}
              </p>
              <div className="flex justify-center">
                <Button variant="secondary" onClick={handleResetFilters}>
                  {t('filters.reset')}
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
              {filteredTools.map((tool) => (
                <div key={tool._id} className="relative">
                  <div className="absolute right-2 top-2 z-10">
                    <Button
                      variant="danger"
                      size="sm"
                      disabled={mutating}
                      loading={mutating}
                      onClick={(e) => handleRemove(e, tool._id)}
                      title={t('watchlist.remove')}
                    >
                      {t('watchlist.remove')}
                    </Button>
                  </div>
                  <ToolCard tool={tool} />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Watchlist;

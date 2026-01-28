import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useTools from '../hooks/useTools';
import useDebounce from '../hooks/useDebounce';
import useWindowSize from '../hooks/useWindowSize';
import SearchBar from '../components/Search/SearchBar';
import FilterPanel from '../components/Filter/FilterPanel';
import ToolCard from '../components/Tool/ToolCard';
import { SkeletonToolGrid } from '../components/UI/Skeleton';
import Button from '../components/UI/Button';

const Home = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    sort: 'rating',
    order: 'desc',
  });
  const [showFilters, setShowFilters] = useState(false);
  const { width } = useWindowSize();
  const isMobile = width < 768;

  const debouncedSearch = useDebounce(searchQuery, 300);

  const { tools, loading, error, pagination } = useTools({
    ...filters,
    search: debouncedSearch && debouncedSearch.trim().length > 0 ? debouncedSearch.trim() : undefined,
  });

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setFilters((prev) => ({ ...prev, page: 1 }));
  };

  const handleFiltersChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toolsLabel = pagination.total === 1 ? t('home.tools') : t('home.tools_plural');

  return (
    <div className="container-app w-full p-6 md:p-8">
      <div className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4">
          <SearchBar
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder={t('home.searchPlaceholder')}
          />
          {isMobile && (
            <Button
              variant="primary"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 sm:w-auto"
              aria-label={t('home.toggleFilters')}
            >
              <svg
                className="size-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              {t('home.toggleFilters')}
            </Button>
          )}
        </div>
      </div>

      {isMobile && showFilters && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 sm:items-center"
          onClick={() => setShowFilters(false)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Escape' && setShowFilters(false)}
          aria-label={t('common.close')}
        >
          <div
            className="w-full max-w-lg rounded-t-xl rounded-b-none bg-white shadow-xl sm:rounded-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <h3 className="m-0 text-lg font-semibold text-slate-800">{t('filters.title')}</h3>
              <button
                type="button"
                onClick={() => setShowFilters(false)}
                className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                aria-label={t('home.closeFilters')}
              >
                <span aria-hidden>✕</span>
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto p-4">
              <FilterPanel filters={filters} onFiltersChange={handleFiltersChange} />
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[280px_1fr] lg:items-start">
        {!isMobile && (
          <aside className="sticky top-8 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <FilterPanel filters={filters} onFiltersChange={handleFiltersChange} />
          </aside>
        )}

        <main className="min-h-[400px]">
          {loading && tools.length === 0 && (
            <div className="py-16 text-center">
              <SkeletonToolGrid count={6} />
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-red-50 p-6 text-center text-red-700" role="alert">
              <p>❌ {error}</p>
            </div>
          )}

          {!loading && !error && tools.length === 0 && (
            <div className="py-16 text-center text-slate-600">
              <p className="text-lg">{t('home.noResults')}</p>
              <p className="mt-2 text-sm text-slate-500">{t('home.tryFilters')}</p>
            </div>
          )}

          {!error && tools.length > 0 && (
            <>
              <div className="mb-6 text-sm text-slate-600">
                <p>
                  {t('home.found')} <strong>{pagination.total}</strong> {toolsLabel}
                  {pagination.pages > 1 && (
                    <span>
                      {' '}({t('common.page')} {pagination.page} {t('common.of')} {pagination.pages})
                    </span>
                  )}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {tools.map((tool) => (
                  <ToolCard key={tool._id} tool={tool} />
                ))}
              </div>

              {pagination.pages > 1 && (
                <div className="mt-8 flex flex-wrap items-center justify-center gap-4 py-4">
                  <Button
                    variant="secondary"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  >
                    ← {t('common.previous')}
                  </Button>
                  <span className="text-sm text-slate-600">
                    {t('common.page')} {pagination.page} {t('common.of')} {pagination.pages}
                  </span>
                  <Button
                    variant="secondary"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.pages}
                  >
                    {t('common.next')} →
                  </Button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Home;

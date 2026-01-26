import { useState } from 'react';
import useTools from '../hooks/useTools';
import useDebounce from '../hooks/useDebounce';
import SearchBar from '../components/Search/SearchBar';
import FilterPanel from '../components/Filter/FilterPanel';
import ToolCard from '../components/Tool/ToolCard';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    sort: 'rating',
    order: 'desc',
  });

  const debouncedSearch = useDebounce(searchQuery, 300);

  const { tools, loading, error, pagination } = useTools({
    ...filters,
    search: debouncedSearch && debouncedSearch.trim().length > 0 ? debouncedSearch.trim() : undefined,
  });

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setFilters((prev) => ({ ...prev, page: 1 })); // Reset to first page on search
  };

  const handleFiltersChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={styles.container}>
      {/* Search Bar */}
      <div style={styles.searchSection}>
        <SearchBar
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Pretraži alate po nazivu..."
        />
      </div>

      <div style={styles.content}>
        {/* Filter Panel */}
        <aside style={styles.sidebar}>
          <FilterPanel filters={filters} onFiltersChange={handleFiltersChange} />
        </aside>

        {/* Tools List */}
        <main style={styles.main}>
          {/* Show loading only on initial load (when no tools exist yet) */}
          {loading && tools.length === 0 && (
            <div style={styles.loading}>
              <p>Učitavanje alata...</p>
            </div>
          )}

          {error && (
            <div style={styles.error}>
              <p>❌ {error}</p>
            </div>
          )}

          {!loading && !error && tools.length === 0 && (
            <div style={styles.empty}>
              <p>Nema pronađenih alata.</p>
              <p style={styles.emptySubtext}>
                Pokušajte promijeniti filtere ili pretragu.
              </p>
            </div>
          )}

          {!error && tools.length > 0 && (
            <>
              <div style={styles.resultsInfo}>
                <p>
                  Pronađeno <strong>{pagination.total}</strong> alat{pagination.total !== 1 ? 'a' : ''}
                  {pagination.pages > 1 && (
                    <span> (stranica {pagination.page} od {pagination.pages})</span>
                  )}
                </p>
              </div>

              <div style={styles.toolsGrid}>
                {tools.map((tool) => (
                  <ToolCard key={tool._id} tool={tool} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div style={styles.pagination}>
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    style={{
                      ...styles.paginationBtn,
                      ...(pagination.page === 1 ? styles.paginationBtnDisabled : {}),
                    }}
                  >
                    ← Prethodna
                  </button>

                  <div style={styles.paginationInfo}>
                    Stranica {pagination.page} od {pagination.pages}
                  </div>

                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.pages}
                    style={{
                      ...styles.paginationBtn,
                      ...(pagination.page >= pagination.pages ? styles.paginationBtnDisabled : {}),
                    }}
                  >
                    Sljedeća →
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '2rem',
  },
  searchSection: {
    marginBottom: '2rem',
  },
  content: {
    display: 'grid',
    gridTemplateColumns: '280px 1fr',
    gap: '2rem',
    alignItems: 'start',
  },
  sidebar: {
    position: 'sticky',
    top: '2rem',
  },
  main: {
    minHeight: '400px',
  },
  loading: {
    textAlign: 'center',
    padding: '4rem 2rem',
    fontSize: '1.1rem',
    color: '#666',
  },
  error: {
    textAlign: 'center',
    padding: '2rem',
    backgroundColor: '#fee',
    borderRadius: '8px',
    color: '#c33',
  },
  empty: {
    textAlign: 'center',
    padding: '4rem 2rem',
    color: '#666',
  },
  emptySubtext: {
    fontSize: '0.9rem',
    color: '#999',
    marginTop: '0.5rem',
  },
  resultsInfo: {
    marginBottom: '1.5rem',
    fontSize: '0.9rem',
    color: '#666',
  },
  toolsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '1rem',
    marginTop: '2rem',
    padding: '1rem',
  },
  paginationBtn: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#3498db',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'background-color 0.2s ease',
  },
  paginationBtnDisabled: {
    backgroundColor: '#bdc3c7',
    cursor: 'not-allowed',
    opacity: 0.6,
  },
  paginationInfo: {
    fontSize: '0.9rem',
    color: '#666',
  },
};

export default Home;

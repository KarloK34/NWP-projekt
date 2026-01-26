import { useState } from 'react';
import useTools from '../hooks/useTools';
import useDebounce from '../hooks/useDebounce';
import useWindowSize from '../hooks/useWindowSize';
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
    setFilters((prev) => ({ ...prev, page: 1 })); // Reset to first page on search
  };

  const handleFiltersChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const responsiveStyles = getResponsiveStyles(isMobile);
  const containerStyle = { ...styles.container, ...responsiveStyles.container };
  const contentStyle = { ...styles.content, ...responsiveStyles.content };
  const toolsGridStyle = { ...styles.toolsGrid, ...responsiveStyles.toolsGrid };
  const searchBarWrapperStyle = { ...styles.searchBarWrapper, ...responsiveStyles.searchBarWrapper };

  return (
    <div style={containerStyle}>
      {/* Search Bar */}
      <div style={styles.searchSection}>
        <div style={searchBarWrapperStyle}>
          <SearchBar
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Pretraži alate po nazivu..."
          />
          {isMobile && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={styles.filterToggleBtn}
              aria-label="Toggle filters"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="4" y1="21" x2="4" y2="14"></line>
                <line x1="4" y1="10" x2="4" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12" y2="3"></line>
                <line x1="20" y1="21" x2="20" y2="16"></line>
                <line x1="20" y1="12" x2="20" y2="3"></line>
                <line x1="1" y1="14" x2="7" y2="14"></line>
                <line x1="9" y1="8" x2="15" y2="8"></line>
                <line x1="17" y1="16" x2="23" y2="16"></line>
              </svg>
              Filteri
            </button>
          )}
        </div>
      </div>

      {/* Mobile Filter Overlay */}
      {isMobile && showFilters && (
        <div style={styles.filterOverlay} onClick={() => setShowFilters(false)}>
          <div style={styles.filterPanelMobile} onClick={(e) => e.stopPropagation()}>
            <div style={styles.filterHeader}>
              <h3 style={styles.filterTitle}>Filteri</h3>
              <button
                onClick={() => setShowFilters(false)}
                style={styles.closeBtn}
                aria-label="Close filters"
              >
                ✕
              </button>
            </div>
            <FilterPanel filters={filters} onFiltersChange={handleFiltersChange} />
          </div>
        </div>
      )}

      <div style={contentStyle}>
        {/* Filter Panel - Desktop */}
        {!isMobile && (
          <aside style={styles.sidebar}>
            <FilterPanel filters={filters} onFiltersChange={handleFiltersChange} />
          </aside>
        )}

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

              <div style={toolsGridStyle}>
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
    width: '100%',
    margin: 0,
    padding: '2rem',
  },
  searchSection: {
    marginBottom: '2rem',
  },
  searchBarWrapper: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
  },
  filterToggleBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1rem',
    backgroundColor: '#3498db',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    whiteSpace: 'nowrap',
    transition: 'background-color 0.2s ease',
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
    maxHeight: 'calc(100vh - 4rem)',
    overflowY: 'auto',
  },
  filterOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: '1rem',
    overflowY: 'auto',
  },
  filterPanelMobile: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    width: '100%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflowY: 'auto',
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  filterHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    borderBottom: '2px solid #ecf0f1',
    position: 'sticky',
    top: 0,
    backgroundColor: '#fff',
    zIndex: 1,
    borderRadius: '8px 8px 0 0',
  },
  filterTitle: {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  closeBtn: {
    backgroundColor: '#e74c3c',
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    cursor: 'pointer',
    fontSize: '1.2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s',
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

// Responsive styles
const getResponsiveStyles = (isMobile) => {
  if (!isMobile) return {};
  
  return {
    container: {
      padding: '1rem',
    },
    content: {
      gridTemplateColumns: '1fr',
      gap: '1rem',
    },
    toolsGrid: {
      gridTemplateColumns: '1fr',
      gap: '1rem',
    },
    searchBarWrapper: {
      flexDirection: 'column',
      alignItems: 'stretch',
    },
    filterToggleBtn: {
      width: '100%',
      justifyContent: 'center',
    },
  };
};

export default Home;

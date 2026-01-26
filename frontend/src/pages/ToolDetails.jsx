import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useTool from '../hooks/useTool';
import useWindowSize from '../hooks/useWindowSize';

const ToolDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { tool, loading, error } = useTool(id);
  const { width } = useWindowSize();
  const isMobile = width < 768;

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div style={styles.rating}>
        {[...Array(fullStars)].map((_, i) => (
          <span key={i} style={styles.star}>★</span>
        ))}
        {hasHalfStar && <span style={styles.star}>☆</span>}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={i} style={styles.emptyStar}>☆</span>
        ))}
        <span style={styles.ratingText}>
          {rating > 0 ? rating.toFixed(1) : 'N/A'} ({tool?.reviewCount || 0} recenzija)
        </span>
      </div>
    );
  };

  const getPricingBadge = (pricing) => {
    const badges = {
      free: { text: 'Besplatno', color: '#27ae60' },
      paid: { text: 'Plaćeno', color: '#e74c3c' },
      freemium: { text: 'Freemium', color: '#f39c12' },
    };
    const badge = badges[pricing] || badges.free;
    return (
      <span style={{ ...styles.pricingBadge, backgroundColor: badge.color }}>
        {badge.text}
      </span>
    );
  };

  const handleAddToWatchlist = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    // TODO: Implement watchlist functionality when Phase 5.2 is completed
    alert('Funkcionalnost watchliste će biti implementirana u Fazi 5.2');
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Učitavanje...</div>
      </div>
    );
  }

  if (error || !tool) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>
          <h2>Greška</h2>
          <p>{error || 'Alat nije pronađen'}</p>
          <Link to="/" style={styles.backLink}>
            ← Povratak na početnu
          </Link>
        </div>
      </div>
    );
  }

  const responsiveStyles = getResponsiveStyles(isMobile);

  return (
    <div style={{ ...styles.container, ...responsiveStyles.container }}>
      {/* Back Button */}
      <button onClick={() => navigate(-1)} style={styles.backButton}>
        ← Natrag
      </button>

      {/* Main Content */}
      <div style={{ ...styles.content, ...responsiveStyles.content }}>
        {/* Header Section */}
        <div style={styles.header}>
          {tool.logo && (
            <div style={styles.logoContainer}>
              <img src={tool.logo} alt={tool.name} style={styles.logo} />
            </div>
          )}
          <div style={styles.headerInfo}>
            <h1 style={styles.title}>{tool.name}</h1>
            {tool.category && (
              <Link
                to={`/?category=${tool.category.slug || tool.category._id}`}
                style={styles.categoryLink}
              >
                {tool.category.name}
              </Link>
            )}
            {renderStars(tool.rating || 0)}
            <div style={styles.badges}>
              {getPricingBadge(tool.pricing)}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={styles.actions}>
          {tool.website && (
            <a
              href={tool.website}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.websiteButton}
            >
              🌐 Posjeti web stranicu
            </a>
          )}
          <button
            onClick={handleAddToWatchlist}
            style={styles.watchlistButton}
          >
            {isAuthenticated ? '⭐ Dodaj u watchlistu' : '🔒 Prijavi se za watchlistu'}
          </button>
        </div>

        {/* Description */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Opis</h2>
          <p style={styles.description}>{tool.description}</p>
        </div>

        {/* AI Models */}
        {tool.models && tool.models.length > 0 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>AI Modeli</h2>
            <div style={styles.tags}>
              {tool.models.map((model) => (
                <span key={model._id || model} style={styles.tag}>
                  {model.name || model}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {tool.tags && tool.tags.length > 0 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Tagovi</h2>
            <div style={styles.tags}>
              {tool.tags.map((tag) => (
                <span key={tag._id || tag} style={styles.tag}>
                  {tag.name || tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* External Links */}
        {tool.metadata && (tool.metadata.githubUrl || tool.metadata.huggingFaceUrl || tool.metadata.apiDocumentation) && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Dodatni resursi</h2>
            <div style={styles.externalLinks}>
              {tool.metadata.githubUrl && (
                <a
                  href={tool.metadata.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.externalLink}
                >
                  📦 GitHub
                </a>
              )}
              {tool.metadata.huggingFaceUrl && (
                <a
                  href={tool.metadata.huggingFaceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.externalLink}
                >
                  🤗 Hugging Face
                </a>
              )}
              {tool.metadata.apiDocumentation && (
                <a
                  href={tool.metadata.apiDocumentation}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.externalLink}
                >
                  📚 API Dokumentacija
                </a>
              )}
            </div>
          </div>
        )}

        {/* Reviews Section Placeholder */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Recenzije</h2>
          <p style={styles.placeholderText}>
            Sekcija recenzija će biti implementirana u Fazi 11.2
          </p>
        </div>
      </div>
    </div>
  );
};

const getResponsiveStyles = (isMobile) => {
  if (isMobile) {
    return {
      container: {
        padding: '1rem',
      },
      content: {
        padding: '1rem',
      },
    };
  }
  return {};
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
  },
  loading: {
    textAlign: 'center',
    padding: '3rem',
    fontSize: '1.2rem',
    color: '#666',
  },
  error: {
    textAlign: 'center',
    padding: '3rem',
    color: '#e74c3c',
  },
  backButton: {
    backgroundColor: '#bdc3c7',
    color: '#2c3e50',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    marginBottom: '1.5rem',
    padding: '0.75rem 1.5rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'background-color 0.2s ease',
  },
  backLink: {
    color: '#3498db',
    textDecoration: 'none',
    display: 'inline-block',
    marginTop: '1rem',
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    padding: '2rem',
  },
  header: {
    display: 'flex',
    gap: '2rem',
    marginBottom: '2rem',
    paddingBottom: '2rem',
    borderBottom: '1px solid #ecf0f1',
  },
  logoContainer: {
    width: '120px',
    height: '120px',
    borderRadius: '12px',
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  logo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    margin: '0 0 0.5rem 0',
    color: '#2c3e50',
  },
  categoryLink: {
    color: '#3498db',
    textDecoration: 'none',
    fontSize: '1rem',
    display: 'inline-block',
    marginBottom: '1rem',
  },
  rating: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    marginBottom: '1rem',
  },
  star: {
    color: '#f39c12',
    fontSize: '1.5rem',
  },
  emptyStar: {
    color: '#ddd',
    fontSize: '1.5rem',
  },
  ratingText: {
    marginLeft: '0.5rem',
    fontSize: '1rem',
    color: '#666',
  },
  badges: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '0.5rem',
  },
  pricingBadge: {
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#fff',
  },
  actions: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2rem',
    flexWrap: 'wrap',
  },
  websiteButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#3498db',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    display: 'inline-block',
    transition: 'background-color 0.2s',
  },
  watchlistButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#f39c12',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  section: {
    marginBottom: '2rem',
    paddingBottom: '2rem',
    borderBottom: '1px solid #ecf0f1',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    margin: '0 0 1rem 0',
    color: '#2c3e50',
  },
  description: {
    fontSize: '1rem',
    lineHeight: '1.8',
    color: '#555',
    whiteSpace: 'pre-wrap',
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.75rem',
  },
  tag: {
    padding: '0.5rem 1rem',
    backgroundColor: '#ecf0f1',
    borderRadius: '20px',
    fontSize: '0.9rem',
    color: '#555',
  },
  externalLinks: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  externalLink: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#ecf0f1',
    color: '#2c3e50',
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: '500',
    display: 'inline-block',
    transition: 'background-color 0.2s',
  },
  placeholderText: {
    color: '#999',
    fontStyle: 'italic',
  },
};

export default ToolDetails;

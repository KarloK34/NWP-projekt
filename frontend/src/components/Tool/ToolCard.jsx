import { Link } from 'react-router-dom';

const ToolCard = ({ tool }) => {
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
          {rating > 0 ? rating.toFixed(1) : 'N/A'} ({tool.reviewCount || 0})
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

  return (
    <Link to={`/tool/${tool._id}`} style={styles.card}>
      <div style={styles.cardContent}>
        {tool.logo && (
          <div style={styles.logoContainer}>
            <img src={tool.logo} alt={tool.name} style={styles.logo} />
          </div>
        )}
        <h3 style={styles.name}>{tool.name}</h3>
        <p style={styles.description}>
          {tool.description.length > 150
            ? `${tool.description.substring(0, 150)}...`
            : tool.description}
        </p>
        {tool.category && (
          <div style={styles.category}>
            <span style={styles.categoryLabel}>Kategorija:</span>
            <span style={styles.categoryName}>{tool.category.name}</span>
          </div>
        )}
        {renderStars(tool.rating || 0)}
        {tool.tags && tool.tags.length > 0 && (
          <div style={styles.tags}>
            {tool.tags.slice(0, 3).map((tag) => (
              <span key={tag._id || tag} style={styles.tag}>
                {tag.name || tag}
              </span>
            ))}
            {tool.tags.length > 3 && (
              <span style={styles.tagMore}>+{tool.tags.length - 3}</span>
            )}
          </div>
        )}
        <div style={styles.footer}>
          {getPricingBadge(tool.pricing)}
        </div>
      </div>
    </Link>
  );
};

const styles = {
  card: {
    display: 'block',
    textDecoration: 'none',
    color: 'inherit',
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    overflow: 'hidden',
    height: '100%',
    cursor: 'pointer',
  },
  cardContent: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  logoContainer: {
    width: '60px',
    height: '60px',
    marginBottom: '1rem',
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  name: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    margin: '0 0 0.5rem 0',
    color: '#2c3e50',
  },
  description: {
    fontSize: '0.9rem',
    color: '#666',
    margin: '0 0 1rem 0',
    lineHeight: '1.5',
    flexGrow: 1,
  },
  category: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.75rem',
    fontSize: '0.85rem',
  },
  categoryLabel: {
    color: '#999',
  },
  categoryName: {
    color: '#3498db',
    fontWeight: '500',
  },
  rating: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    marginBottom: '0.75rem',
  },
  star: {
    color: '#f39c12',
    fontSize: '1rem',
  },
  emptyStar: {
    color: '#ddd',
    fontSize: '1rem',
  },
  ratingText: {
    marginLeft: '0.5rem',
    fontSize: '0.85rem',
    color: '#666',
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  tag: {
    padding: '0.25rem 0.5rem',
    backgroundColor: '#ecf0f1',
    borderRadius: '4px',
    fontSize: '0.75rem',
    color: '#555',
  },
  tagMore: {
    padding: '0.25rem 0.5rem',
    fontSize: '0.75rem',
    color: '#999',
    fontStyle: 'italic',
  },
  footer: {
    marginTop: 'auto',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  pricingBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#fff',
  },
};

export default ToolCard;

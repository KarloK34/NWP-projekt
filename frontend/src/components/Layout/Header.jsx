import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header style={styles.header}>
      <div style={styles.container}>
        <Link to="/" style={styles.logo}>
          <h1>AI Tools Catalog</h1>
        </Link>

        <nav style={styles.nav}>
          <Link to="/" style={styles.navLink}>
            Početna
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/profile" style={styles.navLink}>
                Profil
              </Link>
              {isAdmin() && (
                <Link to="/admin" style={styles.navLink}>
                  Admin
                </Link>
              )}
              <div style={styles.userSection}>
                <span style={styles.username}>{user?.username}</span>
                <button onClick={handleLogout} style={styles.logoutBtn}>
                  Odjavi se
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.navLink}>
                Prijava
              </Link>
              <Link to="/register" style={styles.navLink}>
                Registracija
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

const styles = {
  header: {
    backgroundColor: '#2c3e50',
    color: '#fff',
    padding: '1rem 0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    textDecoration: 'none',
    color: '#fff',
  },
  logo: {
    h1: {
      margin: 0,
      fontSize: '1.5rem',
      fontWeight: 'bold',
    },
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  navLink: {
    color: '#fff',
    textDecoration: 'none',
    fontSize: '1rem',
    transition: 'opacity 0.2s',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginLeft: '1rem',
    paddingLeft: '1rem',
    borderLeft: '1px solid rgba(255,255,255,0.3)',
  },
  username: {
    fontSize: '0.9rem',
    opacity: 0.9,
  },
  logoutBtn: {
    backgroundColor: '#e74c3c',
    color: '#fff',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'background-color 0.2s',
  },
};

export default Header;


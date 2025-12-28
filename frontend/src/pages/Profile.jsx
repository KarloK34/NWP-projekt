import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div style={styles.container}>
        <p>Učitavanje...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Korisnički Profil</h1>
        <div style={styles.info}>
          <div style={styles.infoRow}>
            <span style={styles.label}>Korisničko ime:</span>
            <span style={styles.value}>{user.username}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.label}>Email:</span>
            <span style={styles.value}>{user.email}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.label}>Uloga:</span>
            <span style={styles.value}>
              {user.role === 'admin' ? 'Administrator' : 'Korisnik'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    padding: '2rem',
    maxWidth: '600px',
    margin: '0 auto',
  },
  title: {
    fontSize: '2rem',
    marginBottom: '2rem',
    color: '#2c3e50',
  },
  info: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingBottom: '1rem',
    borderBottom: '1px solid #eee',
  },
  label: {
    fontWeight: '500',
    color: '#666',
  },
  value: {
    color: '#333',
  },
};

export default Profile;


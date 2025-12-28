const Admin = () => {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>Admin Panel</h1>
        <p style={styles.note}>
          Admin funkcionalnosti će biti implementirane u Fazi 12
        </p>
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
  content: {
    textAlign: 'center',
    padding: '4rem 2rem',
  },
  title: {
    fontSize: '2.5rem',
    marginBottom: '1rem',
    color: '#2c3e50',
  },
  note: {
    fontSize: '1rem',
    color: '#999',
    fontStyle: 'italic',
  },
};

export default Admin;


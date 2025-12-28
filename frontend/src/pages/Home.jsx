const Home = () => {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>Dobrodošli u AI Tools Catalog</h1>
        <p style={styles.subtitle}>
          Pronađite najbolje AI alate za vaše potrebe
        </p>
        <p style={styles.note}>
          Lista alata će biti implementirana u Fazi 10
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
  subtitle: {
    fontSize: '1.2rem',
    color: '#666',
    marginBottom: '2rem',
  },
  note: {
    fontSize: '1rem',
    color: '#999',
    fontStyle: 'italic',
  },
};

export default Home;


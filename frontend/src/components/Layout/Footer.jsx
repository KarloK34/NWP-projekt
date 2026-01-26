const Footer = () => {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <p style={styles.text}>
          © 2025 AI Tools Catalog. Sva prava pridržana.
        </p>
        <p style={styles.text}>
          Projekt izradili Karlo Kraml i Sven Radić za kolegij Napredno Web
          Programiranje (NWP).
        </p>
      </div>
    </footer>
  );
};

const styles = {
  footer: {
    backgroundColor: '#2c3e50',
    color: '#fff',
    padding: '2rem 0',
    marginTop: 'auto',
    width: '100%',
  },
  container: {
    width: '100%',
    margin: 0,
    padding: '0 2rem',
    textAlign: 'center',
  },
  text: {
    margin: '0.5rem 0',
    fontSize: '0.9rem',
    opacity: 0.9,
  },
};

export default Footer;


import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <div style={styles.layout}>
      <Header />
      <main style={styles.main}>{children}</main>
      <Footer />
    </div>
  );
};

const styles = {
  layout: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  main: {
    flex: 1,
    width: '100%',
  },
};

export default Layout;


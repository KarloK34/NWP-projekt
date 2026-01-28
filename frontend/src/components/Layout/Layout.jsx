import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen w-full flex-col m-0 p-0">
      <Header />
      <main className="flex-1 w-full m-0 p-0">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;

import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import useWindowSize from '../../hooks/useWindowSize';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import Button from '../UI/Button';

const Header = () => {
  const { t } = useTranslation();
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { width } = useWindowSize();
  const isMobile = width < 768;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="w-full bg-slate-800 text-white shadow-md dark:bg-slate-900">
      <div className="container-app flex flex-wrap items-center justify-between gap-2 py-4">
        {!isMobile && (
          <Link to="/" className="text-white no-underline hover:text-white/90">
            <h1 className="m-0 text-xl font-bold">{t('nav.appName')}</h1>
          </Link>
        )}

        <nav className="flex flex-wrap items-center gap-4">
          <Link
            to="/"
            className="text-sm text-white no-underline transition-opacity hover:opacity-90"
          >
            {t('nav.home')}
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/profile"
                className="text-sm text-white no-underline transition-opacity hover:opacity-90"
              >
                {t('nav.profile')}
              </Link>
              <Link
                to="/watchlist"
                className="text-sm text-white no-underline transition-opacity hover:opacity-90"
              >
                {t('nav.watchlist')}
              </Link>
              {isAdmin() && (
                <Link
                  to="/admin"
                  className="text-sm text-white no-underline transition-opacity hover:opacity-90"
                >
                  {t('nav.admin')}
                </Link>
              )}
              <div className="ml-2 flex flex-wrap items-center gap-2 border-l border-white/30 pl-2">
                <span className="text-sm opacity-90">{user?.username}</span>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleLogout}
                  className="whitespace-nowrap"
                >
                  {t('nav.logout')}
                </Button>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm text-white no-underline transition-opacity hover:opacity-90"
              >
                {t('nav.login')}
              </Link>
              <Link
                to="/register"
                className="text-sm text-white no-underline transition-opacity hover:opacity-90"
              >
                {t('nav.register')}
              </Link>
            </>
          )}

          <ThemeToggle />
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  );
};

export default Header;

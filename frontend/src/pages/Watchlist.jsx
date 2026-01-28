import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useWatchlist from '../hooks/useWatchlist';
import { Card } from '../components/UI/Card';
import Spinner from '../components/UI/Spinner';
import Button from '../components/UI/Button';
import ToolCard from '../components/Tool/ToolCard';

const Watchlist = () => {
  const { t } = useTranslation();
  const { tools, loading, error, removeFromWatchlist, mutating } = useWatchlist();

  const handleRemove = async (e, toolId) => {
    e.preventDefault();
    e.stopPropagation();
    await removeFromWatchlist(toolId);
  };

  if (loading) {
    return (
      <div className="container-app mx-auto max-w-4xl p-6 md:p-8">
        <div className="flex items-center justify-center gap-2 py-16 text-slate-600 dark:text-slate-400">
          <Spinner size="lg" />
          <span>{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-app mx-auto max-w-4xl p-6 md:p-8">
      <h1 className="mb-8 text-2xl font-bold text-slate-800 dark:text-slate-100">
        {t('watchlist.title')}
      </h1>

      {error && (
        <p className="mb-6 rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </p>
      )}

      {tools.length === 0 ? (
        <Card>
          <p className="py-8 text-center text-slate-600 dark:text-slate-400">
            {t('watchlist.empty')}
          </p>
          <div className="flex justify-center">
            <Link to="/">
              <Button variant="primary">{t('nav.home')}</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
          {tools.map((tool) => (
            <div key={tool._id} className="relative">
              <div className="absolute right-2 top-2 z-10">
                <Button
                  variant="danger"
                  size="sm"
                  disabled={mutating}
                  loading={mutating}
                  onClick={(e) => handleRemove(e, tool._id)}
                  title={t('watchlist.remove')}
                >
                  {t('watchlist.remove')}
                </Button>
              </div>
              <ToolCard tool={tool} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Watchlist;

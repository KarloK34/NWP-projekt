import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import Card from '../../components/UI/Card';
import Spinner from '../../components/UI/Spinner';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/tools/stats');
        setStats(res.data.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || t('common.error'));
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [t]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
        {error}
      </div>
    );
  }

  const overview = stats?.overview || {};
  const topCategories = stats?.topCategories || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t('admin.dashboard.title')}</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="p-4">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('admin.dashboard.totalTools')}</p>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{overview.totalTools ?? 0}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('admin.dashboard.totalUsers')}</p>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{overview.totalUsers ?? 0}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('admin.dashboard.totalReviews')}</p>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{overview.totalReviews ?? 0}</p>
        </Card>
      </div>

      {topCategories.length > 0 && (
        <Card className="p-4">
          <h2 className="mb-3 text-lg font-semibold text-slate-800 dark:text-slate-100">
            {t('admin.dashboard.topCategories')}
          </h2>
          <ul className="space-y-2">
            {topCategories.slice(0, 10).map((item, i) => (
              <li key={i} className="flex justify-between text-sm">
                <span className="text-slate-700 dark:text-slate-300">{item.name || '-'}</span>
                <span className="font-medium text-slate-800 dark:text-slate-100">{item.toolsCount ?? 0}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
};

export default AdminDashboard;

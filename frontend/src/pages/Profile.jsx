import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/UI/Card';
import Spinner from '../components/UI/Spinner';

const Profile = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="mx-auto max-w-4xl p-8">
        <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400">
          <Spinner size="md" />
          <span>{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  const roleLabel = user.role === 'admin' ? t('profile.roleAdmin') : t('profile.roleUser');

  return (
    <div className="mx-auto max-w-4xl p-8">
      <Card className="mx-auto max-w-xl">
        <h1 className="mb-8 text-2xl font-bold text-slate-800 dark:text-slate-100">{t('profile.title')}</h1>
        <div className="flex flex-col gap-6">
          <div className="flex justify-between border-b border-slate-200 pb-4 dark:border-slate-700">
            <span className="font-medium text-slate-600 dark:text-slate-400">{t('profile.username')}</span>
            <span className="text-slate-800 dark:text-slate-100">{user.username}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 pb-4 dark:border-slate-700">
            <span className="font-medium text-slate-600 dark:text-slate-400">{t('profile.email')}</span>
            <span className="text-slate-800 dark:text-slate-100">{user.email}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 pb-4 dark:border-slate-700">
            <span className="font-medium text-slate-600 dark:text-slate-400">{t('profile.role')}</span>
            <span className="text-slate-800 dark:text-slate-100">{roleLabel}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Profile;

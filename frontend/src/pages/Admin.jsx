import { useTranslation } from 'react-i18next';

const Admin = () => {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-4xl p-8">
      <div className="text-center py-16 px-8">
        <h1 className="mb-4 text-3xl font-bold text-slate-800 dark:text-slate-100">{t('admin.title')}</h1>
        <p className="text-slate-500 italic dark:text-slate-400">{t('admin.comingSoon')}</p>
      </div>
    </div>
  );
};

export default Admin;

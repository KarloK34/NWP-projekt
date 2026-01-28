import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="mt-auto w-full bg-slate-800 py-8 text-white dark:bg-slate-950">
      <div className="container-app text-center">
        <p className="my-1 text-sm opacity-90">{t('footer.copyright')}</p>
        <p className="my-1 text-sm opacity-90">{t('footer.credits')}</p>
      </div>
    </footer>
  );
};

export default Footer;

import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'hr', labelKey: 'language.hr' },
  { code: 'en', labelKey: 'language.en' },
];

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  return (
    <div className="flex items-center gap-1 rounded-lg border border-white/30 bg-white/10 p-1">
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          type="button"
          onClick={() => i18n.changeLanguage(lang.code)}
          className={`rounded-md px-2 py-1 text-sm font-medium transition-colors ${
            i18n.language === lang.code
              ? 'bg-white text-slate-800'
              : 'text-white hover:bg-white/20'
          }`}
          aria-label={t('language.label')}
          aria-pressed={i18n.language === lang.code}
        >
          {t(lang.labelKey)}
        </button>
      ))}
    </div>
  );
}

import { useTranslation } from 'react-i18next';

const SearchBar = ({ value, onChange, placeholder }) => {
  const { t } = useTranslation();
  const resolvedPlaceholder = placeholder ?? t('home.searchPlaceholder');

  return (
    <div className="relative w-full max-w-[600px] mx-auto">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={resolvedPlaceholder}
        className="w-full rounded-lg border-2 border-slate-300 px-4 py-3 pr-12 text-base outline-none transition-colors focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
        aria-label={t('common.search')}
      />
      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xl" aria-hidden>
        🔍
      </span>
    </div>
  );
};

export default SearchBar;

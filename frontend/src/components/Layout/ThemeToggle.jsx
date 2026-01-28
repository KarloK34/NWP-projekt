import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';

/** i18n ključevi za hover/title (hr + en) */
const HOVER_KEYS = {
  light: 'theme.switchToDark',
  dark: 'theme.switchToSystem',
  system: 'theme.switchToLight',
};

const IconSun = () => (
  <svg
    className="size-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
);

const IconMoon = () => (
  <svg
    className="size-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
    />
  </svg>
);

/** Ikona za temu „sustav” – monitor / postavke sustava */
const IconSystem = () => (
  <svg
    className="size-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
);

export default function ThemeToggle() {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  const title = t(HOVER_KEYS[theme] ?? HOVER_KEYS.system);

  const renderIcon = () => {
    if (theme === 'light') return <IconSun />;
    if (theme === 'dark') return <IconMoon />;
    return <IconSystem />;
  };

  return (
    <button
      type="button"
      onClick={cycleTheme}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/30 bg-white/10 text-white transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
      aria-label={title}
      title={title}
    >
      {renderIcon()}
    </button>
  );
}

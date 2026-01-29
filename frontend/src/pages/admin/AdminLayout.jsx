import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const AdminLayout = () => {
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { to: 'dashboard', label: t('admin.sidebar.dashboard') },
    { to: 'tools', label: t('admin.sidebar.tools') },
    { to: 'categories', label: t('admin.sidebar.categories') },
    { to: 'tags', label: t('admin.sidebar.tags') },
    { to: 'models', label: t('admin.sidebar.models') },
    { to: 'users', label: t('admin.sidebar.users') },
  ];

  return (
    <div className="flex min-h-0 flex-1">
      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label={t('common.close')}
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 h-full w-64 transform border-r border-slate-200 bg-white shadow-lg transition-transform duration-200 dark:border-slate-700 dark:bg-slate-800 md:static md:translate-x-0 md:shadow-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-14 items-center justify-between border-b border-slate-200 px-4 dark:border-slate-700 md:justify-center">
          <span className="text-lg font-semibold text-slate-800 dark:text-slate-100">{t('admin.title')}</span>
          <button
            type="button"
            aria-label={t('common.close')}
            className="rounded p-2 hover:bg-slate-100 dark:hover:bg-slate-700 md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="flex flex-col gap-1 p-2">
          {navItems.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === 'dashboard'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/40 dark:text-primary-200'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-slate-200 bg-white/95 px-4 backdrop-blur dark:border-slate-700 dark:bg-slate-900/95 md:px-6">
          <button
            type="button"
            aria-label={t('admin.openMenu')}
            className="rounded p-2 hover:bg-slate-100 dark:hover:bg-slate-700 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </header>
        <div className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import useDebounce from '../../hooks/useDebounce';
import Button from '../../components/UI/Button';
import Card from '../../components/UI/Card';
import Spinner from '../../components/UI/Spinner';

const UsersManagement = () => {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState(null);

  const debouncedSearch = useDebounce(search, 300);
  const limit = 20;

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users', {
        params: { page, limit, search: debouncedSearch?.trim() || undefined },
      });
      setItems(res.data.data?.items || []);
      setTotal(res.data.data?.total || 0);
    } catch (err) {
      showToast(err.response?.data?.message || t('admin.error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, debouncedSearch]);

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      setUpdating(userId);
      await api.patch(`/users/${userId}/role`, { role: newRole });
      showToast(t('admin.saved'), 'success');
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.message || t('admin.error'), 'error');
    } finally {
      setUpdating(null);
    }
  };

  const currentUserId = currentUser?.id || currentUser?._id;
  const pages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t('admin.users.title')}</h1>

      <input
        type="text"
        value={search}
        onChange={(e) => handleSearchChange(e.target.value)}
        placeholder={t('common.search')}
        className="w-full max-w-md rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        aria-label={t('common.search')}
      />

      {loading && items.length === 0 ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : items.length === 0 ? (
        <Card className="p-6 text-center text-slate-600 dark:text-slate-400">{t('admin.users.noUsers')}</Card>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 dark:bg-slate-800">
                <tr>
                  <th className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">{t('admin.users.username')}</th>
                  <th className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">{t('admin.users.email')}</th>
                  <th className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">{t('admin.users.role')}</th>
                  <th className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">{t('admin.users.createdAt')}</th>
                  <th className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">{t('admin.tools.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {items.map((u) => {
                  const isCurrentUser = String(u._id) === String(currentUserId);
                  return (
                    <tr key={u._id} className="bg-white dark:bg-slate-900">
                      <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">{u.username}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{u.email}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{u.role}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-4 py-3">
                        {isCurrentUser ? (
                          <span className="text-slate-500 dark:text-slate-400">{t('admin.users.cannotChangeOwnRole')}</span>
                        ) : (
                          <div className="flex gap-2">
                            {u.role === 'admin' ? (
                              <Button
                                size="sm"
                                variant="secondary"
                                disabled={updating === u._id}
                                onClick={() => handleRoleChange(u._id, 'user')}
                              >
                                {updating === u._id ? t('common.loading') : t('admin.users.setUser')}
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="primary"
                                disabled={updating === u._id}
                                onClick={() => handleRoleChange(u._id, 'admin')}
                              >
                                {updating === u._id ? t('common.loading') : t('admin.users.setAdmin')}
                              </Button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <div className="flex justify-center gap-2">
              <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                {t('common.previous')}
              </Button>
              <span className="flex items-center px-2 text-slate-600 dark:text-slate-400">
                {t('common.page')} {page} {t('common.of')} {pages}
              </span>
              <Button variant="secondary" size="sm" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
                {t('common.next')}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UsersManagement;

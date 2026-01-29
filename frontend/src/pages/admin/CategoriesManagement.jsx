import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/UI/Button';
import Card from '../../components/UI/Card';
import Modal from '../../components/UI/Modal';
import Input from '../../components/UI/Input';
import Spinner from '../../components/UI/Spinner';

const CategoriesManagement = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, mode: 'add', item: null });
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, item: null });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/categories');
      setItems(res.data.data?.items || []);
    } catch (err) {
      showToast(err.response?.data?.message || t('admin.error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAdd = () => {
    setForm({ name: '', description: '' });
    setModal({ open: true, mode: 'add', item: null });
  };

  const openEdit = (item) => {
    setForm({ name: item.name || '', description: item.description || '' });
    setModal({ open: true, mode: 'edit', item });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name?.trim()) {
      showToast(t('admin.error'), 'error');
      return;
    }
    try {
      setSaving(true);
      if (modal.mode === 'edit' && modal.item) {
        await api.put(`/categories/${modal.item._id}`, form);
        showToast(t('admin.saved'), 'success');
      } else {
        await api.post('/categories', form);
        showToast(t('admin.saved'), 'success');
      }
      setModal({ open: false, mode: 'add', item: null });
      fetchCategories();
    } catch (err) {
      showToast(err.response?.data?.message || t('admin.error'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.item) return;
    try {
      await api.delete(`/categories/${deleteModal.item._id}`);
      showToast(t('admin.deleted'), 'success');
      setDeleteModal({ open: false, item: null });
      fetchCategories();
    } catch (err) {
      showToast(err.response?.data?.message || t('admin.error'), 'error');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t('admin.categories.title')}</h1>
        <Button variant="primary" onClick={openAdd}>
          {t('admin.categories.add')}
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : items.length === 0 ? (
        <Card className="p-6 text-center text-slate-600 dark:text-slate-400">Nema kategorija.</Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 dark:bg-slate-800">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">{t('admin.categories.name')}</th>
                <th className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">{t('admin.categories.description')}</th>
                <th className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">{t('admin.tools.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {items.map((item) => (
                <tr key={item._id} className="bg-white dark:bg-slate-900">
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">{item.name}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{item.description || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => openEdit(item)}>
                        {t('admin.categories.edit')}
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => setDeleteModal({ open: true, item })}>
                        {t('admin.categories.delete')}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modal.open} onClose={() => setModal({ open: false, mode: 'add', item: null })} title={modal.mode === 'add' ? t('admin.categories.add') : t('admin.categories.edit')} size="md">
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            id="cat-name"
            label={t('admin.categories.name')}
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
            minLength={2}
          />
          <Input
            id="cat-desc"
            label={t('admin.categories.description')}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setModal({ open: false, mode: 'add', item: null })}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? t('common.loading') : t('common.save')}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false, item: null })} title={t('admin.categories.deleteConfirmTitle')} size="md">
        <p className="text-slate-600 dark:text-slate-400">{t('admin.categories.deleteConfirmMessage')}</p>
        {deleteModal.item && <p className="mt-2 font-medium text-slate-800 dark:text-slate-100">{deleteModal.item.name}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteModal({ open: false, item: null })}>
            {t('common.cancel')}
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            {t('admin.categories.delete')}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default CategoriesManagement;

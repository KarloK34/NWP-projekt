import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import useDebounce from '../../hooks/useDebounce';
import useReviews from '../../hooks/useReviews';
import Button from '../../components/UI/Button';
import Card from '../../components/UI/Card';
import Modal from '../../components/UI/Modal';
import Spinner from '../../components/UI/Spinner';
import ReviewCard from '../../components/Review/ReviewCard';

const REVIEWS_PER_PAGE = 10;

const ToolsManagement = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [deleteModal, setDeleteModal] = useState({ open: false, tool: null });
  const [reviewsModal, setReviewsModal] = useState({ open: false, tool: null });

  const {
    items: reviewItems,
    page: reviewsPage,
    pages: reviewsPages,
    total: reviewsTotal,
    loading: reviewsLoading,
    refetch: refetchReviews,
    deleteReview,
    mutating: reviewsMutating,
    setPage: setReviewsPage,
  } = useReviews(reviewsModal.tool?._id ?? null, { page: 1, limit: REVIEWS_PER_PAGE });

  const debouncedSearch = useDebounce(search, 300);
  const limit = 12;

  const fetchTools = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tools', {
        params: { page, limit, search: debouncedSearch?.trim() || undefined },
      });
      setItems(res.data.data.items || []);
      setTotal(res.data.data.total || 0);
    } catch (err) {
      showToast(err.response?.data?.message || t('admin.error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTools();
  }, [page, debouncedSearch]);

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.tool) return;
    try {
      await api.delete(`/tools/${deleteModal.tool._id}`);
      showToast(t('admin.deleted'), 'success');
      setDeleteModal({ open: false, tool: null });
      fetchTools();
    } catch (err) {
      showToast(err.response?.data?.message || t('admin.error'), 'error');
    }
  };

  const handleOpenReviews = (tool) => {
    setReviewsModal({ open: true, tool });
    setReviewsPage(1);
  };

  const handleCloseReviews = () => {
    setReviewsModal({ open: false, tool: null });
  };

  const handleAdminDeleteReview = async (reviewId) => {
    const result = await deleteReview(reviewId);
    if (result?.success) {
      showToast(t('admin.deleted'), 'success');
      refetchReviews();
      fetchTools();
    } else {
      showToast(result?.message || t('admin.error'), 'error');
    }
    return result;
  };

  const pages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t('admin.tools.title')}</h1>
        <Link to="new">
          <Button variant="primary">{t('admin.tools.addTool')}</Button>
        </Link>
      </div>

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
        <Card className="p-6 text-center text-slate-600 dark:text-slate-400">{t('admin.tools.noTools')}</Card>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 dark:bg-slate-800">
                <tr>
                  <th className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">{t('admin.tools.name')}</th>
                  <th className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">{t('admin.tools.category')}</th>
                  <th className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">{t('admin.tools.pricing')}</th>
                  <th className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">{t('admin.tools.rating')}</th>
                  <th className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">{t('admin.tools.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {items.map((tool) => (
                  <tr key={tool._id} className="bg-white dark:bg-slate-900">
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">{tool.name}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {tool.category?.name ?? '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{tool.pricing ?? '-'}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{tool.rating ?? 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleOpenReviews(tool)}
                        >
                          {t('admin.tools.viewReviews')}
                        </Button>
                        <Link to={`${tool._id}/edit`}>
                          <Button size="sm" variant="secondary">
                            {t('admin.tools.edit')}
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => setDeleteModal({ open: true, tool })}
                        >
                          {t('admin.tools.delete')}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                {t('common.previous')}
              </Button>
              <span className="flex items-center px-2 text-slate-600 dark:text-slate-400">
                {t('common.page')} {page} {t('common.of')} {pages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= pages}
                onClick={() => setPage((p) => p + 1)}
              >
                {t('common.next')}
              </Button>
            </div>
          )}
        </>
      )}

      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, tool: null })}
        title={t('admin.tools.deleteConfirmTitle')}
        size="md"
      >
        <p className="text-slate-600 dark:text-slate-400">{t('admin.tools.deleteConfirmMessage')}</p>
        {deleteModal.tool && (
          <p className="mt-2 font-medium text-slate-800 dark:text-slate-100">{deleteModal.tool.name}</p>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteModal({ open: false, tool: null })}>
            {t('common.cancel')}
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            {t('admin.tools.delete')}
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={reviewsModal.open}
        onClose={handleCloseReviews}
        title={t('admin.tools.reviewsModalTitle', { name: reviewsModal.tool?.name ?? '' })}
        size="lg"
      >
        <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
          {t('admin.tools.reviewsModalHint')}
        </p>
        {reviewsLoading && reviewItems.length === 0 ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : reviewItems.length === 0 ? (
          <p className="py-8 text-center text-slate-500 dark:text-slate-400">
            {t('review.noReviews')}
          </p>
        ) : (
          <>
            <ul className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto">
              {reviewItems.map((review) => (
                <li key={review._id}>
                  <ReviewCard
                    review={review}
                    onDelete={handleAdminDeleteReview}
                    isDeleting={reviewsMutating}
                    isAdmin
                  />
                </li>
              ))}
            </ul>
            {reviewsPages > 1 && (
              <nav
                className="mt-4 flex flex-wrap items-center justify-center gap-2 border-t border-slate-200 pt-4 dark:border-slate-700"
                aria-label={t('review.paginationLabel')}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReviewsPage((p) => Math.max(1, p - 1))}
                  disabled={reviewsPage <= 1}
                >
                  {t('common.previous')}
                </Button>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {t('common.page')} {reviewsPage} {t('common.of')} {reviewsPages}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReviewsPage((p) => Math.min(reviewsPages, p + 1))}
                  disabled={reviewsPage >= reviewsPages}
                >
                  {t('common.next')}
                </Button>
              </nav>
            )}
          </>
        )}
      </Modal>
    </div>
  );
};

export default ToolsManagement;

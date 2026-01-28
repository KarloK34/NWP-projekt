import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useReviews from '../../hooks/useReviews';
import ReviewCard from './ReviewCard';
import ReviewForm from './ReviewForm';
import Button from '../UI/Button';
import Spinner from '../UI/Spinner';
import Modal from '../UI/Modal';

const REVIEWS_PER_PAGE = 10;

/**
 * Lista recenzija za alat s paginacijom.
 * Prikazuje ReviewCard za svaku recenziju, gumb za dodavanje recenzije (ako je korisnik prijavljen)
 * i ReviewForm u modalu za dodavanje/uređivanje.
 */
export default function ReviewsList({ toolId, onReviewChange }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const {
    items,
    page,
    pages,
    total,
    loading,
    error,
    refetch,
    createReview,
    updateReview,
    deleteReview,
    mutating,
    setPage,
  } = useReviews(toolId, { page: 1, limit: REVIEWS_PER_PAGE });

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [toastError, setToastError] = useState(null);

  const handleCreate = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setEditingReview(null);
    setFormModalOpen(true);
    setToastError(null);
  };

  const handleEdit = (review) => {
    setEditingReview(review);
    setFormModalOpen(true);
    setToastError(null);
  };

  const handleFormSubmit = async (payload) => {
    setFormLoading(true);
    setToastError(null);
    try {
      if (editingReview) {
        const result = await updateReview(editingReview._id, payload);
        if (result.success) {
          setFormModalOpen(false);
          setEditingReview(null);
          onReviewChange?.();
        } else {
          setToastError(result.message);
        }
      } else {
        const result = await createReview(payload);
        if (result.success) {
          setFormModalOpen(false);
          onReviewChange?.();
        } else {
          setToastError(result.message);
        }
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleFormCancel = () => {
    setFormModalOpen(false);
    setEditingReview(null);
    setToastError(null);
  };

  const handleDelete = async (reviewId) => {
    return deleteReview(reviewId).then((result) => {
      if (result?.success) onReviewChange?.();
      return result;
    });
  };

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/30 dark:text-red-300">
        <p>{error}</p>
        <Button variant="ghost" size="sm" onClick={refetch} className="mt-2">
          {t('review.retry')}
        </Button>
      </div>
    );
  }

  return (
    <section className="reviews-list" aria-labelledby="reviews-heading">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 id="reviews-heading" className="text-xl font-bold text-slate-800 dark:text-slate-100">
          {t('review.sectionTitle')} ({total})
        </h2>
        {isAuthenticated && (
          <Button variant="primary" size="sm" onClick={handleCreate}>
            {t('review.addReview')}
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-8 text-slate-600 dark:text-slate-400">
          <Spinner size="lg" />
          <span>{t('common.loading')}</span>
        </div>
      ) : items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 py-8 text-center text-slate-500 dark:border-slate-600 dark:text-slate-400">
          {t('review.noReviews')}
        </p>
      ) : (
        <>
          <ul className="flex flex-col gap-4">
            {items.map((review) => (
              <li key={review._id}>
                <ReviewCard
                  review={review}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  isDeleting={mutating}
                />
              </li>
            ))}
          </ul>

          {pages > 1 && (
            <nav
              className="mt-6 flex flex-wrap items-center justify-center gap-2"
              aria-label={t('review.paginationLabel')}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                {t('common.previous')}
              </Button>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {t('common.page')} {page} {t('common.of')} {pages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page >= pages}
              >
                {t('common.next')}
              </Button>
            </nav>
          )}
        </>
      )}

      <Modal
        isOpen={formModalOpen}
        onClose={handleFormCancel}
        title={editingReview ? t('review.editReview') : t('review.addReview')}
        size="lg"
      >
        {toastError && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300" role="alert">
            {toastError}
          </div>
        )}
        <ReviewForm
          initialData={editingReview ? { rating: editingReview.rating, comment: editingReview.comment, pros: editingReview.pros, cons: editingReview.cons } : null}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          loading={formLoading}
          submitLabel={editingReview ? t('common.save') : t('review.submit')}
        />
      </Modal>
    </section>
  );
}

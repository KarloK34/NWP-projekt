import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import Button from '../UI/Button';
import Modal from '../UI/Modal';

/**
 * Prikaz jedne recenzije: korisnik, ocjena, komentar, prednosti/nedostaci.
 * Ako je trenutni korisnik vlasnik, prikazuje gumbe Uredi i Obriši.
 * Ako je isAdmin, prikazuje gumb Obriši za sve recenzije (admin može obrisati neprimjerene).
 */
export default function ReviewCard({
  review,
  onEdit,
  onDelete,
  isDeleting = false,
  isAdmin = false,
}) {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const userId = typeof review.user === 'object' ? review.user?._id : review.user;
  const username = typeof review.user === 'object' ? review.user?.username : null;
  const isOwner = currentUser?.id === userId || currentUser?._id === userId;
  const canDelete = isOwner || isAdmin;
  const canEdit = isOwner && !isAdmin;

  const renderStars = (rating) => {
    const full = Math.floor(rating);
    const empty = 5 - full;
    return (
      <div className="flex items-center gap-0.5" aria-label={t('review.ratingLabel', { count: rating })}>
        {[...Array(full)].map((_, i) => (
          <span key={`f-${i}`} className="text-amber-500 text-lg">★</span>
        ))}
        {[...Array(empty)].map((_, i) => (
          <span key={`e-${i}`} className="text-slate-300 text-lg dark:text-slate-500">☆</span>
        ))}
      </div>
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDeleteConfirm = async () => {
    const result = await onDelete(review._id);
    setConfirmDeleteOpen(false);
    if (result?.success) return;
  };

  return (
    <article
      className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-800/50"
      data-testid="review-card"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="font-medium text-slate-800 dark:text-slate-100">
            {username ?? t('review.anonymous')}
          </span>
          {renderStars(review.rating)}
        </div>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {formatDate(review.createdAt)}
        </span>
      </div>

      {review.comment && (
        <p className="mb-3 whitespace-pre-wrap text-slate-600 dark:text-slate-300">
          {review.comment}
        </p>
      )}

      {(review.pros?.length > 0 || review.cons?.length > 0) && (
        <div className="mb-3 flex flex-col gap-2 text-sm">
          {review.pros?.length > 0 && (
            <div>
              <span className="font-medium text-green-700 dark:text-green-400">{t('review.pros')}: </span>
              <ul className="ml-4 list-disc text-slate-600 dark:text-slate-300">
                {review.pros.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          {review.cons?.length > 0 && (
            <div>
              <span className="font-medium text-red-700 dark:text-red-400">{t('review.cons')}: </span>
              <ul className="ml-4 list-disc text-slate-600 dark:text-slate-300">
                {review.cons.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {(canEdit || canDelete) && (
        <div className="mt-3 flex gap-2 border-t border-slate-200 pt-3 dark:border-slate-700">
          {canEdit && onEdit && (
            <Button variant="ghost" size="sm" onClick={() => onEdit(review)}>
              {t('review.edit')}
            </Button>
          )}
          {canDelete && onDelete && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setConfirmDeleteOpen(true)}
              disabled={isDeleting}
              loading={isDeleting}
            >
              {t('review.delete')}
            </Button>
          )}
        </div>
      )}

      <Modal
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        title={t('review.deleteConfirmTitle')}
        size="sm"
      >
        <p className="mb-4 text-slate-600 dark:text-slate-300">{t('review.deleteConfirmMessage')}</p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirmDeleteOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteConfirm}
            loading={isDeleting}
          >
            {t('review.delete')}
          </Button>
        </div>
      </Modal>
    </article>
  );
}

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../UI/Button';

const MAX_COMMENT_LENGTH = 1000;
const MAX_PRO_CON_ITEMS = 10;
const MAX_PRO_CON_ITEM_LENGTH = 200;

/**
 * Forma za dodavanje ili uređivanje recenzije.
 * Props: initialData (za edit), onSubmit, onCancel, loading.
 * initialData: { rating, comment, pros[], cons[] }
 */
export default function ReviewForm({
  initialData = null,
  onSubmit,
  onCancel,
  loading = false,
  submitLabel = null,
}) {
  const { t } = useTranslation();
  const [rating, setRating] = useState(initialData?.rating ?? 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(initialData?.comment ?? '');
  const [pros, setPros] = useState(initialData?.pros?.length ? [...initialData.pros] : ['']);
  const [cons, setCons] = useState(initialData?.cons?.length ? [...initialData.cons] : ['']);
  const [errors, setErrors] = useState({});

  const isEdit = Boolean(initialData);

  useEffect(() => {
    if (initialData) {
      setRating(initialData.rating ?? 0);
      setComment(initialData.comment ?? '');
      setPros(initialData.pros?.length ? [...initialData.pros] : ['']);
      setCons(initialData.cons?.length ? [...initialData.cons] : ['']);
    }
  }, [initialData]);

  const validate = () => {
    const next = {};
    if (!rating || rating < 1 || rating > 5) {
      next.rating = t('review.ratingRequired');
    }
    if (!comment.trim()) {
      next.comment = t('review.commentRequired');
    } else if (comment.length > MAX_COMMENT_LENGTH) {
      next.comment = t('review.commentMaxLength', { max: MAX_COMMENT_LENGTH });
    }
    const prosFiltered = pros.filter((p) => p.trim());
    const consFiltered = cons.filter((c) => c.trim());
    if (prosFiltered.some((p) => p.length > MAX_PRO_CON_ITEM_LENGTH)) {
      next.pros = t('review.proConItemMaxLength', { max: MAX_PRO_CON_ITEM_LENGTH });
    }
    if (consFiltered.some((c) => c.length > MAX_PRO_CON_ITEM_LENGTH)) {
      next.cons = t('review.proConItemMaxLength', { max: MAX_PRO_CON_ITEM_LENGTH });
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const prosFiltered = pros.filter((p) => p.trim()).map((p) => p.trim());
    const consFiltered = cons.filter((c) => c.trim()).map((c) => c.trim());

    onSubmit({
      rating,
      comment: comment.trim(),
      pros: prosFiltered,
      cons: consFiltered,
    });
  };

  const addPro = () => {
    if (pros.length >= MAX_PRO_CON_ITEMS) return;
    setPros((prev) => [...prev, '']);
  };
  const removePro = (index) => {
    setPros((prev) => prev.filter((_, i) => i !== index));
  };
  const updatePro = (index, value) => {
    setPros((prev) => prev.map((p, i) => (i === index ? value : p)));
  };

  const addCon = () => {
    if (cons.length >= MAX_PRO_CON_ITEMS) return;
    setCons((prev) => [...prev, '']);
  };
  const removeCon = (index) => {
    setCons((prev) => prev.filter((_, i) => i !== index));
  };
  const updateCon = (index, value) => {
    setCons((prev) => prev.map((c, i) => (i === index ? value : c)));
  };

  const displayRating = hoverRating || rating;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
          {t('review.rating')} <span className="text-red-500">*</span>
        </label>
        <div
          className="flex gap-1"
          role="group"
          aria-label={t('review.ratingLabel', { count: rating })}
        >
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              className="text-2xl transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
              onClick={() => setRating(value)}
              onMouseEnter={() => setHoverRating(value)}
              onMouseLeave={() => setHoverRating(0)}
              aria-label={t('review.starRating', { count: value })}
              aria-pressed={rating === value}
            >
              {value <= displayRating ? (
                <span className="text-amber-500">★</span>
              ) : (
                <span className="text-slate-300 dark:text-slate-500">☆</span>
              )}
            </button>
          ))}
        </div>
        {errors.rating && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
            {errors.rating}
          </p>
        )}
      </div>

      <div className="w-full">
        <label htmlFor="review-comment" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
          {t('review.comment')} <span className="text-red-500">*</span>
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={MAX_COMMENT_LENGTH}
          rows={4}
          className="block w-full resize-y min-h-[100px] rounded-lg border px-3 py-2 text-base shadow-sm transition-colors border-slate-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 placeholder:text-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
          aria-invalid={errors.comment ? 'true' : undefined}
        />
        {errors.comment && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">{errors.comment}</p>
        )}
        {!errors.comment && (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('review.commentHint', { max: MAX_COMMENT_LENGTH })}</p>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
          {t('review.pros')} ({t('review.optional')})
        </label>
        {pros.map((item, index) => (
          <div key={index} className="mb-2 flex gap-2">
            <input
              type="text"
              value={item}
              onChange={(e) => updatePro(index, e.target.value)}
              maxLength={MAX_PRO_CON_ITEM_LENGTH}
              placeholder={t('review.prosPlaceholder')}
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removePro(index)}
              disabled={pros.length <= 1}
              aria-label={t('review.removeItem')}
            >
              −
            </Button>
          </div>
        ))}
        {pros.length < MAX_PRO_CON_ITEMS && (
          <Button type="button" variant="ghost" size="sm" onClick={addPro}>
            + {t('review.addPro')}
          </Button>
        )}
        {errors.pros && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
            {errors.pros}
          </p>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
          {t('review.cons')} ({t('review.optional')})
        </label>
        {cons.map((item, index) => (
          <div key={index} className="mb-2 flex gap-2">
            <input
              type="text"
              value={item}
              onChange={(e) => updateCon(index, e.target.value)}
              maxLength={MAX_PRO_CON_ITEM_LENGTH}
              placeholder={t('review.consPlaceholder')}
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeCon(index)}
              disabled={cons.length <= 1}
              aria-label={t('review.removeItem')}
            >
              −
            </Button>
          </div>
        ))}
        {cons.length < MAX_PRO_CON_ITEMS && (
          <Button type="button" variant="ghost" size="sm" onClick={addCon}>
            + {t('review.addCon')}
          </Button>
        )}
        {errors.cons && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
            {errors.cons}
          </p>
        )}
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" loading={loading} disabled={loading}>
          {submitLabel ?? (isEdit ? t('common.save') : t('review.submit'))}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
            {t('common.cancel')}
          </Button>
        )}
      </div>
    </form>
  );
}

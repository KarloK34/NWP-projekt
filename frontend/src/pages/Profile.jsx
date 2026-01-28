import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import useMyReviews from '../hooks/useMyReviews';
import useWatchlist from '../hooks/useWatchlist';
import { Card } from '../components/UI/Card';
import Spinner from '../components/UI/Spinner';
import Button from '../components/UI/Button';
import ReviewCard from '../components/Review/ReviewCard';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    items: myReviews,
    page,
    pages,
    total: reviewsTotal,
    loading: reviewsLoading,
    error: reviewsError,
    deleteReview,
    mutating: reviewsMutating,
    goToPage,
  } = useMyReviews({ page: 1, limit: 5 });
  const { tools: watchlistTools, loading: watchlistLoading, error: watchlistError } = useWatchlist();

  if (!user) {
    return (
      <div className="mx-auto max-w-4xl p-8">
        <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400">
          <Spinner size="md" />
          <span>{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  const roleLabel = user.role === 'admin' ? t('profile.roleAdmin') : t('profile.roleUser');

  const handleEditReview = (review) => {
    const toolId = typeof review.tool === 'object' ? review.tool?._id : review.tool;
    if (toolId) navigate(`/tool/${toolId}`);
  };

  return (
    <div className="container-app mx-auto max-w-4xl p-6 md:p-8">
      <h1 className="mb-8 text-2xl font-bold text-slate-800 dark:text-slate-100">
        {t('profile.title')}
      </h1>

      <Card className="mb-8 max-w-xl">
        <h2 className="mb-6 text-lg font-semibold text-slate-800 dark:text-slate-100">
          {t('profile.infoSection')}
        </h2>
        <div className="flex flex-col gap-6">
          <div className="flex justify-between border-b border-slate-200 pb-4 dark:border-slate-700">
            <span className="font-medium text-slate-600 dark:text-slate-400">
              {t('profile.username')}
            </span>
            <span className="text-slate-800 dark:text-slate-100">{user.username}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 pb-4 dark:border-slate-700">
            <span className="font-medium text-slate-600 dark:text-slate-400">
              {t('profile.email')}
            </span>
            <span className="text-slate-800 dark:text-slate-100">{user.email}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 pb-4 dark:border-slate-700">
            <span className="font-medium text-slate-600 dark:text-slate-400">
              {t('profile.role')}
            </span>
            <span className="text-slate-800 dark:text-slate-100">{roleLabel}</span>
          </div>
        </div>
      </Card>

      {/* Watchlist preview */}
      <Card className="mb-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            {t('profile.watchlistSection')}
          </h2>
          {watchlistTools.length > 0 && (
            <Link
              to="/watchlist"
              className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-400"
            >
              {t('profile.viewAllWatchlist')}
            </Link>
          )}
        </div>
        {watchlistLoading ? (
          <div className="flex items-center gap-2 py-4 text-slate-600 dark:text-slate-400">
            <Spinner size="sm" />
            <span>{t('common.loading')}</span>
          </div>
        ) : watchlistError ? (
          <p className="py-4 text-sm text-red-600 dark:text-red-400">{watchlistError}</p>
        ) : watchlistTools.length === 0 ? (
          <p className="py-4 text-slate-600 dark:text-slate-400">{t('profile.watchlistEmpty')}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {watchlistTools.slice(0, 5).map((tool) => (
              <li key={tool._id}>
                <Link
                  to={`/tool/${tool._id}`}
                  className="text-primary-600 hover:underline dark:text-primary-400"
                >
                  {tool.name}
                </Link>
              </li>
            ))}
            {watchlistTools.length > 5 && (
              <li>
                <Link
                  to="/watchlist"
                  className="text-sm text-primary-600 hover:underline dark:text-primary-400"
                >
                  +{watchlistTools.length - 5} {t('profile.moreTools')}
                </Link>
              </li>
            )}
          </ul>
        )}
      </Card>

      {/* My reviews */}
      <Card>
        <h2 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-100">
          {t('profile.myReviewsSection')}
        </h2>
        {reviewsLoading ? (
          <div className="flex items-center gap-2 py-8 text-slate-600 dark:text-slate-400">
            <Spinner size="md" />
            <span>{t('common.loading')}</span>
          </div>
        ) : reviewsError ? (
          <p className="py-6 text-red-600 dark:text-red-400">{reviewsError}</p>
        ) : myReviews.length === 0 ? (
          <p className="py-6 text-slate-600 dark:text-slate-400">{t('profile.noReviews')}</p>
        ) : (
          <>
            <ul className="flex flex-col gap-4">
              {myReviews.map((review) => (
                <li key={review._id}>
                  <div className="mb-2">
                    {review.tool && (
                      <Link
                        to={`/tool/${typeof review.tool === 'object' ? review.tool._id : review.tool}`}
                        className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-400"
                      >
                        {typeof review.tool === 'object' ? review.tool.name : t('common.loading')}
                      </Link>
                    )}
                  </div>
                  <ReviewCard
                    review={review}
                    onEdit={handleEditReview}
                    onDelete={deleteReview}
                    isDeleting={reviewsMutating}
                  />
                </li>
              ))}
            </ul>
            {pages > 1 && (
              <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-4 dark:border-slate-700">
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {t('common.page')} {page} {t('common.of')} {pages} ({reviewsTotal}{' '}
                  {t('review.sectionTitle').toLowerCase()})
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => goToPage(page - 1)}
                  >
                    {t('common.previous')}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page >= pages}
                    onClick={() => goToPage(page + 1)}
                  >
                    {t('common.next')}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default Profile;

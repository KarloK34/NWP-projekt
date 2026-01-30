import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import useTool from '../hooks/useTool';
import useWatchlist from '../hooks/useWatchlist';
import useWindowSize from '../hooks/useWindowSize';
import Button from '../components/UI/Button';
import Spinner from '../components/UI/Spinner';
import { Card } from '../components/UI/Card';
import ReviewsList from '../components/Review/ReviewsList';

const pricingKeys = {
  free: 'tool.free',
  paid: 'tool.paid',
  freemium: 'tool.freemium',
};

const ToolDetails = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { tool, loading, error, refetch: refetchTool } = useTool(id);
  const { tools: watchlistTools, addToWatchlist, removeFromWatchlist, mutating: watchlistMutating } = useWatchlist();
  const { width } = useWindowSize();
  const isMobile = width < 768;

  const isInWatchlist = tool ? watchlistTools.some((t) => (t._id || t) === (tool._id || tool)) : false;

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="mb-4 flex items-center gap-1">
        {[...Array(fullStars)].map((_, i) => (
          <span key={i} className="text-amber-500 text-2xl">★</span>
        ))}
        {hasHalfStar && <span className="text-amber-500 text-2xl">☆</span>}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={i} className="text-slate-300 text-2xl">☆</span>
        ))}
        <span className="ml-2 text-slate-600">
          {rating > 0 ? rating.toFixed(1) : t('tool.rating')} ({tool?.reviewCount || 0} {t('tool.reviews')})
        </span>
      </div>
    );
  };

  const getPricingBadge = (pricing) => {
    const key = pricingKeys[pricing] ?? pricingKeys.free;
    const colors = {
      free: 'bg-accent-600',
      paid: 'bg-red-600',
      freemium: 'bg-amber-500',
    };
    const color = colors[pricing] ?? colors.free;
    return (
      <span className={`rounded-full px-4 py-2 text-sm font-semibold text-white ${color}`}>
        {t(key)}
      </span>
    );
  };

  const handleWatchlistToggle = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!tool) return;
    const toolId = tool._id;
    if (isInWatchlist) {
      await removeFromWatchlist(toolId);
    } else {
      await addToWatchlist(toolId);
    }
  };

  if (loading) {
    return (
      <div className="container-app mx-auto max-w-4xl p-6 md:p-8">
        <div className="flex items-center justify-center gap-2 py-16 text-slate-600 dark:text-slate-400">
          <Spinner size="lg" />
          <span>{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  if (error || !tool) {
    return (
      <div className="container-app mx-auto max-w-4xl p-6 md:p-8">
        <div className="rounded-lg bg-red-50 p-8 text-center text-red-700 dark:bg-red-900/30 dark:text-red-300">
          <h2 className="mb-2 text-xl font-semibold text-red-800 dark:text-red-200">{t('common.error')}</h2>
          <p>{error || t('tool.notFound')}</p>
          <Link
            to="/"
            className="mt-4 inline-block text-primary-600 no-underline hover:underline"
          >
            ← {t('tool.backToHome')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`container-app mx-auto max-w-4xl p-6 md:p-8 ${isMobile ? 'px-4' : ''}`}>
      <Button
        variant="secondary"
        onClick={() => navigate(-1)}
        className="mb-6"
      >
        ← {t('common.back')}
      </Button>

      <Card padding={false} className="overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="mb-8 flex flex-col gap-6 border-b border-slate-200 pb-8 dark:border-slate-700 md:flex-row md:gap-8">
            {tool.logo && (
              <div className="flex h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-slate-100 md:h-32 md:w-32">
                <img src={tool.logo} alt={tool.name} className="h-full w-full object-cover" />
              </div>
            )}
            <div className="flex-1">
              <h1 className="mb-2 text-2xl font-bold text-slate-800 dark:text-slate-100">{tool.name}</h1>
              {tool.category && (
                <Link
                  to={`/?category=${tool.category.slug || tool.category._id}`}
                  className="mb-4 block text-primary-600 no-underline hover:underline"
                >
                  {tool.category.name}
                </Link>
              )}
              {renderStars(tool.rating || 0)}
              <div className="mt-2 flex gap-2">{getPricingBadge(tool.pricing)}</div>
            </div>
          </div>

          <div className="mb-8 flex flex-wrap gap-4">
            {tool.website && (
              <a
                href={tool.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-3 font-semibold text-white no-underline transition-colors hover:bg-primary-700"
              >
                🌐 {t('tool.visitWebsite')}
              </a>
            )}
            <Button
              variant="secondary"
              onClick={handleWatchlistToggle}
              disabled={watchlistMutating}
              loading={watchlistMutating}
            >
              {!isAuthenticated ? (
                <>🔒 {t('tool.loginForWatchlist')}</>
              ) : isInWatchlist ? (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="size-5"
                    aria-hidden
                  >
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-2.72 2.72a.75.75 0 101.06 1.06L10 11.06l2.72 2.72a.75.75 0 101.06-1.06L11.06 10l2.72-2.72a.75.75 0 00-1.06-1.06L10 8.94 7.28 6.22z" />
                  </svg>
                  {t('tool.removeFromWatchlist')}
                </>
              ) : (
                <>⭐ {t('tool.addToWatchlist')}</>
              )}
            </Button>
          </div>

          <section className="mb-8 border-b border-slate-200 pb-8 dark:border-slate-700">
            <h2 className="mb-4 text-xl font-bold text-slate-800 dark:text-slate-100">{t('tool.description')}</h2>
            <p className="whitespace-pre-wrap leading-relaxed text-slate-600 dark:text-slate-300">{tool.description}</p>
          </section>

          {tool.models && tool.models.length > 0 && (
            <section className="mb-8 border-b border-slate-200 pb-8 dark:border-slate-700">
              <h2 className="mb-4 text-xl font-bold text-slate-800 dark:text-slate-100">{t('tool.aiModels')}</h2>
              <div className="flex flex-wrap gap-3">
                {tool.models.map((model) => (
                  <span
                    key={model._id || model}
                    className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                  >
                    {model.name || model}
                  </span>
                ))}
              </div>
            </section>
          )}

          {tool.tags && tool.tags.length > 0 && (
            <section className="mb-8 border-b border-slate-200 pb-8 dark:border-slate-700">
              <h2 className="mb-4 text-xl font-bold text-slate-800 dark:text-slate-100">{t('tool.tags')}</h2>
              <div className="flex flex-wrap gap-3">
                {tool.tags.map((tag) => (
                  <span
                    key={tag._id || tag}
                    className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                  >
                    {tag.name || tag}
                  </span>
                ))}
              </div>
            </section>
          )}

          {(tool.metadata &&
            (tool.metadata.githubUrl ||
              tool.metadata.huggingFaceUrl ||
              tool.metadata.apiDocumentation)) ||
          (tool.models &&
            tool.models.some((m) => m.huggingFaceModelId && m.huggingFaceModelId.trim())) ? (
            <section className="mb-8 border-b border-slate-200 pb-8 dark:border-slate-700">
              <h2 className="mb-4 text-xl font-bold text-slate-800 dark:text-slate-100">
                {t('tool.additionalResources')}
              </h2>
              <div className="flex flex-wrap gap-4">
                {tool.metadata?.githubUrl && (
                  <a
                    href={tool.metadata.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-3 font-medium text-slate-800 no-underline transition-colors hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                  >
                    📦 GitHub
                  </a>
                )}
                {tool.metadata?.huggingFaceUrl && (
                  <a
                    href={tool.metadata.huggingFaceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-3 font-medium text-slate-800 no-underline transition-colors hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                  >
                    🤗 Hugging Face
                  </a>
                )}
                {tool.metadata?.apiDocumentation && (
                  <a
                    href={tool.metadata.apiDocumentation}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-3 font-medium text-slate-800 no-underline transition-colors hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                  >
                    📚 API
                  </a>
                )}
                {tool.models
                  ?.filter((m) => m.huggingFaceModelId?.trim())
                  .map((model) => (
                    <a
                      key={model._id || model.huggingFaceModelId}
                      href={`https://huggingface.co/${model.huggingFaceModelId.trim()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-3 font-medium text-slate-800 no-underline transition-colors hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                    >
                      🤗 {model.name || model.huggingFaceModelId}
                    </a>
                  ))}
              </div>
            </section>
          ) : null}

          <section className="pt-8">
            <ReviewsList toolId={id} onReviewChange={refetchTool} />
          </section>
        </div>
      </Card>
    </div>
  );
};

export default ToolDetails;

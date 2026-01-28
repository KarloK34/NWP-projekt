import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const pricingKeys = {
  free: 'tool.free',
  paid: 'tool.paid',
  freemium: 'tool.freemium',
};

const ToolCard = ({ tool }) => {
  const { t } = useTranslation();

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center gap-1 mb-3">
        {[...Array(fullStars)].map((_, i) => (
          <span key={i} className="text-amber-500 text-base">★</span>
        ))}
        {hasHalfStar && <span className="text-amber-500 text-base">☆</span>}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={i} className="text-slate-300 text-base">☆</span>
        ))}
        <span className="ml-2 text-sm text-slate-600">
          {rating > 0 ? rating.toFixed(1) : t('tool.rating')} ({tool.reviewCount || 0} {t('tool.reviews')})
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
      <span className={`rounded-full px-3 py-1 text-xs font-semibold text-white ${color}`}>
        {t(key)}
      </span>
    );
  };

  return (
    <Link
      to={`/tool/${tool._id}`}
      className="block h-full overflow-hidden rounded-xl border border-slate-200 bg-white text-inherit no-underline shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5"
    >
      <div className="flex h-full flex-col p-6">
        {tool.logo && (
          <div className="mb-4 flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
            <img src={tool.logo} alt={tool.name} className="h-full w-full object-cover" />
          </div>
        )}
        <h3 className="mb-2 text-lg font-bold text-slate-800">{tool.name}</h3>
        <p className="mb-4 flex-1 text-sm leading-relaxed text-slate-600">
          {tool.description.length > 150
            ? `${tool.description.substring(0, 150)}...`
            : tool.description}
        </p>
        {tool.category && (
          <div className="mb-3 flex items-center gap-2 text-sm">
            <span className="text-slate-500">{t('tool.category')}</span>
            <span className="font-medium text-primary-600">{tool.category.name}</span>
          </div>
        )}
        {renderStars(tool.rating || 0)}
        {tool.tags && tool.tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {tool.tags.slice(0, 3).map((tag) => (
              <span
                key={tag._id || tag}
                className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600"
              >
                {tag.name || tag}
              </span>
            ))}
            {tool.tags.length > 3 && (
              <span className="px-2 py-1 text-xs italic text-slate-500">
                +{tool.tags.length - 3}
              </span>
            )}
          </div>
        )}
        <div className="mt-auto flex justify-end">{getPricingBadge(tool.pricing)}</div>
      </div>
    </Link>
  );
};

export default ToolCard;

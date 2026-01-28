/**
 * Skeleton screen komponente – placeholder za učitavanje sadržaja.
 */
export function Skeleton({ className = '', ...props }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-200 ${className}`.trim()}
      aria-hidden
      {...props}
    />
  );
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`.trim()}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 ${i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'}`}
        />
      ))}
    </div>
  );
}

/** Skeleton za ToolCard – prikaz kartice alata tijekom učitavanja. */
export function SkeletonToolCard() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-[var(--shadow-card)]">
      <Skeleton className="mb-4 h-14 w-14 rounded-lg" />
      <Skeleton className="mb-2 h-6 w-3/4" />
      <SkeletonText lines={3} className="mb-4" />
      <Skeleton className="mb-2 h-4 w-1/3" />
      <div className="mb-4 flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="mt-auto flex justify-end">
        <Skeleton className="h-7 w-20 rounded-lg" />
      </div>
    </div>
  );
}

/** Skeleton za listu alata (grid). */
export function SkeletonToolGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonToolCard key={i} />
      ))}
    </div>
  );
}

export default Skeleton;

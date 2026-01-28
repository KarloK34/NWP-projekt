/**
 * Loading spinner – varijante: default (primary), small, large.
 */
const sizeClasses = {
  sm: 'size-5 border-2',
  md: 'size-8 border-2',
  lg: 'size-12 border-[3px]',
};

export default function Spinner({ size = 'md', className = '' }) {
  const sizeClass = sizeClasses[size] ?? sizeClasses.md;
  return (
    <span
      role="status"
      aria-label="Učitavanje"
      className={`inline-block animate-spin rounded-full border-primary-600 border-t-transparent ${sizeClass} ${className}`.trim()}
    />
  );
}

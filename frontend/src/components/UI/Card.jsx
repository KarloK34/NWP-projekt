/**
 * Reusable Card komponenta – wrapper za sadržaj s paddingom i sjenom.
 * Može imati CardHeader, CardBody, CardFooter (opcionalno kroz children).
 */
export function Card({ children, className = '', padding = true, ...props }) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-card-hover)] dark:border-slate-700 dark:bg-slate-800 ${padding ? 'p-6' : ''} ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div
      className={`border-b border-slate-200 pb-4 mb-4 dark:border-slate-700 ${className}`.trim()}
    >
      {children}
    </div>
  );
}

export function CardBody({ children, className = '' }) {
  return <div className={className}>{children}</div>;
}

export function CardFooter({ children, className = '' }) {
  return (
    <div
      className={`mt-4 pt-4 border-t border-slate-200 flex items-center justify-end gap-2 dark:border-slate-700 ${className}`.trim()}
    >
      {children}
    </div>
  );
}

export default Card;

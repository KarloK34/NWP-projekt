/**
 * Reusable Input komponenta – text, email, password.
 * Podržava label, error, hint i fullWidth.
 */
export default function Input({
  id,
  label,
  type = 'text',
  error,
  hint,
  className = '',
  fullWidth = true,
  ...props
}) {
  const wrapperClass = fullWidth ? 'w-full' : '';
  const inputClass = [
    'block w-full rounded-lg border px-3 py-2 text-base shadow-sm transition-colors',
    'border-slate-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500',
    'placeholder:text-slate-400 disabled:bg-slate-100 disabled:cursor-not-allowed',
    error
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
      : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={wrapperClass}>
      {label && (
        <label
          htmlFor={id}
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={
          [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(' ') || undefined
        }
        className={inputClass}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1 text-sm text-slate-500">
          {hint}
        </p>
      )}
    </div>
  );
}

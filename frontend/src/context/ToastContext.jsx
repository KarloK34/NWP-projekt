import { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/UI/Toast';

const ToastContext = createContext(null);

const DEFAULT_DURATION = 4000;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = DEFAULT_DURATION) => {
    const id = crypto.randomUUID?.() ?? Date.now().toString(36);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message, type = 'info') => addToast(message, type, DEFAULT_DURATION),
    [addToast]
  );
  toast.success = (message) => addToast(message, 'success', DEFAULT_DURATION);
  toast.error = (message) => addToast(message, 'error', DEFAULT_DURATION);
  toast.info = (message) => addToast(message, 'info', DEFAULT_DURATION);
  toast.warning = (message) => addToast(message, 'warning', DEFAULT_DURATION);
  toast.dismiss = removeToast;

  return (
    <ToastContext.Provider value={{ toast, addToast, removeToast }}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 right-4 z-[100] flex max-w-sm flex-col gap-2 sm:bottom-6 sm:right-6"
        aria-live="polite"
        aria-label="Obavijesti"
      >
        {toasts.map((t) => (
          <Toast
            key={t.id}
            id={t.id}
            message={t.message}
            type={t.type}
            onClose={() => removeToast(t.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      toast: (msg, type) => console.info('[Toast]', type, msg),
      addToast: () => {},
      removeToast: () => {},
    };
  }
  return ctx;
}

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const ToastContext = createContext(null);

/** Small pop-up messages: const toast = useToast(); toast.success('Saved'); */
export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);

  const show = useCallback((type, message) => {
    const id = Date.now() + Math.random();
    setItems((list) => [...list, { id, type, message }]);
    setTimeout(() => setItems((list) => list.filter((t) => t.id !== id)), 3600);
  }, []);

  const api = useMemo(() => ({ success: (m) => show('success', m), error: (m) => show('error', m) }), [show]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>
            {t.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

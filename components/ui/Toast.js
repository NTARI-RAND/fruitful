'use client';
import { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextToastId = useRef(0);

  const toast = useCallback((msg, type = 'success') => {
    const id = nextToastId.current++;
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="sr-only" role="status" aria-atomic="false" aria-relevant="additions">
        {toasts.filter(t => t.type !== 'error').map(t => <div key={t.id}>{t.msg}</div>)}
      </div>
      <div className="sr-only" role="alert" aria-atomic="false" aria-relevant="additions">
        {toasts.filter(t => t.type === 'error').map(t => <div key={t.id}>{t.msg}</div>)}
      </div>
      <div className="toast-wrap" aria-hidden="true">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

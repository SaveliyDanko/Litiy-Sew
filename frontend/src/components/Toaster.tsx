import { useEffect, useState } from 'react';
import { TOAST_EVENT, type ToastPayload } from './toast';
import styles from './Toaster.module.css';

const HIDE_MS = 4000;

export default function Toaster() {
  const [toasts, setToasts] = useState<ToastPayload[]>([]);

  useEffect(() => {
    const onToast = (e: Event) => {
      const detail = (e as CustomEvent<ToastPayload>).detail;
      setToasts((prev) => [...prev, detail]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== detail.id));
      }, HIDE_MS);
    };
    window.addEventListener(TOAST_EVENT, onToast);
    return () => window.removeEventListener(TOAST_EVENT, onToast);
  }, []);

  const dismiss = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <div className={styles.container} role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={styles.toast}>
          <div className={styles.icon} aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v4" />
              <circle cx="12" cy="16" r="0.6" fill="currentColor" stroke="none" />
            </svg>
          </div>
          <div className={styles.body}>
            <p className={styles.message}>{t.message}</p>
            {t.action && (
              <a className={styles.action} href={t.action.href}>
                {t.action.label}
              </a>
            )}
          </div>
          <button
            type="button"
            className={styles.close}
            aria-label="Закрыть"
            onClick={() => dismiss(t.id)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M6 18L18 6" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}

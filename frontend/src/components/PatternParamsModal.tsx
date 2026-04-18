import { useEffect, useState } from 'react';
import styles from './PatternParamsModal.module.css';

type Props = {
  title: string;
  onClose: () => void;
  onConfirm: (params: { height: string; size: string }) => void;
};

const HEIGHTS = ['149-154', '155-160', '161-166', '167-172', '173-178', '179-184'];
const SIZES = ['38', '40', '42', '44', '46', '48', '50', '52', '54'];

export default function PatternParamsModal({ title, onClose, onConfirm }: Props) {
  const [height, setHeight] = useState<string | null>(null);
  const [size, setSize] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  const handleConfirm = () => {
    if (!height || !size) {
      setError('Выбор роста и размера обязателен');
      return;
    }
    onConfirm({ height, size });
  };

  return (
    <div className={styles.backdrop} onClick={onClose} role="presentation">
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label={`Параметры выкройки — ${title}`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.header}>
          <h2 className={styles.heading}>ПАРАМЕТРЫ ВЫКРОЙКИ</h2>
          <button type="button" className={styles.close} aria-label="Закрыть" onClick={onClose}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="5" y1="5" x2="19" y2="19" />
              <line x1="19" y1="5" x2="5" y2="19" />
            </svg>
          </button>
        </header>

        <div className={styles.body}>
          <section className={styles.group}>
            <h3 className={styles.groupTitle}>РОСТ (СМ)</h3>
            <div className={styles.options}>
              {HEIGHTS.map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`${styles.option} ${height === value ? styles.optionActive : ''}`}
                  onClick={() => {
                    setHeight(value);
                    setError(null);
                  }}
                >
                  {value}
                </button>
              ))}
            </div>
          </section>

          <section className={styles.group}>
            <h3 className={styles.groupTitle}>РАЗМЕР (RU)</h3>
            <div className={styles.options}>
              {SIZES.map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`${styles.option} ${size === value ? styles.optionActive : ''}`}
                  onClick={() => {
                    setSize(value);
                    setError(null);
                  }}
                >
                  {value}
                </button>
              ))}
            </div>
          </section>

          {error && <p className={styles.error}>{error}</p>}
        </div>

        <footer className={styles.footer}>
          <button type="button" className={styles.confirm} onClick={handleConfirm}>
            В КОРЗИНУ
          </button>
        </footer>
      </div>
    </div>
  );
}

import { useEffect } from 'react';
import { normalizeMediaSrcSet, normalizeMediaUrl } from '../utils/mediaUrls';
import styles from './Lightbox.module.css';

type Props = {
  src: string;
  srcSet?: string | null;
  alt: string;
  onClose: () => void;
};

export default function Lightbox({ src, srcSet, alt, onClose }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      onClick={onClose}
    >
      <button
        type="button"
        className={styles.close}
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        aria-label="Закрыть"
      >
        ×
      </button>
      <img
        className={styles.image}
        src={normalizeMediaUrl(src)}
        srcSet={normalizeMediaSrcSet(srcSet) ?? undefined}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

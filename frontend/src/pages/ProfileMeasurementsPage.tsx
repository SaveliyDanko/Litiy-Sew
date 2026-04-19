import { useEffect, useState, type FormEvent } from 'react';
import styles from './AuthPage.module.css';
import { CloseIcon, PlusIcon } from './authPageData';
import {
  createMeasurement,
  listMeasurements,
  type Measurement,
} from '../services/measurements';

const FULLNESS_GROUPS = ['0-я', '1-я', '2-я', '3-я', '4-я', '5-я'] as const;
type FullnessGroup = typeof FULLNESS_GROUPS[number];

type MeasurementForm = {
  name: string;
  comment: string;
  height: string;
  chest: string;
  waist: string;
  hips: string;
  fullness: FullnessGroup | null;
};

const EMPTY_FORM: MeasurementForm = {
  name: '',
  comment: '',
  height: '',
  chest: '',
  waist: '',
  hips: '',
  fullness: null,
};

function toIntOrNull(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export default function ProfileMeasurementsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<MeasurementForm>(EMPTY_FORM);
  const [items, setItems] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listMeasurements()
      .then((data) => setItems(data))
      .catch(() => setError('Не удалось загрузить мерки'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setModalOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [modalOpen]);

  const openModal = () => {
    setForm(EMPTY_FORM);
    setError(null);
    setModalOpen(true);
  };

  const updateField = <K extends keyof MeasurementForm>(field: K, value: MeasurementForm[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleNumeric = (field: 'height' | 'chest' | 'waist' | 'hips') =>
    (event: FormEvent<HTMLInputElement>) => {
      updateField(field, event.currentTarget.value.replace(/[^\d]/g, ''));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = form.name.trim();
    if (!name) {
      setError('Введите название мерки');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const saved = await createMeasurement({
        name,
        comment: form.comment.trim() || null,
        height: toIntOrNull(form.height),
        chest: toIntOrNull(form.chest),
        waist: toIntOrNull(form.waist),
        hips: toIntOrNull(form.hips),
        fullnessGroup: form.fullness,
      });
      setItems((current) => [saved, ...current]);
      setModalOpen(false);
    } catch {
      setError('Не удалось сохранить мерку');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.measurementsPage}>
      {!loading && items.length > 0 && (
        <ul className={styles.measurementList}>
          {items.map((item) => (
            <li key={item.id} className={styles.measurementCard}>
              <div className={styles.measurementCardHeader}>
                <span className={styles.measurementCardTitle}>{item.name}</span>
                {item.fullnessGroup && (
                  <span className={styles.measurementCardBadge}>{item.fullnessGroup}</span>
                )}
              </div>
              {item.comment && <p className={styles.measurementCardComment}>{item.comment}</p>}
              <dl className={styles.measurementCardStats}>
                {item.height != null && (
                  <div><dt>Рост</dt><dd>{item.height}</dd></div>
                )}
                {item.chest != null && (
                  <div><dt>Грудь</dt><dd>{item.chest}</dd></div>
                )}
                {item.waist != null && (
                  <div><dt>Талия</dt><dd>{item.waist}</dd></div>
                )}
                {item.hips != null && (
                  <div><dt>Бедра</dt><dd>{item.hips}</dd></div>
                )}
              </dl>
            </li>
          ))}
        </ul>
      )}

      <button type="button" className={styles.measurementAddTile} onClick={openModal}>
        <span className={styles.measurementAddIcon}>
          <PlusIcon />
        </span>
        <span className={styles.measurementAddLabel}>Добавить новую мерку</span>
      </button>

      {modalOpen && (
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          aria-label="Новая мерка"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setModalOpen(false);
          }}
        >
          <div className={styles.modal}>
            <button
              type="button"
              className={styles.modalClose}
              aria-label="Закрыть"
              onClick={() => setModalOpen(false)}
            >
              <CloseIcon />
            </button>
            <form className={styles.measurementForm} onSubmit={handleSubmit}>
              <label className={styles.measurementField}>
                <span className={styles.measurementLabel}>Название мерки</span>
                <input
                  className={styles.measurementInput}
                  type="text"
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  maxLength={80}
                  required
                />
              </label>

              <label className={styles.measurementField}>
                <span className={styles.measurementLabel}>Комментарий</span>
                <textarea
                  className={styles.measurementTextarea}
                  value={form.comment}
                  onChange={(e) => updateField('comment', e.target.value)}
                  rows={3}
                  maxLength={500}
                />
              </label>

              <label className={styles.measurementField}>
                <span className={styles.measurementLabel}>Рост</span>
                <input
                  className={styles.measurementInput}
                  type="number"
                  inputMode="numeric"
                  value={form.height}
                  onChange={handleNumeric('height')}
                  min={0}
                />
              </label>

              <label className={styles.measurementField}>
                <span className={styles.measurementLabel}>Обхват груди</span>
                <input
                  className={styles.measurementInput}
                  type="number"
                  inputMode="numeric"
                  value={form.chest}
                  onChange={handleNumeric('chest')}
                  min={0}
                />
              </label>

              <label className={styles.measurementField}>
                <span className={styles.measurementLabel}>Обхват талии</span>
                <input
                  className={styles.measurementInput}
                  type="number"
                  inputMode="numeric"
                  value={form.waist}
                  onChange={handleNumeric('waist')}
                  min={0}
                />
              </label>

              <label className={styles.measurementField}>
                <span className={styles.measurementLabel}>Обхват бедер</span>
                <input
                  className={styles.measurementInput}
                  type="number"
                  inputMode="numeric"
                  value={form.hips}
                  onChange={handleNumeric('hips')}
                  min={0}
                />
              </label>

              <div className={styles.measurementField}>
                <span className={styles.measurementLabel}>
                  Полнотная группа (<a href="#calc" className={styles.measurementCalc} onClick={(e) => e.preventDefault()}>рассчитать</a>)
                </span>
                <div className={styles.fullnessRow} role="radiogroup" aria-label="Полнотная группа">
                  {FULLNESS_GROUPS.map((group) => (
                    <button
                      key={group}
                      type="button"
                      role="radio"
                      aria-checked={form.fullness === group}
                      className={`${styles.fullnessBtn} ${form.fullness === group ? styles.fullnessBtnActive : ''}`}
                      onClick={() => updateField('fullness', group)}
                    >
                      {group}
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className={styles.error}>{error}</p>}

              <button type="submit" className={styles.measurementSave} disabled={submitting}>
                {submitting ? 'Сохранение...' : 'Сохранить'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

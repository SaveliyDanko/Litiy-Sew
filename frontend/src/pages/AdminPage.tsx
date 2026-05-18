import { useEffect, useRef, useState } from 'react';
import Toaster from '../components/Toaster';
import { showToast } from '../components/toast';
import { useAuth } from '../hooks/useAuth';
import { SHOP_ENABLED } from '../utils/featureFlags';
import {
  deleteSiteImage,
  fetchAllSiteImages,
  updateSiteImagePosition,
  upsertSiteImage,
  type SiteImage,
} from '../services/siteImages';
import {
  createPattern,
  createPortfolioPhoto,
  createProduct,
  deleteHero,
  deletePattern,
  updateHeroPosition,
  deletePortfolioPhoto,
  deleteProduct,
  getHero,
  listPatterns,
  listPortfolio,
  listProducts,
  reorderPortfolioPhoto,
  replaceHero,
  updateAdminCredentials,
  uploadFile,
  type AdminHeroBanner,
  type AdminPatternItem,
  type AdminPortfolioPhoto,
  type AdminProduct,
} from '../services/admin';
import { ALL_COLLECTIONS } from './collectionsData';
import styles from './AdminPage.module.css';

type Tab = 'products' | 'patterns' | 'portfolio' | 'hero' | 'about' | 'collections' | 'settings';

// ─── Products ────────────────────────────────────────────────────────────────

function ProductsSection() {
  const [items, setItems] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ title: '', price: '', description: '' });
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    listProducts().then(setItems).finally(() => setLoading(false));
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) { showToast('Выберите изображение'); return; }
    if (!form.title.trim()) { showToast('Введите название'); return; }
    setUploading(true);
    try {
      const { publicUrl, key } = await uploadFile(file);
      const created = await createProduct({
        title: form.title.trim(),
        price: Number(form.price) || 0,
        description: form.description.trim() || undefined,
        imageUrl: publicUrl,
        imageKey: key,
      });
      setItems((prev) => [created, ...prev]);
      setForm({ title: '', price: '', description: '' });
      setPreview(null);
      if (fileRef.current) fileRef.current.value = '';
      showToast('Товар добавлен');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Ошибка загрузки');
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Удалить товар?')) return;
    await deleteProduct(id);
    setItems((prev) => prev.filter((p) => p.id !== id));
    showToast('Удалено');
  }

  return (
    <div className={styles.section}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formHeader}>
          <h2 className={styles.sectionTitle}>Добавить товар</h2>
          <p className={styles.formHint}>Фото появится в каталоге товаров на сайте</p>
        </div>
        <label className={styles.field}>
          <span className={styles.label}>Фото</span>
          <input ref={fileRef} type="file" accept="image/*" className={styles.input} onChange={handleFileChange} />
        </label>
        {preview && <img src={preview} alt="Предпросмотр" className={styles.filePreview} />}
        <label className={styles.field}>
          <span className={styles.label}>Название</span>
          <input
            className={styles.input}
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Платье летнее"
          />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Цена, ₽</span>
          <input
            className={styles.input}
            type="number"
            min="0"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            placeholder="2500"
          />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Описание</span>
          <textarea
            className={styles.input}
            rows={3}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Необязательно"
          />
        </label>
        <button className={styles.submit} type="submit" disabled={uploading}>
          {uploading ? 'Загрузка…' : 'Добавить'}
        </button>
      </form>

      {loading ? (
        <p className={styles.hint}>Загрузка…</p>
      ) : items.length === 0 ? (
        <p className={styles.hint}>Товаров пока нет</p>
      ) : (
        <div className={styles.grid}>
          {items.map((p) => (
            <div key={p.id} className={styles.card}>
              <img src={p.imageUrl} alt={p.title} className={styles.cardImg} />
              <div className={styles.cardBody}>
                <p className={styles.cardTitle}>{p.title}</p>
                <p className={styles.cardMeta}>{p.price} ₽</p>
              </div>
              <button className={styles.deleteBtn} onClick={() => handleDelete(p.id)} aria-label="Удалить">×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Patterns ────────────────────────────────────────────────────────────────

const PATTERN_CATEGORIES = [
  { value: 'skirts', label: 'Юбки' },
  { value: 'dresses', label: 'Платья' },
  { value: 'blouses', label: 'Блузки' },
  { value: 'trousers', label: 'Брюки' },
  { value: 'jackets', label: 'Жакеты' },
  { value: 'coats', label: 'Пальто' },
];

function PatternsSection() {
  const [items, setItems] = useState<AdminPatternItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    title: '', category: 'skirts', price: '', description: '', sizes: '', heights: '',
  });
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    listPatterns().then(setItems).finally(() => setLoading(false));
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) { showToast('Выберите изображение'); return; }
    if (!form.title.trim()) { showToast('Введите название'); return; }
    setUploading(true);
    try {
      const { publicUrl, key } = await uploadFile(file);
      const created = await createPattern({
        title: form.title.trim(),
        category: form.category,
        price: Number(form.price) || 0,
        description: form.description.trim() || undefined,
        previewUrl: publicUrl,
        previewKey: key,
        sizes: form.sizes.trim(),
        heights: form.heights.trim(),
      });
      setItems((prev) => [created, ...prev]);
      setForm({ title: '', category: 'skirts', price: '', description: '', sizes: '', heights: '' });
      setPreview(null);
      if (fileRef.current) fileRef.current.value = '';
      showToast('Выкройка добавлена');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Ошибка загрузки');
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Удалить выкройку?')) return;
    await deletePattern(id);
    setItems((prev) => prev.filter((p) => p.id !== id));
    showToast('Удалено');
  }

  return (
    <div className={styles.section}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formHeader}>
          <h2 className={styles.sectionTitle}>Добавить выкройку</h2>
          <p className={styles.formHint}>Превью появится в каталоге выкроек на сайте</p>
        </div>
        <label className={styles.field}>
          <span className={styles.label}>Превью</span>
          <input ref={fileRef} type="file" accept="image/*" className={styles.input} onChange={handleFileChange} />
        </label>
        {preview && <img src={preview} alt="Предпросмотр" className={styles.filePreview} />}
        <label className={styles.field}>
          <span className={styles.label}>Название</span>
          <input
            className={styles.input}
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Юбка-солнце"
          />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Категория</span>
          <select
            className={styles.input}
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          >
            {PATTERN_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Цена, ₽</span>
          <input
            className={styles.input}
            type="number"
            min="0"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            placeholder="500"
          />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Размеры (через запятую)</span>
          <input
            className={styles.input}
            value={form.sizes}
            onChange={(e) => setForm((f) => ({ ...f, sizes: e.target.value }))}
            placeholder="38,40,42,44,46"
          />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Рост (через запятую)</span>
          <input
            className={styles.input}
            value={form.heights}
            onChange={(e) => setForm((f) => ({ ...f, heights: e.target.value }))}
            placeholder="155-160,161-166,167-172"
          />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Описание</span>
          <textarea
            className={styles.input}
            rows={3}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Необязательно"
          />
        </label>
        <button className={styles.submit} type="submit" disabled={uploading}>
          {uploading ? 'Загрузка…' : 'Добавить'}
        </button>
      </form>

      {loading ? (
        <p className={styles.hint}>Загрузка…</p>
      ) : items.length === 0 ? (
        <p className={styles.hint}>Выкроек пока нет</p>
      ) : (
        <div className={styles.grid}>
          {items.map((p) => (
            <div key={p.id} className={styles.card}>
              <img src={p.previewUrl} alt={p.title} className={styles.cardImg} />
              <div className={styles.cardBody}>
                <p className={styles.cardTitle}>{p.title}</p>
                <p className={styles.cardMeta}>{p.category} · {p.price} ₽</p>
                <p className={styles.cardMeta}>Размеры: {p.sizes}</p>
                <p className={styles.cardMeta}>Рост: {p.heights}</p>
              </div>
              <button className={styles.deleteBtn} onClick={() => handleDelete(p.id)} aria-label="Удалить">×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Portfolio ───────────────────────────────────────────────────────────────

function PortfolioSection() {
  const [items, setItems] = useState<AdminPortfolioPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [caption, setCaption] = useState('');
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    listPortfolio().then(setItems).finally(() => setLoading(false));
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) { showToast('Выберите фото'); return; }
    setUploading(true);
    try {
      const { publicUrl, key } = await uploadFile(file);
      const maxOrder = items.length > 0 ? Math.max(...items.map((i) => i.sortOrder)) : -1;
      const created = await createPortfolioPhoto({
        photoUrl: publicUrl,
        photoKey: key,
        caption: caption.trim() || undefined,
        sortOrder: maxOrder + 1,
      });
      setItems((prev) => [...prev, created]);
      setCaption('');
      setPreview(null);
      if (fileRef.current) fileRef.current.value = '';
      showToast('Фото добавлено');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Ошибка загрузки');
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Удалить фото?')) return;
    await deletePortfolioPhoto(id);
    setItems((prev) => prev.filter((p) => p.id !== id));
    showToast('Удалено');
  }

  async function handleMove(item: AdminPortfolioPhoto, direction: 'up' | 'down') {
    const idx = items.findIndex((i) => i.id === item.id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= items.length) return;

    const newOrder = item.sortOrder;
    const swapOrder = items[swapIdx].sortOrder;

    await reorderPortfolioPhoto(item.id, swapOrder);
    await reorderPortfolioPhoto(items[swapIdx].id, newOrder);

    const updated = [...items];
    updated[idx] = { ...item, sortOrder: swapOrder };
    updated[swapIdx] = { ...items[swapIdx], sortOrder: newOrder };
    updated.sort((a, b) => a.sortOrder - b.sortOrder || a.createdAt.localeCompare(b.createdAt));
    setItems(updated);
  }

  return (
    <div className={styles.section}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formHeader}>
          <h2 className={styles.sectionTitle}>Добавить фото</h2>
          <p className={styles.formHint}>Фото появится в галерее на странице «О мастере»</p>
        </div>
        <label className={styles.field}>
          <span className={styles.label}>Фото</span>
          <input ref={fileRef} type="file" accept="image/*" className={styles.input} onChange={handleFileChange} />
        </label>
        {preview && <img src={preview} alt="Предпросмотр" className={styles.filePreviewPortrait} />}
        <label className={styles.field}>
          <span className={styles.label}>Подпись (необязательно)</span>
          <input
            className={styles.input}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Весенняя коллекция 2024"
          />
        </label>
        <button className={styles.submit} type="submit" disabled={uploading}>
          {uploading ? 'Загрузка…' : 'Добавить'}
        </button>
      </form>

      {loading ? (
        <p className={styles.hint}>Загрузка…</p>
      ) : items.length === 0 ? (
        <p className={styles.hint}>Фото пока нет</p>
      ) : (
        <div className={styles.grid}>
          {items.map((p, idx) => (
            <div key={p.id} className={styles.card}>
              <img src={p.photoUrl} alt={p.caption ?? ''} className={styles.cardImgPortrait} />
              {p.caption && <p className={styles.cardCaption}>{p.caption}</p>}
              <div className={styles.cardActions}>
                <button
                  className={styles.orderBtn}
                  onClick={() => handleMove(p, 'up')}
                  disabled={idx === 0}
                  aria-label="Переместить вверх"
                >↑</button>
                <button
                  className={styles.orderBtn}
                  onClick={() => handleMove(p, 'down')}
                  disabled={idx === items.length - 1}
                  aria-label="Переместить вниз"
                >↓</button>
                <button className={styles.deleteBtn} onClick={() => handleDelete(p.id)} aria-label="Удалить">×</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Hero Banner ─────────────────────────────────────────────────────────────

function HeroSection() {
  const [current, setCurrent] = useState<AdminHeroBanner | null | undefined>(undefined);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [posX, setPosX] = useState(50);
  const [posY, setPosY] = useState(50);
  const [saving, setSaving] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getHero()
      .then((hero) => {
        setCurrent(hero);
        if (hero) {
          setPosX(hero.positionX ?? 50);
          setPosY(hero.positionY ?? 50);
        }
      })
      .catch(() => setCurrent(null));
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  function handlePositionChange(axis: 'x' | 'y', val: number) {
    if (axis === 'x') setPosX(val); else setPosY(val);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      setSaving(true);
      try {
        const newX = axis === 'x' ? val : posX;
        const newY = axis === 'y' ? val : posY;
        await updateHeroPosition(newX, newY);
      } catch {
        showToast('Ошибка сохранения позиции');
      } finally {
        setSaving(false);
      }
    }, 600);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) { showToast('Выберите изображение'); return; }
    setUploading(true);
    try {
      const { publicUrl, key } = await uploadFile(file);
      const created = await replaceHero({ imageUrl: publicUrl, imageKey: key, positionX: posX, positionY: posY });
      setCurrent(created);
      setPreview(null);
      if (fileRef.current) fileRef.current.value = '';
      showToast('Баннер обновлён');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Ошибка загрузки');
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Удалить баннер?')) return;
    await deleteHero();
    setCurrent(null);
    showToast('Баннер удалён');
  }

  const displayUrl = preview ?? current?.imageUrl ?? null;

  return (
    <div className={styles.section}>
      <div className={styles.formHeader}>
        <h2 className={styles.sectionTitle}>Баннер главной страницы</h2>
        <p className={styles.formHint}>Большое фоновое изображение в шапке главной страницы</p>
      </div>

      {current === undefined ? (
        <p className={styles.hint}>Загрузка…</p>
      ) : (
        <div className={styles.heroEditor}>
          {/* Live preview */}
          <div className={styles.heroPreviewWrap}>
            {displayUrl ? (
              <img
                src={displayUrl}
                alt="Предпросмотр баннера"
                className={styles.heroPreviewImg}
                style={{ objectPosition: `${posX}% ${posY}%` }}
              />
            ) : (
              <div className={styles.heroPreviewEmpty}>Баннер не установлен</div>
            )}
          </div>

          {/* Position sliders — only when banner exists */}
          {current && (
            <div className={styles.heroPositionBlock}>
              <p className={styles.heroPositionLabel}>
                Положение фото {saving && <span className={styles.heroSaving}>сохраняется…</span>}
              </p>
              <label className={styles.sliderField}>
                <span className={styles.sliderName}>Горизонталь</span>
                <input
                  type="range" min={0} max={100} value={posX}
                  className={styles.slider}
                  onChange={(e) => handlePositionChange('x', Number(e.target.value))}
                />
                <span className={styles.sliderValue}>{posX}%</span>
              </label>
              <label className={styles.sliderField}>
                <span className={styles.sliderName}>Вертикаль</span>
                <input
                  type="range" min={0} max={100} value={posY}
                  className={styles.slider}
                  onChange={(e) => handlePositionChange('y', Number(e.target.value))}
                />
                <span className={styles.sliderValue}>{posY}%</span>
              </label>
            </div>
          )}

          {/* Upload form */}
          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.field}>
              <span className={styles.label}>{current ? 'Новый баннер (заменит текущий)' : 'Загрузить баннер'}</span>
              <input ref={fileRef} type="file" accept="image/*" className={styles.input} onChange={handleFileChange} />
            </label>
            <button className={styles.submit} type="submit" disabled={uploading}>
              {uploading ? 'Загрузка…' : current ? 'Заменить' : 'Загрузить'}
            </button>
          </form>

          {current && (
            <button className={styles.deleteBannerBtn} onClick={handleDelete}>
              Удалить баннер
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Reusable site-image slot editor ─────────────────────────────────────────

type SlotConfig = {
  key: string;
  label: string;
  hint: string;
  portrait?: boolean;
};

function SiteImageSlot({ config, data, onUpdate }: {
  config: SlotConfig;
  data: SiteImage | null | undefined;
  onUpdate: (img: SiteImage | null) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [posX, setPosX] = useState(data?.positionX ?? 50);
  const [posY, setPosY] = useState(data?.positionY ?? 50);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (data) { setPosX(data.positionX); setPosY(data.positionY); }
  }, [data]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  function handlePositionChange(axis: 'x' | 'y', val: number) {
    if (axis === 'x') setPosX(val); else setPosY(val);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      setSaving(true);
      try {
        const newX = axis === 'x' ? val : posX;
        const newY = axis === 'y' ? val : posY;
        const updated = await updateSiteImagePosition(config.key, newX, newY);
        if (updated) onUpdate(updated);
      } catch {
        showToast('Ошибка сохранения позиции');
      } finally {
        setSaving(false);
      }
    }, 600);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) { showToast('Выберите изображение'); return; }
    setUploading(true);
    try {
      const { publicUrl, key } = await uploadFile(file);
      const updated = await upsertSiteImage({
        slotKey: config.key,
        imageUrl: publicUrl,
        imageKey: key,
        positionX: posX,
        positionY: posY,
      });
      onUpdate(updated);
      setPreview(null);
      if (fileRef.current) fileRef.current.value = '';
      showToast('Фото обновлено');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Ошибка загрузки');
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Удалить фото "${config.label}"?`)) return;
    await deleteSiteImage(config.key);
    onUpdate(null);
    showToast('Удалено');
  }

  const displayUrl = preview ?? data?.imageUrl ?? null;
  const previewClass = config.portrait ? styles.filePreviewPortrait : styles.filePreview;

  return (
    <div className={styles.siteImageSlot}>
      <div className={styles.slotHeader}>
        <div>
          <p className={styles.slotLabel}>{config.label}</p>
          <p className={styles.formHint}>{config.hint}</p>
        </div>
        {data && (
          <button className={styles.deleteBannerBtn} onClick={handleDelete}>Удалить</button>
        )}
      </div>

      <div className={styles.slotBody}>
        {/* Preview */}
        <div className={config.portrait ? styles.slotPreviewPortrait : styles.slotPreviewLandscape}>
          {displayUrl ? (
            <img
              src={displayUrl}
              alt={config.label}
              className={styles.slotPreviewImg}
              style={{ objectPosition: `${posX}% ${posY}%` }}
            />
          ) : (
            <div className={styles.slotPreviewEmpty}>Не загружено</div>
          )}
        </div>

        {/* Position sliders */}
        {data && (
          <div className={styles.heroPositionBlock}>
            <p className={styles.heroPositionLabel}>
              Кадрировка {saving && <span className={styles.heroSaving}>сохраняется…</span>}
            </p>
            <label className={styles.sliderField}>
              <span className={styles.sliderName}>Горизонталь</span>
              <input type="range" min={0} max={100} value={posX} className={styles.slider}
                onChange={(e) => handlePositionChange('x', Number(e.target.value))} />
              <span className={styles.sliderValue}>{posX}%</span>
            </label>
            <label className={styles.sliderField}>
              <span className={styles.sliderName}>Вертикаль</span>
              <input type="range" min={0} max={100} value={posY} className={styles.slider}
                onChange={(e) => handlePositionChange('y', Number(e.target.value))} />
              <span className={styles.sliderValue}>{posY}%</span>
            </label>
          </div>
        )}
      </div>

      {/* Upload form */}
      <form className={styles.slotForm} onSubmit={handleSubmit}>
        <label className={styles.field}>
          <span className={styles.label}>{data ? 'Заменить фото' : 'Загрузить фото'}</span>
          <input ref={fileRef} type="file" accept="image/*" className={styles.input}
            onChange={handleFileChange} />
        </label>
        {preview && <img src={preview} alt="Предпросмотр" className={previewClass} />}
        <button className={styles.submit} type="submit" disabled={uploading}>
          {uploading ? 'Загрузка…' : data ? 'Заменить' : 'Загрузить'}
        </button>
      </form>
    </div>
  );
}

// ─── About ────────────────────────────────────────────────────────────────────

const ABOUT_SLOTS: SlotConfig[] = [
  { key: 'about-hero',     label: 'Герой страницы «О мастере»',   hint: 'Большое фоновое фото с именем Elizaveta' },
  { key: 'about-portrait', label: 'Портрет в разделе Story',       hint: 'Фото мастера рядом с текстом о себе', portrait: true },
];

const PORTFOLIO_SLOTS: SlotConfig[] = [
  { key: 'portfolio-problonde',   label: 'Problonde',         hint: 'Практика в бренде', portrait: true },
  { key: 'portfolio-melon',       label: 'Melon Fashion Group', hint: 'Преддипломная практика', portrait: true },
  { key: 'portfolio-spring',      label: 'Дыхание весны',     hint: 'Конкурс', portrait: true },
  { key: 'portfolio-zigzag',      label: 'Диплом победителя', hint: 'Техно-Зигзаг', portrait: true },
  { key: 'portfolio-prize',       label: 'Диплом призёра',    hint: 'Большая Перемена', portrait: true },
  { key: 'portfolio-diplom',      label: 'Диплом об образовании', hint: 'СПбГУПТД', portrait: true },
];

function AboutSection() {
  const [images, setImages] = useState<Map<string, SiteImage>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllSiteImages()
      .then((list) => {
        const map = new Map(list.map((img) => [img.slotKey, img]));
        setImages(map);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function handleUpdate(slotKey: string, img: SiteImage | null) {
    setImages((prev) => {
      const next = new Map(prev);
      if (img) next.set(slotKey, img); else next.delete(slotKey);
      return next;
    });
  }

  if (loading) return <p className={styles.hint}>Загрузка…</p>;

  return (
    <div className={styles.section}>
      <div className={styles.formHeader}>
        <h2 className={styles.sectionTitle}>Страница «О мастере»</h2>
        <p className={styles.formHint}>Все фотографии, которые отображаются на странице /about</p>
      </div>

      <div className={styles.slotGroup}>
        <p className={styles.slotGroupTitle}>Основные фото</p>
        {ABOUT_SLOTS.map((cfg) => (
          <SiteImageSlot
            key={cfg.key}
            config={cfg}
            data={images.get(cfg.key) ?? null}
            onUpdate={(img) => handleUpdate(cfg.key, img)}
          />
        ))}
      </div>

      <div className={styles.slotGroup}>
        <p className={styles.slotGroupTitle}>Карточки портфолио</p>
        <div className={styles.slotGrid}>
          {PORTFOLIO_SLOTS.map((cfg) => (
            <SiteImageSlot
              key={cfg.key}
              config={cfg}
              data={images.get(cfg.key) ?? null}
              onUpdate={(img) => handleUpdate(cfg.key, img)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Collections ─────────────────────────────────────────────────────────────

function CollectionsSection() {
  const [images, setImages] = useState<Map<string, SiteImage>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllSiteImages()
      .then((list) => {
        const map = new Map(list.map((img) => [img.slotKey, img]));
        setImages(map);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function handleUpdate(slotKey: string, img: SiteImage | null) {
    setImages((prev) => {
      const next = new Map(prev);
      if (img) next.set(slotKey, img); else next.delete(slotKey);
      return next;
    });
  }

  if (loading) return <p className={styles.hint}>Загрузка…</p>;

  const allCollections = ALL_COLLECTIONS;

  return (
    <div className={styles.section}>
      <div className={styles.formHeader}>
        <h2 className={styles.sectionTitle}>Коллекции</h2>
        <p className={styles.formHint}>Фотографии для страниц /collections и отдельных коллекций</p>
      </div>

      {allCollections.map((collection) => (
        <div key={collection.slug} className={styles.slotGroup}>
          <p className={styles.slotGroupTitle}>{collection.title}</p>
          <div className={styles.slotGrid}>
            <SiteImageSlot
              config={{ key: collection.cardSlotKey, label: 'Карточка в каталоге', hint: `Фото на странице /collections` }}
              data={images.get(collection.cardSlotKey) ?? null}
              onUpdate={(img) => handleUpdate(collection.cardSlotKey, img)}
            />
            <SiteImageSlot
              config={{ key: collection.detailHeroSlotKey, label: 'Hero детальной страницы', hint: `Большое фото вверху /${collection.slug}` }}
              data={images.get(collection.detailHeroSlotKey) ?? null}
              onUpdate={(img) => handleUpdate(collection.detailHeroSlotKey, img)}
            />
            {collection.detailGallerySlotKeys.map((slotKey, i) => (
              <SiteImageSlot
                key={slotKey}
                config={{ key: slotKey, label: `Галерея — образ ${i + 1}`, hint: `Фото ${i + 1} в галерее ${collection.title}` }}
                data={images.get(slotKey) ?? null}
                onUpdate={(img) => handleUpdate(slotKey, img)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Settings ────────────────────────────────────────────────────────────────

function SettingsSection() {
  const [emailForm, setEmailForm] = useState({ email: '' });
  const [emailError, setEmailError] = useState('');
  const [emailSaving, setEmailSaving] = useState(false);

  const [pwForm, setPwForm] = useState({ password: '', confirm: '' });
  const [pwErrors, setPwErrors] = useState<{ password?: string; confirm?: string }>({});
  const [pwSaving, setPwSaving] = useState(false);

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    const val = emailForm.email.trim();
    if (!val) { setEmailError('Введите новый email'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) { setEmailError('Некорректный email'); return; }
    setEmailError('');
    setEmailSaving(true);
    try {
      await updateAdminCredentials({ email: val });
      setEmailForm({ email: '' });
      showToast('Email обновлён. Войдите заново.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Ошибка');
    } finally {
      setEmailSaving(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: typeof pwErrors = {};
    if (!pwForm.password) { errs.password = 'Введите новый пароль'; }
    else if (pwForm.password.length < 8) { errs.password = 'Минимум 8 символов'; }
    if (pwForm.password && pwForm.password !== pwForm.confirm) { errs.confirm = 'Пароли не совпадают'; }
    setPwErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setPwSaving(true);
    try {
      await updateAdminCredentials({ password: pwForm.password });
      setPwForm({ password: '', confirm: '' });
      showToast('Пароль обновлён. Войдите заново.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Ошибка');
    } finally {
      setPwSaving(false);
    }
  }

  return (
    <div className={styles.section}>

      {/* ── Email ── */}
      <div className={styles.settingsCard}>
        <div className={styles.settingsCardHeader}>
          <div className={styles.settingsCardIcon}>✉</div>
          <div>
            <h2 className={styles.settingsCardTitle}>Email для входа</h2>
            <p className={styles.settingsCardDesc}>
              Это адрес, который вы используете для авторизации в панели администратора.
              После смены войдите заново с новым email.
            </p>
          </div>
        </div>
        <form className={styles.settingsForm} onSubmit={handleEmailSubmit}>
          <label className={styles.field}>
            <span className={styles.label}>Новый email</span>
            <input
              className={styles.input}
              type="email"
              value={emailForm.email}
              onChange={(e) => setEmailForm({ email: e.target.value })}
              placeholder="admin@example.com"
              autoComplete="email"
            />
            {emailError && <span className={styles.fieldError}>{emailError}</span>}
          </label>
          <button className={styles.submit} type="submit" disabled={emailSaving}>
            {emailSaving ? 'Сохранение…' : 'Изменить email'}
          </button>
        </form>
      </div>

      {/* ── Password ── */}
      <div className={styles.settingsCard}>
        <div className={styles.settingsCardHeader}>
          <div className={styles.settingsCardIcon}>🔑</div>
          <div>
            <h2 className={styles.settingsCardTitle}>Пароль</h2>
            <p className={styles.settingsCardDesc}>
              Используйте надёжный пароль — не менее 8 символов.
              После смены войдите заново.
            </p>
          </div>
        </div>
        <form className={styles.settingsForm} onSubmit={handlePasswordSubmit}>
          <label className={styles.field}>
            <span className={styles.label}>Новый пароль</span>
            <input
              className={styles.input}
              type="password"
              value={pwForm.password}
              onChange={(e) => setPwForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="Минимум 8 символов"
              autoComplete="new-password"
            />
            {pwErrors.password && <span className={styles.fieldError}>{pwErrors.password}</span>}
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Повторите пароль</span>
            <input
              className={styles.input}
              type="password"
              value={pwForm.confirm}
              onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))}
              placeholder="Повторите новый пароль"
              autoComplete="new-password"
            />
            {pwErrors.confirm && <span className={styles.fieldError}>{pwErrors.confirm}</span>}
          </label>
          <button className={styles.submit} type="submit" disabled={pwSaving}>
            {pwSaving ? 'Сохранение…' : 'Изменить пароль'}
          </button>
        </form>
      </div>

    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { user, status, logout } = useAuth();
  const [tab, setTab] = useState<Tab>(SHOP_ENABLED ? 'products' : 'portfolio');

  if (status === 'loading') {
    return <div className={styles.loading}>Загрузка…</div>;
  }

  if (status === 'guest') {
    return (
      <div className={styles.gate}>
        <div className={styles.gateIcon}>🔒</div>
        <h1 className={styles.gateTitle}>Войдите в аккаунт</h1>
        <p className={styles.gateText}>Эта страница доступна только администраторам.</p>
        <a href="/auth" className={styles.gateLink}>Войти</a>
      </div>
    );
  }

  if (user?.role !== 'ADMIN') {
    return (
      <div className={styles.gate}>
        <div className={styles.gateIcon}>🚫</div>
        <h1 className={styles.gateTitle}>Нет доступа</h1>
        <p className={styles.gateText}>Эта страница только для администраторов.</p>
        <a href="/" className={styles.gateLink}>На главную</a>
      </div>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    ...(SHOP_ENABLED ? [
      { key: 'products' as Tab, label: 'Товары' },
      { key: 'patterns' as Tab, label: 'Выкройки' },
    ] : []),
    { key: 'portfolio', label: 'Портфолио' },
    { key: 'hero', label: 'Баннер' },
    { key: 'about', label: 'О мастере' },
    { key: 'collections', label: 'Коллекции' },
    { key: 'settings', label: 'Настройки' },
  ];

  return (
    <div className={styles.page}>
      <header className={styles.topBar}>
        <span className={styles.topBarTitle}>Litiy Admin</span>
        <div className={styles.topBarRight}>
          <span className={styles.topBarUser}>{user.email}</span>
          <button className={styles.logoutBtn} onClick={logout}>Выйти</button>
        </div>
      </header>

      <nav className={styles.tabs}>
        {tabs.map((t) => (
          <button
            key={t.key}
            className={`${styles.tab} ${tab === t.key ? styles.tabActive : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className={styles.content}>
        {tab === 'products' && <ProductsSection />}
        {tab === 'patterns' && <PatternsSection />}
        {tab === 'portfolio' && <PortfolioSection />}
        {tab === 'hero' && <HeroSection />}
        {tab === 'about' && <AboutSection />}
        {tab === 'collections' && <CollectionsSection />}
        {tab === 'settings' && <SettingsSection />}
      </main>

      <Toaster />
    </div>
  );
}

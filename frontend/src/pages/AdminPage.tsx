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
import {
  addCollectionPhoto,
  createCollection,
  deleteCollection,
  deleteCollectionPhoto,
  fetchCollections,
  updateCollection,
  updateCollectionPhotoPosition,
  type DynamicCollection,
  type DynamicCollectionPhoto,
} from '../services/collections';
import styles from './AdminPage.module.css';

type Tab = 'products' | 'patterns' | 'portfolio' | 'hero' | 'home' | 'about' | 'collections' | 'settings';

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
  const [fileName, setFileName] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [posX, setPosX] = useState(50);
  const [posY, setPosY] = useState(50);
  const [posXM, setPosXM] = useState(50);
  const [posYM, setPosYM] = useState(50);
  const [saving, setSaving] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getHero()
      .then((hero) => {
        setCurrent(hero);
        if (hero) {
          setPosX(hero.positionX ?? 50);
          setPosY(hero.positionY ?? 50);
          setPosXM(hero.positionXMobile ?? 50);
          setPosYM(hero.positionYMobile ?? 50);
        }
      })
      .catch(() => setCurrent(null));
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setPreview(file ? URL.createObjectURL(file) : null);
    setFileName(file ? file.name : null);
  }

  function handlePositionChange(field: 'x' | 'y' | 'xm' | 'ym', val: number) {
    if (field === 'x') setPosX(val);
    else if (field === 'y') setPosY(val);
    else if (field === 'xm') setPosXM(val);
    else setPosYM(val);

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      setSaving(true);
      try {
        const nx = field === 'x' ? val : posX;
        const ny = field === 'y' ? val : posY;
        const nxm = field === 'xm' ? val : posXM;
        const nym = field === 'ym' ? val : posYM;
        await updateHeroPosition(nx, ny, nxm, nym);
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
      const created = await replaceHero({
        imageUrl: publicUrl, imageKey: key,
        positionX: posX, positionY: posY,
        positionXMobile: posXM, positionYMobile: posYM,
      });
      setCurrent(created);
      setPreview(null);
      setFileName(null);
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

          {/* Previews */}
          <div className={styles.heroPreviews}>
            <div className={styles.heroPreviewGroup}>
              <p className={styles.heroPreviewLabel}>Десктоп</p>
              <div className={styles.heroPreviewWrap}>
                {displayUrl ? (
                  <img src={displayUrl} alt="Десктоп" className={styles.heroPreviewImg}
                    style={{ objectPosition: `${posX}% ${posY}%` }} />
                ) : (
                  <div className={styles.heroPreviewEmpty}>Не установлен</div>
                )}
              </div>
            </div>
            <div className={styles.heroPreviewGroup}>
              <p className={styles.heroPreviewLabel}>Мобильный</p>
              <div className={styles.heroPreviewMobileWrap}>
                {displayUrl ? (
                  <img src={displayUrl} alt="Мобильный" className={styles.heroPreviewImg}
                    style={{ objectPosition: `${posXM}% ${posYM}%` }} />
                ) : (
                  <div className={styles.heroPreviewEmpty}>Не установлен</div>
                )}
              </div>
            </div>
          </div>

          {/* Position sliders — only when banner exists */}
          {current && (
            <div className={styles.heroPositionBlocks}>
              <div className={styles.heroPositionBlock}>
                <p className={styles.heroPositionLabel}>
                  Кадрировка — Десктоп {saving && <span className={styles.heroSaving}>сохраняется…</span>}
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

              <div className={styles.heroPositionBlock}>
                <p className={styles.heroPositionLabel}>
                  Кадрировка — Мобильный {saving && <span className={styles.heroSaving}>сохраняется…</span>}
                </p>
                <label className={styles.sliderField}>
                  <span className={styles.sliderName}>Горизонталь</span>
                  <input type="range" min={0} max={100} value={posXM} className={styles.slider}
                    onChange={(e) => handlePositionChange('xm', Number(e.target.value))} />
                  <span className={styles.sliderValue}>{posXM}%</span>
                </label>
                <label className={styles.sliderField}>
                  <span className={styles.sliderName}>Вертикаль</span>
                  <input type="range" min={0} max={100} value={posYM} className={styles.slider}
                    onChange={(e) => handlePositionChange('ym', Number(e.target.value))} />
                  <span className={styles.sliderValue}>{posYM}%</span>
                </label>
              </div>
            </div>
          )}

          {/* Upload form */}
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <span className={styles.label}>{current ? 'Новый баннер (заменит текущий)' : 'Загрузить баннер'}</span>
              <div className={styles.fileInputRow}>
                <label className={styles.fileBtn}>
                  Загрузить
                  <input ref={fileRef} type="file" accept="image/*" className={styles.fileInputHidden} onChange={handleFileChange} />
                </label>
                <span className={styles.fileNameLabel}>{fileName ?? 'Файл не выбран'}</span>
              </div>
            </div>
            <button className={styles.submit} type="submit" disabled={uploading}>
              {uploading ? 'Загрузка…' : current ? 'Заменить баннер' : 'Загрузить баннер'}
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
  const [fileName, setFileName] = useState<string | null>(null);
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
    setFileName(file ? file.name : null);
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
        <div className={styles.field}>
          <span className={styles.label}>{data ? 'Заменить фото' : 'Загрузить фото'}</span>
          <div className={styles.fileInputRow}>
            <label className={styles.fileBtn}>
              Загрузить
              <input ref={fileRef} type="file" accept="image/*" className={styles.fileInputHidden}
                onChange={handleFileChange} />
            </label>
            <span className={styles.fileNameLabel}>{fileName ?? 'Файл не выбран'}</span>
          </div>
        </div>
        {preview && <img src={preview} alt="Предпросмотр" className={previewClass} />}
        <button className={styles.submit} type="submit" disabled={uploading}>
          {uploading ? 'Загрузка…' : data ? 'Заменить' : 'Загрузить'}
        </button>
      </form>
    </div>
  );
}

// ─── Home ─────────────────────────────────────────────────────────────────────

const HOME_SLOTS: SlotConfig[] = [
  {
    key: 'home-card-image',
    label: 'Карточка «Новая коллекция»',
    hint: 'Фото рядом с кнопкой «НОВАЯ КОЛЛЕКЦИЯ» на главной странице (появляется на десктопе)',
    portrait: true,
  },
];

function HomeSection() {
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
        <h2 className={styles.sectionTitle}>Главная страница</h2>
        <p className={styles.formHint}>Фотографии, которые отображаются на главной странице сайта</p>
      </div>
      {HOME_SLOTS.map((cfg) => (
        <SiteImageSlot
          key={cfg.key}
          config={cfg}
          data={images.get(cfg.key) ?? null}
          onUpdate={(img) => handleUpdate(cfg.key, img)}
        />
      ))}
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

// ── Dynamic collection photo row ──────────────────────────────────────────

function DynPhotoRow({
  photo,
  onDelete,
  onUpdate,
}: {
  photo: DynamicCollectionPhoto;
  onDelete: (id: number) => void;
  onUpdate: (p: DynamicCollectionPhoto) => void;
}) {
  const [posX, setPosX] = useState(photo.positionX);
  const [posY, setPosY] = useState(photo.positionY);
  const [saving, setSaving] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handlePos(axis: 'x' | 'y', val: number) {
    if (axis === 'x') setPosX(val); else setPosY(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setSaving(true);
      try {
        const nx = axis === 'x' ? val : posX;
        const ny = axis === 'y' ? val : posY;
        const updated = await updateCollectionPhotoPosition(photo.id, nx, ny);
        onUpdate(updated);
      } catch {
        showToast('Ошибка сохранения позиции');
      } finally {
        setSaving(false);
      }
    }, 600);
  }

  async function handleDelete() {
    if (!confirm('Удалить фото?')) return;
    await deleteCollectionPhoto(photo.id);
    onDelete(photo.id);
    showToast('Удалено');
  }

  const typeLabel = photo.photoType === 'CARD' ? 'Карточка' : photo.photoType === 'HERO' ? 'Hero' : 'Галерея';

  return (
    <div className={styles.dynPhotoRow}>
      <div className={styles.dynPhotoThumb}>
        <img src={photo.imageUrl} alt={typeLabel}
          style={{ objectPosition: `${posX}% ${posY}%` }} />
      </div>
      <div className={styles.dynPhotoMeta}>
        <span className={styles.dynPhotoType}>{typeLabel}</span>
        {saving && <span className={styles.dynPhotoSaving}>сохраняется…</span>}
        <div className={styles.dynPhotoSliders}>
          <label className={styles.sliderField}>
            <span className={styles.sliderName}>Гориз.</span>
            <input type="range" min={0} max={100} value={posX} className={styles.slider}
              onChange={(e) => handlePos('x', Number(e.target.value))} />
            <span className={styles.sliderValue}>{posX}%</span>
          </label>
          <label className={styles.sliderField}>
            <span className={styles.sliderName}>Верт.</span>
            <input type="range" min={0} max={100} value={posY} className={styles.slider}
              onChange={(e) => handlePos('y', Number(e.target.value))} />
            <span className={styles.sliderValue}>{posY}%</span>
          </label>
        </div>
      </div>
      <button className={styles.deleteBtn} onClick={handleDelete} aria-label="Удалить фото">×</button>
    </div>
  );
}

// ── Dynamic collection card ───────────────────────────────────────────────

const MAX_PHOTOS = 25;

function DynCollectionCard({
  collection,
  onChange,
  onDelete,
}: {
  collection: DynamicCollection;
  onChange: (c: DynamicCollection) => void;
  onDelete: (id: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(collection.title);
  const [subtitle, setSubtitle] = useState(collection.subtitle ?? '');
  const [eyebrow, setEyebrow] = useState(collection.eyebrow ?? '');
  const [description, setDescription] = useState(collection.description ?? '');
  const [detailIntro, setDetailIntro] = useState(collection.detailIntro ?? '');
  const [detailFocus, setDetailFocus] = useState(collection.detailFocus ?? '');
  const [tone, setTone] = useState<'warm' | 'cool' | 'neutral'>(collection.tone ?? 'neutral');
  const [featured, setFeatured] = useState(collection.featured);
  const [saving, setSaving] = useState(false);

  const [addingPhoto, setAddingPhoto] = useState(false);
  const [photoType, setPhotoType] = useState<'CARD' | 'HERO' | 'GALLERY'>('GALLERY');
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitle(collection.title);
    setSubtitle(collection.subtitle ?? '');
    setEyebrow(collection.eyebrow ?? '');
    setDescription(collection.description ?? '');
    setDetailIntro(collection.detailIntro ?? '');
    setDetailFocus(collection.detailFocus ?? '');
    setTone(collection.tone ?? 'neutral');
    setFeatured(collection.featured);
  }, [collection]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { showToast('Название не может быть пустым'); return; }
    setSaving(true);
    try {
      const updated = await updateCollection(collection.id, {
        slug: collection.slug,
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        eyebrow: eyebrow.trim() || undefined,
        description: description.trim() || undefined,
        detailIntro: detailIntro.trim() || undefined,
        detailFocus: detailFocus.trim() || undefined,
        tone,
        sortOrder: collection.sortOrder,
        featured,
      });
      onChange(updated);
      showToast('Сохранено');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteCollection() {
    if (!confirm(`Удалить коллекцию «${collection.title}» и все её фото?`)) return;
    try {
      await deleteCollection(collection.id);
      onDelete(collection.id);
      showToast('Коллекция удалена');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Ошибка');
    }
  }

  async function handleAddPhoto(e: React.FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) { showToast('Выберите фото'); return; }
    if (collection.photos.length >= MAX_PHOTOS) {
      showToast(`Лимит: максимум ${MAX_PHOTOS} фото на коллекцию`);
      return;
    }
    setUploading(true);
    try {
      const { publicUrl, key } = await uploadFile(file);
      const galleryPhotos = collection.photos.filter((p) => p.photoType === 'GALLERY');
      const maxOrder = galleryPhotos.length > 0 ? Math.max(...galleryPhotos.map((p) => p.sortOrder)) : -1;
      const photo = await addCollectionPhoto(collection.id, {
        imageUrl: publicUrl,
        imageKey: key,
        photoType,
        sortOrder: photoType === 'GALLERY' ? maxOrder + 1 : 0,
      });
      onChange({ ...collection, photos: [...collection.photos, photo] });
      setAddingPhoto(false);
      setFileName(null);
      if (fileRef.current) fileRef.current.value = '';
      showToast('Фото добавлено');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Ошибка загрузки');
    } finally {
      setUploading(false);
    }
  }

  function handlePhotoUpdate(updated: DynamicCollectionPhoto) {
    onChange({ ...collection, photos: collection.photos.map((p) => p.id === updated.id ? updated : p) });
  }

  function handlePhotoDelete(photoId: number) {
    onChange({ ...collection, photos: collection.photos.filter((p) => p.id !== photoId) });
  }

  const cardPhoto = collection.photos.find((p) => p.photoType === 'CARD');

  return (
    <div className={styles.collectionCard}>
      <button
        type="button"
        className={styles.collectionCardHeader}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <div className={styles.collectionCardThumb}>
          {cardPhoto ? (
            <img src={cardPhoto.imageUrl} alt={collection.title}
              style={{ objectPosition: `${cardPhoto.positionX}% ${cardPhoto.positionY}%` }} />
          ) : (
            <div className={styles.collectionCardThumbEmpty} />
          )}
        </div>
        <div className={styles.collectionCardInfo}>
          <p className={styles.collectionCardTitle}>{collection.title}</p>
          {collection.subtitle && <p className={styles.collectionCardSubtitle}>{collection.subtitle}</p>}
          <p className={styles.collectionCardSlug}>/collections/{collection.slug}</p>
        </div>
        <div className={styles.collectionCardMeta}>
          {collection.photos.length > 0 && (
            <span className={styles.collectionDynBadge}>{collection.photos.length} фото</span>
          )}
          {collection.featured && <span className={styles.collectionCardBadge}>featured</span>}
          <span className={`${styles.collectionCardChevron} ${open ? styles.collectionCardChevronOpen : ''}`}>›</span>
        </div>
      </button>

      {open && (
        <div className={styles.collectionCardBody}>

          {/* Edit info */}
          <div className={styles.collectionSubGroup}>
            <div className={styles.collectionSectionHeader}>
              <p className={styles.collectionSubGroupTitle}>Информация о коллекции</p>
              <button className={styles.deleteBannerBtn} onClick={handleDeleteCollection}>Удалить коллекцию</button>
            </div>
            <form className={styles.collectionMetaForm} onSubmit={handleSave}>
              <div className={styles.createCollectionGrid}>
                <label className={styles.field}>
                  <span className={styles.label}>Название</span>
                  <input className={styles.input} value={title} onChange={(e) => setTitle(e.target.value)} />
                </label>
                <label className={styles.field}>
                  <span className={styles.label}>Подзаголовок</span>
                  <input className={styles.input} value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
                </label>
                <label className={styles.field}>
                  <span className={styles.label}>Eyebrow</span>
                  <input className={styles.input} value={eyebrow} onChange={(e) => setEyebrow(e.target.value)} placeholder="Featured collection" />
                </label>
                <label className={styles.field}>
                  <span className={styles.label}>Тон</span>
                  <select className={styles.input} value={tone} onChange={(e) => setTone(e.target.value as 'warm' | 'cool' | 'neutral')}>
                    <option value="neutral">Neutral</option>
                    <option value="warm">Warm</option>
                    <option value="cool">Cool</option>
                  </select>
                </label>
              </div>
              <label className={styles.field}>
                <span className={styles.label}>Описание (для карточки в каталоге)</span>
                <textarea className={styles.input} rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Вступление (для страницы коллекции)</span>
                <textarea className={styles.input} rows={2} value={detailIntro} onChange={(e) => setDetailIntro(e.target.value)} />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Акцент (для страницы коллекции)</span>
                <input className={styles.input} value={detailFocus} onChange={(e) => setDetailFocus(e.target.value)} />
              </label>
              <label className={styles.field} style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
                <span className={styles.label} style={{ textTransform: 'none', fontWeight: 500 }}>Показывать как featured (главная)</span>
              </label>
              <button className={styles.submit} type="submit" disabled={saving}>
                {saving ? 'Сохранение…' : 'Сохранить'}
              </button>
            </form>
          </div>

          {/* Photos */}
          <div className={styles.collectionSubGroup}>
            <div className={styles.collectionSectionHeader}>
              <p className={styles.collectionSubGroupTitle}>
                Фотографии ({collection.photos.length} / {MAX_PHOTOS})
              </p>
              {collection.photos.length < MAX_PHOTOS && (
                <button
                  type="button"
                  className={styles.submit}
                  style={{ padding: '0.35rem 0.9rem', fontSize: '0.8rem' }}
                  onClick={() => setAddingPhoto((v) => !v)}
                >
                  {addingPhoto ? 'Отмена' : '+ Добавить фото'}
                </button>
              )}
            </div>

            {addingPhoto && (
              <form className={styles.dynPhotoAddForm} onSubmit={handleAddPhoto}>
                <div>
                  <p className={styles.label} style={{ marginBottom: '0.4rem' }}>Тип фото</p>
                  <div className={styles.dynPhotoTypeRow}>
                    {(['CARD', 'HERO', 'GALLERY'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        className={`${styles.dynPhotoTypePill} ${photoType === t ? styles.dynPhotoTypePillActive : ''}`}
                        onClick={() => setPhotoType(t)}
                      >
                        {t === 'CARD' ? 'Карточка' : t === 'HERO' ? 'Hero' : 'Галерея'}
                      </button>
                    ))}
                  </div>
                </div>
                <div className={styles.fileInputRow}>
                  <label className={styles.fileBtn}>
                    Загрузить
                    <input ref={fileRef} type="file" accept="image/*" className={styles.fileInputHidden}
                      onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)} />
                  </label>
                  <span className={styles.fileNameLabel}>{fileName ?? 'Файл не выбран'}</span>
                </div>
                <button className={styles.submit} type="submit" disabled={uploading}>
                  {uploading ? 'Загрузка…' : 'Добавить'}
                </button>
              </form>
            )}

            {collection.photos.length === 0 ? (
              <p className={styles.hint}>Фото пока нет</p>
            ) : (
              <div className={styles.dynPhotoList}>
                {collection.photos.map((photo) => (
                  <DynPhotoRow
                    key={photo.id}
                    photo={photo}
                    onDelete={handlePhotoDelete}
                    onUpdate={handlePhotoUpdate}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Create collection form ────────────────────────────────────────────────

const MAX_COLLECTIONS = 25;

function CreateCollectionForm({ onCreated }: { onCreated: (c: DynamicCollection) => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    slug: '', title: '', subtitle: '', eyebrow: '', description: '', tone: 'neutral' as 'warm' | 'cool' | 'neutral',
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.slug.trim() || !form.title.trim()) { showToast('Slug и название обязательны'); return; }
    if (!/^[a-z0-9-]+$/.test(form.slug)) { showToast('Slug: только строчные буквы, цифры и дефис'); return; }
    setSaving(true);
    try {
      const created = await createCollection({
        slug: form.slug.trim(),
        title: form.title.trim(),
        subtitle: form.subtitle.trim() || undefined,
        eyebrow: form.eyebrow.trim() || undefined,
        description: form.description.trim() || undefined,
        tone: form.tone,
      });
      onCreated(created);
      setForm({ slug: '', title: '', subtitle: '', eyebrow: '', description: '', tone: 'neutral' });
      setOpen(false);
      showToast('Коллекция создана');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Ошибка создания');
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        className={styles.submit}
        style={{ alignSelf: 'flex-start' }}
        onClick={() => setOpen(true)}
      >
        + Новая коллекция
      </button>
    );
  }

  return (
    <form className={styles.createCollectionForm} onSubmit={handleSubmit}>
      <div className={styles.formHeader}>
        <h3 className={styles.sectionTitle} style={{ margin: 0 }}>Создать коллекцию</h3>
        <p className={styles.formHint}>Slug — уникальный ключ (напр. my-new-look), используется в URL /collections/my-new-look</p>
      </div>
      <div className={styles.createCollectionGrid}>
        <label className={styles.field}>
          <span className={styles.label}>Slug (URL)</span>
          <input className={styles.input} value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }))}
            placeholder="my-new-look" />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Название</span>
          <input className={styles.input} value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="My New Look" />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Подзаголовок</span>
          <input className={styles.input} value={form.subtitle}
            onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Eyebrow</span>
          <input className={styles.input} value={form.eyebrow}
            onChange={(e) => setForm((f) => ({ ...f, eyebrow: e.target.value }))} placeholder="Look 04" />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Тон</span>
          <select className={styles.input} value={form.tone}
            onChange={(e) => setForm((f) => ({ ...f, tone: e.target.value as 'warm' | 'cool' | 'neutral' }))}>
            <option value="neutral">Neutral</option>
            <option value="warm">Warm</option>
            <option value="cool">Cool</option>
          </select>
        </label>
      </div>
      <label className={styles.field}>
        <span className={styles.label}>Описание</span>
        <textarea className={styles.input} rows={2} value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
      </label>
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button className={styles.submit} type="submit" disabled={saving}>
          {saving ? 'Создание…' : 'Создать'}
        </button>
        <button type="button" className={styles.deleteBannerBtn} onClick={() => setOpen(false)}>Отмена</button>
      </div>
    </form>
  );
}

// ── CollectionsSection ────────────────────────────────────────────────────

function CollectionsSection() {
  const [collections, setCollections] = useState<DynamicCollection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCollections()
      .then(setCollections)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function handleChange(updated: DynamicCollection) {
    setCollections((prev) => prev.map((c) => c.id === updated.id ? updated : c));
  }

  function handleDelete(id: number) {
    setCollections((prev) => prev.filter((c) => c.id !== id));
  }

  function handleCreated(c: DynamicCollection) {
    setCollections((prev) => [...prev, c]);
  }

  if (loading) return <p className={styles.hint}>Загрузка…</p>;

  const canCreate = collections.length < MAX_COLLECTIONS;

  return (
    <div className={styles.section}>
      <div className={styles.formHeader}>
        <h2 className={styles.sectionTitle}>Коллекции</h2>
        <p className={styles.formHint}>
          Управление коллекциями на страницах /collections и /collections/slug.
          {collections.length} / {MAX_COLLECTIONS} коллекций.
        </p>
      </div>

      {collections.length > 0 && (
        <div className={styles.collectionsList}>
          {collections.map((c) => (
            <DynCollectionCard
              key={c.id}
              collection={c}
              onChange={handleChange}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {canCreate
        ? <CreateCollectionForm onCreated={handleCreated} />
        : <p className={styles.hint}>Достигнут лимит {MAX_COLLECTIONS} коллекций.</p>
      }
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
    { key: 'home', label: 'Главная' },
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
        {tab === 'home' && <HomeSection />}
        {tab === 'about' && <AboutSection />}
        {tab === 'collections' && <CollectionsSection />}
        {tab === 'settings' && <SettingsSection />}
      </main>

      <Toaster />
    </div>
  );
}

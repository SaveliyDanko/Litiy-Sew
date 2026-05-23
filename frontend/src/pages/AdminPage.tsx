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
  deleteHeroMobile,
  replaceHeroTablet,
  deleteHeroTablet,
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
  replaceHeroMobile,
  updateAdminCredentials,
  updatePortfolioPhotoPosition,
  uploadFile,
  type AdminHeroBanner,
  type AdminPatternItem,
  type AdminPortfolioPhoto,
  type AdminProduct,
} from '../services/admin';
import {
  adminListPortfolioProjects,
  addProjectPhoto,
  createPortfolioProject,
  deletePortfolioProject,
  deleteProjectPhoto,
  reorderPortfolioProject,
  reorderProjectPhoto,
  updatePortfolioProject,
  updateProjectPhotoPosition,
  type PortfolioProject,
  type ProjectPhoto,
} from '../services/portfolioProjects';
import {
  addCollectionPhoto,
  createCollection,
  deleteCollection,
  deleteCollectionPhoto,
  fetchCollections,
  reorderCollection,
  reorderCollectionPhoto,
  updateCollection,
  updateCollectionPhotoPosition,
  type DynamicCollection,
  type DynamicCollectionPhoto,
} from '../services/collections';
import { fetchAllSiteTexts, upsertSiteText, type SiteText as SiteTextEntry } from '../services/siteTexts';
import styles from './AdminPage.module.css';

type Tab = 'products' | 'patterns' | 'portfolio' | 'home' | 'about' | 'collections' | 'settings';
type HeroTitlePosition =
  | 'top-left'          | 'top-center-left'    | 'top-center-right'    | 'top-right'
  | 'upper-left'        | 'upper-center-left'  | 'upper-center-right'  | 'upper-right'
  | 'lower-left'        | 'lower-center-left'  | 'lower-center-right'  | 'lower-right'
  | 'bottom-left'       | 'bottom-center-left' | 'bottom-center-right' | 'bottom-right';

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
      const { publicUrl, key, srcset } = await uploadFile(file);
      const created = await createProduct({
        title: form.title.trim(),
        price: Number(form.price) || 0,
        description: form.description.trim() || undefined,
        imageUrl: publicUrl,
        imageKey: key,
        imageSrcSet: srcset,
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
      const { publicUrl, key, srcset } = await uploadFile(file);
      const created = await createPattern({
        title: form.title.trim(),
        category: form.category,
        price: Number(form.price) || 0,
        description: form.description.trim() || undefined,
        previewUrl: publicUrl,
        previewKey: key,
        previewSrcSet: srcset,
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

function PortfolioPhotoRow({
  photo,
  idx,
  total,
  onUpdate,
  onDelete,
  onMove,
}: {
  photo: AdminPortfolioPhoto;
  idx: number;
  total: number;
  onUpdate: (p: AdminPortfolioPhoto) => void;
  onDelete: (id: number) => void;
  onMove: (id: number, dir: 'up' | 'down') => void;
}) {
  const [posX, setPosX] = useState(photo.positionX);
  const [posY, setPosY] = useState(photo.positionY);
  const [scale, setScale] = useState(photo.scale ?? 100);
  const [saving, setSaving] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setPosX(photo.positionX);
    setPosY(photo.positionY);
    setScale(photo.scale ?? 100);
  }, [photo.positionX, photo.positionY, photo.scale]);

  function handlePos(axis: 'x' | 'y' | 's', val: number) {
    if (axis === 'x') setPosX(val);
    else if (axis === 'y') setPosY(val);
    else setScale(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setSaving(true);
      try {
        const nx = axis === 'x' ? val : posX;
        const ny = axis === 'y' ? val : posY;
        const ns = axis === 's' ? val : scale;
        const updated = await updatePortfolioPhotoPosition(photo.id, nx, ny, ns);
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
    await deletePortfolioPhoto(photo.id);
    onDelete(photo.id);
    showToast('Удалено');
  }

  return (
    <div className={styles.dynPhotoRow}>
      <div className={styles.dynPhotoThumb}>
        <img
          src={photo.photoUrl}
          alt={photo.caption ?? ''}
          style={{ objectPosition: `${posX}% ${posY}%`, transform: `scale(${scale / 100})` }}
        />
      </div>
      <div className={styles.dynPhotoMeta}>
        {photo.caption && <span className={styles.dynPhotoType}>{photo.caption}</span>}
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
          <label className={styles.sliderField}>
            <span className={styles.sliderName}>Масштаб</span>
            <input type="range" min={100} max={200} value={scale} className={styles.slider}
              onChange={(e) => handlePos('s', Number(e.target.value))} />
            <span className={styles.sliderValue}>{scale}%</span>
          </label>
        </div>
        <div className={styles.cardActions} style={{ paddingLeft: 0, paddingBottom: 0, borderTop: 'none' }}>
          <button className={styles.orderBtn} onClick={() => onMove(photo.id, 'up')} disabled={idx === 0} aria-label="Вверх">↑</button>
          <button className={styles.orderBtn} onClick={() => onMove(photo.id, 'down')} disabled={idx === total - 1} aria-label="Вниз">↓</button>
        </div>
      </div>
      <button className={styles.deleteBtn} onClick={handleDelete} aria-label="Удалить">×</button>
    </div>
  );
}

function PortfolioSection() {
  const [items, setItems] = useState<AdminPortfolioPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [caption, setCaption] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);

  useEffect(() => {
    listPortfolio().then(setItems).finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) { showToast('Выберите фото'); return; }
    setUploading(true);
    try {
      const { publicUrl, key, srcset } = await uploadFile(file);
      const maxOrder = items.length > 0 ? Math.max(...items.map((i) => i.sortOrder)) : -1;
      const created = await createPortfolioPhoto({
        photoUrl: publicUrl,
        photoKey: key,
        photoSrcSet: srcset,
        caption: caption.trim() || undefined,
        sortOrder: maxOrder + 1,
      });
      setItems((prev) => [...prev, created]);
      setCaption('');
      setFileName(null);
      if (fileRef.current) fileRef.current.value = '';
      showToast('Фото добавлено');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Ошибка загрузки');
    } finally {
      setUploading(false);
    }
  }

  async function handleMove(id: number, dir: 'up' | 'down') {
    const idx = items.findIndex((i) => i.id === id);
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= items.length) return;
    const normalized = items.map((item, i) => ({ ...item, sortOrder: i }));
    await reorderPortfolioPhoto(normalized[idx].id, swapIdx);
    await reorderPortfolioPhoto(normalized[swapIdx].id, idx);
    const updated = [...normalized];
    updated[idx] = { ...normalized[idx], sortOrder: swapIdx };
    updated[swapIdx] = { ...normalized[swapIdx], sortOrder: idx };
    updated.sort((a, b) => a.sortOrder - b.sortOrder || a.createdAt.localeCompare(b.createdAt));
    setItems(updated);
  }

  return (
    <div className={styles.section}>
      <div className={styles.formHeader}>
        <h2 className={styles.sectionTitle}>Портфолио</h2>
        <p className={styles.formHint}>Галерея работ на странице «Обо мне». Ползунки задают кадрировку каждого фото.</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formHeader}>
          <p className={styles.sectionTitle} style={{ marginBottom: 0 }}>Добавить фото</p>
        </div>
        <div className={styles.field}>
          <span className={styles.label}>Фото</span>
          <div className={styles.fileInputRow}>
            <label className={styles.fileBtn}>
              Загрузить
              <input ref={fileRef} type="file" accept="image/*" className={styles.fileInputHidden}
                onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)} />
            </label>
            <span className={styles.fileNameLabel}>{fileName ?? 'Файл не выбран'}</span>
          </div>
        </div>
        <label className={styles.field}>
          <span className={styles.label}>Подпись (необязательно)</span>
          <input className={styles.input} value={caption}
            onChange={(e) => setCaption(e.target.value)} placeholder="Весенняя коллекция 2024" />
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
        <div className={styles.dynPhotoList}>
          {items.map((p, idx) => (
            <PortfolioPhotoRow
              key={p.id}
              photo={p}
              idx={idx}
              total={items.length}
              onUpdate={(updated) => setItems((prev) => prev.map((i) => i.id === updated.id ? updated : i))}
              onDelete={(id) => setItems((prev) => prev.filter((i) => i.id !== id))}
              onMove={handleMove}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Hero Banner ─────────────────────────────────────────────────────────────

function HeroSection() {
  const [current, setCurrent] = useState<AdminHeroBanner | null | undefined>(undefined);

  // Desktop
  const [uploadingD, setUploadingD] = useState(false);
  const fileRefD = useRef<HTMLInputElement>(null);
  const [fileNameD, setFileNameD] = useState<string | null>(null);
  const [previewD, setPreviewD] = useState<string | null>(null);
  const [posX, setPosX] = useState(50);
  const [posY, setPosY] = useState(50);
  const [scaleD, setScaleD] = useState(100);

  // Mobile
  const [uploadingM, setUploadingM] = useState(false);
  const fileRefM = useRef<HTMLInputElement>(null);
  const [fileNameM, setFileNameM] = useState<string | null>(null);
  const [previewM, setPreviewM] = useState<string | null>(null);
  const [posXM, setPosXM] = useState(50);
  const [posYM, setPosYM] = useState(50);
  const [scaleM, setScaleM] = useState(100);

  // Tablet
  const [uploadingT, setUploadingT] = useState(false);
  const fileRefT = useRef<HTMLInputElement>(null);
  const [fileNameT, setFileNameT] = useState<string | null>(null);
  const [previewT, setPreviewT] = useState<string | null>(null);
  const [posXT, setPosXT] = useState(50);
  const [posYT, setPosYT] = useState(50);
  const [scaleT, setScaleT] = useState(100);

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
          setPosXT(hero.positionXTablet ?? 50);
          setPosYT(hero.positionYTablet ?? 50);
          setScaleD(hero.scale ?? 100);
          setScaleM(hero.scaleMobile ?? 100);
          setScaleT(hero.scaleTablet ?? 100);
        }
      })
      .catch(() => setCurrent(null));
  }, []);

  function handlePositionChange(field: 'x' | 'y' | 'xm' | 'ym' | 'xt' | 'yt' | 'sd' | 'sm' | 'st', val: number) {
    if (field === 'x') setPosX(val);
    else if (field === 'y') setPosY(val);
    else if (field === 'xm') setPosXM(val);
    else if (field === 'ym') setPosYM(val);
    else if (field === 'xt') setPosXT(val);
    else if (field === 'yt') setPosYT(val);
    else if (field === 'sd') setScaleD(val);
    else if (field === 'sm') setScaleM(val);
    else setScaleT(val);

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      setSaving(true);
      try {
        const nx  = field === 'x'  ? val : posX;
        const ny  = field === 'y'  ? val : posY;
        const nxm = field === 'xm' ? val : posXM;
        const nym = field === 'ym' ? val : posYM;
        const nxt = field === 'xt' ? val : posXT;
        const nyt = field === 'yt' ? val : posYT;
        const nsd = field === 'sd' ? val : scaleD;
        const nsm = field === 'sm' ? val : scaleM;
        const nst = field === 'st' ? val : scaleT;
        await updateHeroPosition(nx, ny, nxm, nym, nxt, nyt, nsd, nsm, nst);
      } catch {
        showToast('Ошибка сохранения позиции');
      } finally {
        setSaving(false);
      }
    }, 600);
  }

  async function handleSubmitDesktop(e: React.FormEvent) {
    e.preventDefault();
    const file = fileRefD.current?.files?.[0];
    if (!file) { showToast('Выберите изображение'); return; }
    setUploadingD(true);
    try {
      const { publicUrl, key, srcset } = await uploadFile(file);
      const updated = await replaceHero({
        imageUrl: publicUrl, imageKey: key, imageSrcSet: srcset,
        imageUrlMobile: current?.imageUrlMobile ?? undefined,
        imageKeyMobile: current?.imageKeyMobile ?? undefined,
        imageSrcSetMobile: current?.imageSrcSetMobile ?? undefined,
        imageUrlTablet: current?.imageUrlTablet ?? undefined,
        imageKeyTablet: current?.imageKeyTablet ?? undefined,
        imageSrcSetTablet: current?.imageSrcSetTablet ?? undefined,
        positionX: posX, positionY: posY,
        positionXMobile: posXM, positionYMobile: posYM,
        positionXTablet: posXT, positionYTablet: posYT,
        scale: scaleD, scaleMobile: scaleM, scaleTablet: scaleT,
      });
      setCurrent(updated);
      setPreviewD(null);
      setFileNameD(null);
      if (fileRefD.current) fileRefD.current.value = '';
      showToast('Десктоп-баннер обновлён');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Ошибка загрузки');
    } finally {
      setUploadingD(false);
    }
  }

  async function handleSubmitMobile(e: React.FormEvent) {
    e.preventDefault();
    const file = fileRefM.current?.files?.[0];
    if (!file) { showToast('Выберите изображение'); return; }
    setUploadingM(true);
    try {
      const { publicUrl, key, srcset } = await uploadFile(file);
      const updated = await replaceHeroMobile(publicUrl, key, srcset);
      if (updated) setCurrent(updated);
      setPreviewM(null);
      setFileNameM(null);
      if (fileRefM.current) fileRefM.current.value = '';
      showToast('Мобильный баннер обновлён');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Ошибка загрузки');
    } finally {
      setUploadingM(false);
    }
  }

  async function handleDeleteMobile() {
    if (!confirm('Удалить мобильный баннер?')) return;
    const updated = await deleteHeroMobile();
    if (updated) setCurrent(updated);
    setPreviewM(null);
    setFileNameM(null);
    showToast('Мобильный баннер удалён');
  }

  async function handleSubmitTablet(e: React.FormEvent) {
    e.preventDefault();
    const file = fileRefT.current?.files?.[0];
    if (!file) { showToast('Выберите изображение'); return; }
    setUploadingT(true);
    try {
      const { publicUrl, key, srcset } = await uploadFile(file);
      const updated = await replaceHeroTablet(publicUrl, key, srcset);
      if (updated) setCurrent(updated);
      setPreviewT(null);
      setFileNameT(null);
      if (fileRefT.current) fileRefT.current.value = '';
      showToast('Планшетный баннер обновлён');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Ошибка загрузки');
    } finally {
      setUploadingT(false);
    }
  }

  async function handleDeleteTablet() {
    if (!confirm('Удалить планшетный баннер?')) return;
    const updated = await deleteHeroTablet();
    if (updated) setCurrent(updated);
    setPreviewT(null);
    setFileNameT(null);
    showToast('Планшетный баннер удалён');
  }

  async function handleDelete() {
    if (!confirm('Удалить баннер полностью?')) return;
    await deleteHero();
    setCurrent(null);
    setPreviewD(null);
    setPreviewM(null);
    showToast('Баннер удалён');
  }

  const displayUrlD = previewD ?? current?.imageUrl ?? null;
  const displayUrlM = previewM ?? current?.imageUrlMobile ?? displayUrlD;
  const displayUrlT = previewT ?? current?.imageUrlTablet ?? displayUrlD;

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

          {/* Desktop block */}
          <div className={styles.heroBannerBlock}>
            <p className={styles.heroBannerBlockTitle}>Десктоп</p>
            <div className={styles.heroPreviewWrap}>
              {displayUrlD
                ? <img src={displayUrlD} alt="Десктоп" className={styles.heroPreviewImg} style={{ objectPosition: `${posX}% ${posY}%`, transform: `scale(${scaleD / 100})` }} />
                : <div className={styles.heroPreviewEmpty}>Не установлен</div>
              }
            </div>
            {current && (
              <>
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
                <label className={styles.sliderField}>
                  <span className={styles.sliderName}>Масштаб</span>
                  <input type="range" min={100} max={200} value={scaleD} className={styles.slider}
                    onChange={(e) => handlePositionChange('sd', Number(e.target.value))} />
                  <span className={styles.sliderValue}>{scaleD}%</span>
                </label>
              </>
            )}
            <form className={styles.heroInlineForm} onSubmit={handleSubmitDesktop}>
              <label className={styles.fileBtn}>
                {fileNameD ?? (current ? 'Заменить фото' : 'Загрузить фото')}
                <input ref={fileRefD} type="file" accept="image/*" className={styles.fileInputHidden}
                  onChange={(e) => { const f = e.target.files?.[0]; setPreviewD(f ? URL.createObjectURL(f) : null); setFileNameD(f?.name ?? null); }} />
              </label>
              {fileNameD && (
                <button className={styles.submit} type="submit" disabled={uploadingD}>
                  {uploadingD ? 'Загрузка…' : 'Сохранить'}
                </button>
              )}
            </form>
            {current && (
              <button className={styles.deleteBannerBtn} onClick={handleDelete}>
                Удалить баннер полностью
              </button>
            )}
          </div>

          {/* Mobile block */}
          <div className={styles.heroBannerBlock}>
            <p className={styles.heroBannerBlockTitle}>Мобильный</p>
            <div className={styles.heroPreviewMobileWrap}>
              {displayUrlM
                ? <img src={displayUrlM} alt="Мобильный" className={styles.heroPreviewImg} style={{ objectPosition: `${posXM}% ${posYM}%`, transform: `scale(${scaleM / 100})` }} />
                : <div className={styles.heroPreviewEmpty}>Не установлен</div>
              }
            </div>
            {current && (
              <>
                <p className={styles.heroPositionLabel}>
                  Кадрировка {saving && <span className={styles.heroSaving}>сохраняется…</span>}
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
                <label className={styles.sliderField}>
                  <span className={styles.sliderName}>Масштаб</span>
                  <input type="range" min={100} max={200} value={scaleM} className={styles.slider}
                    onChange={(e) => handlePositionChange('sm', Number(e.target.value))} />
                  <span className={styles.sliderValue}>{scaleM}%</span>
                </label>
              </>
            )}
            <form className={styles.heroInlineForm} onSubmit={handleSubmitMobile}>
              <label className={`${styles.fileBtn} ${!current ? styles.fileBtnDisabled : ''}`}>
                {fileNameM ?? (current?.imageUrlMobile ? 'Заменить фото' : 'Загрузить фото')}
                <input ref={fileRefM} type="file" accept="image/*" className={styles.fileInputHidden}
                  disabled={!current}
                  onChange={(e) => { const f = e.target.files?.[0]; setPreviewM(f ? URL.createObjectURL(f) : null); setFileNameM(f?.name ?? null); }} />
              </label>
              {fileNameM && (
                <button className={styles.submit} type="submit" disabled={uploadingM}>
                  {uploadingM ? 'Загрузка…' : 'Сохранить'}
                </button>
              )}
            </form>
            {current?.imageUrlMobile && (
              <button className={styles.deleteBannerBtn} onClick={handleDeleteMobile}>
                Удалить мобильное фото
              </button>
            )}
            {!current && <p className={styles.hint}>Сначала загрузите десктоп-баннер</p>}
          </div>

          {/* Tablet block */}
          <div className={styles.heroBannerBlock}>
            <p className={styles.heroBannerBlockTitle}>Планшет (640–1023px)</p>
            <div className={styles.heroPreviewWrap}>
              {displayUrlT
                ? <img src={displayUrlT} alt="Планшет" className={styles.heroPreviewImg} style={{ objectPosition: `${posXT}% ${posYT}%`, transform: `scale(${scaleT / 100})` }} />
                : <div className={styles.heroPreviewEmpty}>Не установлен</div>
              }
            </div>
            {current && (
              <>
                <p className={styles.heroPositionLabel}>
                  Кадрировка {saving && <span className={styles.heroSaving}>сохраняется…</span>}
                </p>
                <label className={styles.sliderField}>
                  <span className={styles.sliderName}>Горизонталь</span>
                  <input type="range" min={0} max={100} value={posXT} className={styles.slider}
                    onChange={(e) => handlePositionChange('xt', Number(e.target.value))} />
                  <span className={styles.sliderValue}>{posXT}%</span>
                </label>
                <label className={styles.sliderField}>
                  <span className={styles.sliderName}>Вертикаль</span>
                  <input type="range" min={0} max={100} value={posYT} className={styles.slider}
                    onChange={(e) => handlePositionChange('yt', Number(e.target.value))} />
                  <span className={styles.sliderValue}>{posYT}%</span>
                </label>
                <label className={styles.sliderField}>
                  <span className={styles.sliderName}>Масштаб</span>
                  <input type="range" min={100} max={200} value={scaleT} className={styles.slider}
                    onChange={(e) => handlePositionChange('st', Number(e.target.value))} />
                  <span className={styles.sliderValue}>{scaleT}%</span>
                </label>
              </>
            )}
            <form className={styles.heroInlineForm} onSubmit={handleSubmitTablet}>
              <label className={`${styles.fileBtn} ${!current ? styles.fileBtnDisabled : ''}`}>
                {fileNameT ?? (current?.imageUrlTablet ? 'Заменить фото' : 'Загрузить фото')}
                <input ref={fileRefT} type="file" accept="image/*" className={styles.fileInputHidden}
                  disabled={!current}
                  onChange={(e) => { const f = e.target.files?.[0]; setPreviewT(f ? URL.createObjectURL(f) : null); setFileNameT(f?.name ?? null); }} />
              </label>
              {fileNameT && (
                <button className={styles.submit} type="submit" disabled={uploadingT}>
                  {uploadingT ? 'Загрузка…' : 'Сохранить'}
                </button>
              )}
            </form>
            {current?.imageUrlTablet && (
              <button className={styles.deleteBannerBtn} onClick={handleDeleteTablet}>
                Удалить планшетное фото
              </button>
            )}
            {!current && <p className={styles.hint}>Сначала загрузите десктоп-баннер</p>}
          </div>

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
  mobile?: boolean;
  hasContainerHeight?: boolean;
  heightOnly?: boolean;
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
  const [scale, setScale] = useState(data?.scale ?? 100);
  const [containerHeight, setContainerHeight] = useState(data?.containerHeight ?? 0);
  const [containerHeightMobile, setContainerHeightMobile] = useState(data?.containerHeightMobile ?? 0);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (data) {
      setPosX(data.positionX);
      setPosY(data.positionY);
      setScale(data.scale ?? 100);
      setContainerHeight(data.containerHeight ?? 0);
      setContainerHeightMobile(data.containerHeightMobile ?? 0);
    }
  }, [data]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setPreview(file ? URL.createObjectURL(file) : null);
    setFileName(file ? file.name : null);
  }

  function handlePositionChange(axis: 'x' | 'y' | 's' | 'h' | 'hm', val: number) {
    if (axis === 'x') setPosX(val);
    else if (axis === 'y') setPosY(val);
    else if (axis === 's') setScale(val);
    else if (axis === 'h') setContainerHeight(val);
    else setContainerHeightMobile(val);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      setSaving(true);
      try {
        const newX = axis === 'x' ? val : posX;
        const newY = axis === 'y' ? val : posY;
        const newS = axis === 's' ? val : scale;
        const newH = axis === 'h' ? val : containerHeight;
        const newHm = axis === 'hm' ? val : containerHeightMobile;
        let updated;
        if (config.heightOnly && !data) {
          updated = await upsertSiteImage({ slotKey: config.key, imageUrl: '', imageKey: '', containerHeight: newH, containerHeightMobile: newHm });
        } else {
          updated = await updateSiteImagePosition(config.key, newX, newY, newS, newH, newHm);
        }
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
      const { publicUrl, key, srcset } = await uploadFile(file);
      const updated = await upsertSiteImage({
        slotKey: config.key,
        imageUrl: publicUrl,
        imageKey: key,
        imageSrcSet: srcset,
        positionX: posX,
        positionY: posY,
        scale,
        containerHeight,
        containerHeightMobile,
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

      {config.heightOnly ? (
        <div className={styles.heroPositionBlock}>
          <p className={styles.heroPositionLabel}>
            Высота {saving && <span className={styles.heroSaving}>сохраняется…</span>}
          </p>
          <label className={styles.sliderField}>
            <span className={styles.sliderName}>Десктоп, px</span>
            <input type="range" min={200} max={1200} value={containerHeight || 500} className={styles.slider}
              onChange={(e) => handlePositionChange('h', Number(e.target.value))} />
            <span className={styles.sliderValue}>{containerHeight > 0 ? `${containerHeight}px` : 'авто'}</span>
          </label>
          <label className={styles.sliderField}>
            <span className={styles.sliderName}>Мобайл, px</span>
            <input type="range" min={100} max={800} value={containerHeightMobile || 300} className={styles.slider}
              onChange={(e) => handlePositionChange('hm', Number(e.target.value))} />
            <span className={styles.sliderValue}>{containerHeightMobile > 0 ? `${containerHeightMobile}px` : 'авто'}</span>
          </label>
        </div>
      ) : (
        <>
          <div className={styles.slotBody}>
            {/* Preview */}
            <div
              className={config.portrait ? styles.slotPreviewPortrait : config.mobile ? styles.slotPreviewMobile : styles.slotPreviewLandscape}
              style={config.hasContainerHeight && containerHeight > 0 ? { height: `${containerHeight}px`, width: 'auto', aspectRatio: 'unset' } : undefined}
            >
              {displayUrl ? (
                <img
                  src={displayUrl}
                  alt={config.label}
                  className={styles.slotPreviewImg}
                  style={{ objectPosition: `${posX}% ${posY}%`, transform: `scale(${scale / 100})` }}
                />
              ) : (
                <div className={styles.slotPreviewEmpty}>Не загружено</div>
              )}
            </div>

            {/* Position + scale sliders */}
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
                <label className={styles.sliderField}>
                  <span className={styles.sliderName}>Масштаб</span>
                  <input type="range" min={100} max={200} value={scale} className={styles.slider}
                    onChange={(e) => handlePositionChange('s', Number(e.target.value))} />
                  <span className={styles.sliderValue}>{scale}%</span>
                </label>
                {config.hasContainerHeight && (
                  <>
                    <label className={styles.sliderField}>
                      <span className={styles.sliderName}>Высота десктоп, px</span>
                      <input type="range" min={200} max={800} value={containerHeight || 400} className={styles.slider}
                        onChange={(e) => handlePositionChange('h', Number(e.target.value))} />
                      <span className={styles.sliderValue}>{containerHeight > 0 ? `${containerHeight}px` : 'авто'}</span>
                    </label>
                    <label className={styles.sliderField}>
                      <span className={styles.sliderName}>Высота мобайл, px</span>
                      <input type="range" min={100} max={800} value={containerHeightMobile || 300} className={styles.slider}
                        onChange={(e) => handlePositionChange('hm', Number(e.target.value))} />
                      <span className={styles.sliderValue}>{containerHeightMobile > 0 ? `${containerHeightMobile}px` : 'авто'}</span>
                    </label>
                  </>
                )}
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
        </>
      )}
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
  {
    key: 'home-featured-media',
    label: 'Высота карточки коллекции',
    hint: 'Задаёт высоту блока с фото коллекции на главной странице',
    heightOnly: true,
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
      <HeroSection />

      <div className={styles.formHeader}>
        <h2 className={styles.sectionTitle}>Фото главной страницы</h2>
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
  { key: 'about-hero',        label: 'Hero — Десктоп',          hint: 'Большое фоновое фото в шапке страницы «Обо мне» (десктоп / планшет)' },
  { key: 'about-hero-mobile', label: 'Hero — Мобильный',        hint: 'Отдельное фото для мобильных устройств (до 640px). Если не загружено — используется десктопное', mobile: true },
  { key: 'about-portrait',    label: 'Портрет в разделе Story', hint: 'Фото мастера рядом с текстом о себе', portrait: true },
];

// ─── Portfolio Projects (избранные проекты на «Обо мне») ─────────────────────

function ProjectPhotoAdminRow({
  photo,
  idx,
  total,
  onUpdate,
  onDelete,
  onMove,
}: {
  photo: ProjectPhoto;
  idx: number;
  total: number;
  onUpdate: (p: ProjectPhoto) => void;
  onDelete: (id: number) => void;
  onMove: (id: number, dir: 'up' | 'down') => void;
}) {
  const [posX, setPosX] = useState(photo.positionX);
  const [posY, setPosY] = useState(photo.positionY);
  const [scale, setScale] = useState(photo.scale ?? 100);
  const [saving, setSaving] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const posRef = useRef({ x: photo.positionX, y: photo.positionY, s: photo.scale ?? 100 });

  useEffect(() => {
    setPosX(photo.positionX);
    setPosY(photo.positionY);
    setScale(photo.scale ?? 100);
    posRef.current = { x: photo.positionX, y: photo.positionY, s: photo.scale ?? 100 };
  }, [photo]);

  function handlePos(axis: 'x' | 'y' | 's', val: number) {
    if (axis === 'x') { setPosX(val); posRef.current.x = val; }
    else if (axis === 'y') { setPosY(val); posRef.current.y = val; }
    else { setScale(val); posRef.current.s = val; }
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setSaving(true);
      try {
        const updated = await updateProjectPhotoPosition(photo.id, posRef.current.x, posRef.current.y, posRef.current.s);
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
    await deleteProjectPhoto(photo.id);
    onDelete(photo.id);
    showToast('Удалено');
  }

  return (
    <div className={styles.dynPhotoRow}>
      <div className={styles.dynPhotoThumb}>
        <img src={photo.imageUrl} alt="" style={{ objectPosition: `${posX}% ${posY}%`, transform: `scale(${scale / 100})` }} />
      </div>
      <div className={styles.dynPhotoMeta}>
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
          <label className={styles.sliderField}>
            <span className={styles.sliderName}>Масштаб</span>
            <input type="range" min={100} max={200} value={scale} className={styles.slider}
              onChange={(e) => handlePos('s', Number(e.target.value))} />
            <span className={styles.sliderValue}>{scale}%</span>
          </label>
        </div>
        <div className={styles.cardActions} style={{ paddingLeft: 0, paddingBottom: 0, borderTop: 'none' }}>
          <button className={styles.orderBtn} onClick={() => onMove(photo.id, 'up')} disabled={idx === 0} aria-label="Вверх">↑</button>
          <button className={styles.orderBtn} onClick={() => onMove(photo.id, 'down')} disabled={idx === total - 1} aria-label="Вниз">↓</button>
        </div>
      </div>
      <button className={styles.deleteBtn} onClick={handleDelete} aria-label="Удалить">×</button>
    </div>
  );
}

function PortfolioProjectRow({
  project,
  idx,
  total,
  onUpdate,
  onDelete,
  onMove,
}: {
  project: PortfolioProject;
  idx: number;
  total: number;
  onUpdate: (p: PortfolioProject) => void;
  onDelete: (id: number) => void;
  onMove: (id: number, dir: 'up' | 'down') => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoFileRef = useRef<HTMLInputElement>(null);

  const [eyebrow, setEyebrow] = useState(project.eyebrow ?? '');
  const [title, setTitle] = useState(project.title);
  const [meta, setMeta] = useState(project.meta ?? '');
  const [lead, setLead] = useState(project.lead ?? '');
  const [paragraph1, setParagraph1] = useState(project.paragraph1 ?? '');
  const [paragraph2, setParagraph2] = useState(project.paragraph2 ?? '');

  useEffect(() => {
    setEyebrow(project.eyebrow ?? '');
    setTitle(project.title);
    setMeta(project.meta ?? '');
    setLead(project.lead ?? '');
    setParagraph1(project.paragraph1 ?? '');
    setParagraph2(project.paragraph2 ?? '');
  }, [project]);

  async function handleSaveText(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updatePortfolioProject(project.id, {
        eyebrow: eyebrow.trim() || undefined,
        title: title.trim(),
        meta: meta.trim() || undefined,
        lead: lead.trim() || undefined,
        paragraph1: paragraph1.trim() || undefined,
        paragraph2: paragraph2.trim() || undefined,
        imageUrl: project.imageUrl ?? undefined,
        imageKey: project.imageKey ?? undefined,
        imageSrcSet: project.imageSrcSet ?? undefined,
      });
      onUpdate(updated);
      showToast('Сохранено');
    } catch {
      showToast('Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  }

  async function handleAddPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const { publicUrl, key, srcset } = await uploadFile(file);
      const newPhoto = await addProjectPhoto(project.id, publicUrl, key, srcset);
      onUpdate({ ...project, photos: [...project.photos, newPhoto] });
      showToast('Фото добавлено');
    } catch {
      showToast('Ошибка загрузки');
    } finally {
      setUploadingPhoto(false);
      if (photoFileRef.current) photoFileRef.current.value = '';
    }
  }

  async function handleMovePhoto(id: number, dir: 'up' | 'down') {
    const photos = project.photos;
    const photoIdx = photos.findIndex((p) => p.id === id);
    const swapIdx = dir === 'up' ? photoIdx - 1 : photoIdx + 1;
    if (swapIdx < 0 || swapIdx >= photos.length) return;
    const normalized = photos.map((p, i) => ({ ...p, sortOrder: i }));
    await reorderProjectPhoto(normalized[photoIdx].id, swapIdx);
    await reorderProjectPhoto(normalized[swapIdx].id, photoIdx);
    const updated = [...normalized];
    updated[photoIdx] = { ...normalized[photoIdx], sortOrder: swapIdx };
    updated[swapIdx] = { ...normalized[swapIdx], sortOrder: photoIdx };
    updated.sort((a, b) => a.sortOrder - b.sortOrder || a.createdAt.localeCompare(b.createdAt));
    onUpdate({ ...project, photos: updated });
  }

  async function handleDelete() {
    if (!confirm(`Удалить проект «${project.title}»?`)) return;
    await deletePortfolioProject(project.id);
    onDelete(project.id);
    showToast('Удалено');
  }

  const thumbPhoto = project.photos[0] ?? null;
  const thumbUrl = thumbPhoto?.imageUrl ?? project.imageUrl ?? null;
  const thumbPosX = thumbPhoto?.positionX ?? project.positionX;
  const thumbPosY = thumbPhoto?.positionY ?? project.positionY;
  const thumbScale = thumbPhoto?.scale ?? project.scale ?? 100;

  return (
    <div className={styles.projectRow}>
      <div className={styles.projectRowHeader}>
        <div className={styles.projectRowInfo}>
          {thumbUrl && (
            <div className={styles.projectThumb}>
              <img
                src={thumbUrl}
                alt={project.title}
                style={{ objectPosition: `${thumbPosX}% ${thumbPosY}%`, transform: `scale(${thumbScale / 100})` }}
              />
            </div>
          )}
          <div>
            {project.eyebrow && <span className={styles.projectEyebrow}>{project.eyebrow}</span>}
            <span className={styles.projectTitle}>{project.title}</span>
            {project.photos.length > 0 && (
              <span className={styles.projectEyebrow}> · {project.photos.length} фото</span>
            )}
          </div>
        </div>
        <div className={styles.projectRowActions}>
          <button className={styles.orderBtn} onClick={() => onMove(project.id, 'up')} disabled={idx === 0} aria-label="Вверх">↑</button>
          <button className={styles.orderBtn} onClick={() => onMove(project.id, 'down')} disabled={idx === total - 1} aria-label="Вниз">↓</button>
          <button className={styles.editBtn} onClick={() => setExpanded((v) => !v)}>
            {expanded ? 'Свернуть' : 'Изменить'}
          </button>
          <button className={styles.deleteBtn} onClick={handleDelete} aria-label="Удалить">×</button>
        </div>
      </div>

      {expanded && (
        <div className={styles.projectEditor}>
          <form className={styles.form} onSubmit={handleSaveText}>
            <label className={styles.field}>
              <span className={styles.label}>Надпись над заголовком (eyebrow)</span>
              <input className={styles.input} value={eyebrow} onChange={(e) => setEyebrow(e.target.value)} placeholder="Конкурс" />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>Заголовок *</span>
              <input className={styles.input} value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Дыхание весны" />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>Мета (под заголовком в карточке)</span>
              <input className={styles.input} value={meta} onChange={(e) => setMeta(e.target.value)} placeholder="Всероссийский конкурс" />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>Вступление (lead)</span>
              <textarea className={styles.textarea} value={lead} onChange={(e) => setLead(e.target.value)} rows={3} placeholder="Краткое описание проекта…" />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>Абзац 1</span>
              <textarea className={styles.textarea} value={paragraph1} onChange={(e) => setParagraph1(e.target.value)} rows={3} />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>Абзац 2 (необязательно)</span>
              <textarea className={styles.textarea} value={paragraph2} onChange={(e) => setParagraph2(e.target.value)} rows={3} />
            </label>
            <button className={styles.submit} type="submit" disabled={saving}>
              {saving ? 'Сохраняется…' : 'Сохранить текст'}
            </button>
          </form>

          <div className={styles.projectImageSection}>
            <p className={styles.label}>Фото галереи проекта</p>
            <p className={styles.formHint}>Фотографии листаются слайдером на странице «Обо мне»</p>
            {project.photos.length > 0 && (
              <div className={styles.dynPhotoList}>
                {project.photos.map((photo, photoIdx) => (
                  <ProjectPhotoAdminRow
                    key={photo.id}
                    photo={photo}
                    idx={photoIdx}
                    total={project.photos.length}
                    onUpdate={(updated) => onUpdate({
                      ...project,
                      photos: project.photos.map((ph) => ph.id === updated.id ? updated : ph),
                    })}
                    onDelete={(id) => onUpdate({ ...project, photos: project.photos.filter((ph) => ph.id !== id) })}
                    onMove={handleMovePhoto}
                  />
                ))}
              </div>
            )}
            <div className={styles.fileInputRow} style={{ marginTop: 8 }}>
              <label className={`${styles.fileBtn} ${uploadingPhoto ? styles.fileBtnDisabled : ''}`}>
                {uploadingPhoto ? 'Загрузка…' : '+ Добавить фото'}
                <input ref={photoFileRef} type="file" accept="image/*" className={styles.fileInputHidden}
                  disabled={uploadingPhoto}
                  onChange={handleAddPhoto} />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PortfolioProjectsSection() {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    adminListPortfolioProjects().then(setProjects).finally(() => setLoading(false));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      const maxOrder = projects.length > 0 ? Math.max(...projects.map((p) => p.sortOrder)) : -1;
      const created = await createPortfolioProject({ title: newTitle.trim(), sortOrder: maxOrder + 1 });
      setProjects((prev) => [...prev, created]);
      setNewTitle('');
      showToast('Проект создан');
    } catch {
      showToast('Ошибка создания');
    } finally {
      setCreating(false);
    }
  }

  async function handleMove(id: number, dir: 'up' | 'down') {
    const idx = projects.findIndex((p) => p.id === id);
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= projects.length) return;
    const normalized = projects.map((p, i) => ({ ...p, sortOrder: i }));
    await reorderPortfolioProject(normalized[idx].id, swapIdx);
    await reorderPortfolioProject(normalized[swapIdx].id, idx);
    const updated = [...normalized];
    updated[idx] = { ...normalized[idx], sortOrder: swapIdx };
    updated[swapIdx] = { ...normalized[swapIdx], sortOrder: idx };
    updated.sort((a, b) => a.sortOrder - b.sortOrder || a.createdAt.localeCompare(b.createdAt));
    setProjects(updated);
  }

  return (
    <div className={styles.section}>
      <div className={styles.formHeader}>
        <h2 className={styles.sectionTitle}>Избранные проекты</h2>
        <p className={styles.formHint}>Карточки в разделе «Portfolio» на странице «Обо мне». Порядок меняется стрелками.</p>
      </div>

      <form className={styles.form} onSubmit={handleCreate} style={{ marginBottom: 24 }}>
        <label className={styles.field}>
          <span className={styles.label}>Заголовок нового проекта</span>
          <input className={styles.input} value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Название проекта" required />
        </label>
        <button className={styles.submit} type="submit" disabled={creating}>
          {creating ? 'Создание…' : 'Создать проект'}
        </button>
      </form>

      {loading ? (
        <p className={styles.hint}>Загрузка…</p>
      ) : projects.length === 0 ? (
        <p className={styles.hint}>Проектов пока нет</p>
      ) : (
        <div className={styles.projectList}>
          {projects.map((p, idx) => (
            <PortfolioProjectRow
              key={p.id}
              project={p}
              idx={idx}
              total={projects.length}
              onUpdate={(updated) => setProjects((prev) => prev.map((i) => i.id === updated.id ? updated : i))}
              onDelete={(id) => setProjects((prev) => prev.filter((i) => i.id !== id))}
              onMove={handleMove}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const STORY_TEXT_SLOTS = [
  {
    key: 'about-story-p1',
    label: 'Текст о себе — абзац 1',
    fallback: 'Конструктор одежды, выпускница Инженерной школы одежды СПбГУПТД по направлению «Конструирование, моделирование и технология швейных изделий».',
  },
  {
    key: 'about-story-p2',
    label: 'Текст о себе — абзац 2',
    fallback: 'В своих проектах я в первую очередь обращаюсь к теме женственности и стремлюсь раскрывать красоту через пластику линий, пропорции и внимание к деталям. Для меня важен диалог между конструкцией и образом, когда форма становится продолжением характера.',
  },
];

function StoryTextSlot({ slotKey, label, fallback, data, onUpdate }: {
  slotKey: string;
  label: string;
  fallback: string;
  data: SiteTextEntry | null;
  onUpdate: (t: SiteTextEntry) => void;
}) {
  const [value, setValue] = useState(data?.value ?? '');
  const [saving, setSaving] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setValue(data?.value ?? '');
  }, [data]);

  function handleChange(v: string) {
    setValue(v);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setSaving(true);
      try {
        const updated = await upsertSiteText(slotKey, v);
        onUpdate(updated);
      } catch {
        showToast('Ошибка сохранения');
      } finally {
        setSaving(false);
      }
    }, 800);
  }

  return (
    <label className={styles.field}>
      <span className={styles.label}>
        {label} {saving && <span className={styles.heroSaving}>сохраняется…</span>}
      </span>
      <textarea
        className={styles.textarea}
        rows={4}
        value={value || fallback}
        onChange={(e) => handleChange(e.target.value)}
      />
    </label>
  );
}

function AboutSection() {
  const [images, setImages] = useState<Map<string, SiteImage>>(new Map());
  const [texts, setTexts] = useState<Map<string, SiteTextEntry>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchAllSiteImages(),
      fetchAllSiteTexts(),
    ]).then(([imgs, txts]) => {
      setImages(new Map(imgs.map((img) => [img.slotKey, img])));
      setTexts(new Map(txts.map((t) => [t.slotKey, t])));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  function handleImageUpdate(slotKey: string, img: SiteImage | null) {
    setImages((prev) => {
      const next = new Map(prev);
      if (img) next.set(slotKey, img); else next.delete(slotKey);
      return next;
    });
  }

  function handleTextUpdate(t: SiteTextEntry) {
    setTexts((prev) => new Map(prev).set(t.slotKey, t));
  }

  if (loading) return <p className={styles.hint}>Загрузка…</p>;

  return (
    <div className={styles.section}>
      <div className={styles.formHeader}>
        <h2 className={styles.sectionTitle}>Страница «Обо мне»</h2>
        <p className={styles.formHint}>Все фотографии, которые отображаются на странице /about</p>
      </div>

      <div className={styles.slotGroup}>
        <p className={styles.slotGroupTitle}>Основные фото</p>
        {ABOUT_SLOTS.map((cfg) => (
          <SiteImageSlot
            key={cfg.key}
            config={cfg}
            data={images.get(cfg.key) ?? null}
            onUpdate={(img) => handleImageUpdate(cfg.key, img)}
          />
        ))}
      </div>

      <div className={styles.slotGroup}>
        <p className={styles.slotGroupTitle}>Текст о себе</p>
        {STORY_TEXT_SLOTS.map((slot) => (
          <StoryTextSlot
            key={slot.key}
            slotKey={slot.key}
            label={slot.label}
            fallback={slot.fallback}
            data={texts.get(slot.key) ?? null}
            onUpdate={handleTextUpdate}
          />
        ))}
      </div>

      <PortfolioProjectsSection />
    </div>
  );
}

// ─── Collections ─────────────────────────────────────────────────────────────

// ── Dynamic collection photo row ──────────────────────────────────────────

type Breakpoint = 'desktop' | 'tablet' | 'mobile';

const BP_LABELS: Record<Breakpoint, string> = {
  desktop: 'Большой',
  tablet: 'Средний',
  mobile: 'Мобильный',
};

type PhotoCropValues = {
  positionX: number; positionY: number; scale: number;
  positionXTablet: number; positionYTablet: number; scaleTablet: number;
  positionXMobile: number; positionYMobile: number; scaleMobile: number;
};

const BP_FIELDS: Record<Breakpoint, { x: keyof PhotoCropValues; y: keyof PhotoCropValues; s: keyof PhotoCropValues }> = {
  desktop: { x: 'positionX',       y: 'positionY',       s: 'scale' },
  tablet:  { x: 'positionXTablet', y: 'positionYTablet', s: 'scaleTablet' },
  mobile:  { x: 'positionXMobile', y: 'positionYMobile', s: 'scaleMobile' },
};

function DynPhotoRow({
  photo,
  label,
  responsive,
  onDelete,
  onUpdate,
  onMoveUp,
  onMoveDown,
}: {
  photo: DynamicCollectionPhoto;
  label?: string;
  responsive?: boolean;
  onDelete: (id: number) => void;
  onUpdate: (p: DynamicCollectionPhoto) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}) {
  const [values, setValues] = useState<PhotoCropValues>({
    positionX: photo.positionX,
    positionY: photo.positionY,
    scale: photo.scale ?? 100,
    positionXTablet: photo.positionXTablet ?? photo.positionX,
    positionYTablet: photo.positionYTablet ?? photo.positionY,
    scaleTablet: photo.scaleTablet ?? photo.scale ?? 100,
    positionXMobile: photo.positionXMobile ?? photo.positionX,
    positionYMobile: photo.positionYMobile ?? photo.positionY,
    scaleMobile: photo.scaleMobile ?? photo.scale ?? 100,
  });
  const [bp, setBp] = useState<Breakpoint>('desktop');
  const [saving, setSaving] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const valuesRef = useRef(values);
  valuesRef.current = values;

  function handlePos(axis: 'x' | 'y' | 's', val: number) {
    const f = BP_FIELDS[bp];
    const key = axis === 'x' ? f.x : axis === 'y' ? f.y : f.s;
    setValues((v) => ({ ...v, [key]: val }));
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setSaving(true);
      try {
        const patch = responsive ? valuesRef.current : {
          positionX: valuesRef.current.positionX,
          positionY: valuesRef.current.positionY,
          scale: valuesRef.current.scale,
        };
        const updated = await updateCollectionPhotoPosition(photo.id, patch);
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

  const typeLabel = label ?? (photo.photoType === 'CARD' ? 'Карточка' : photo.photoType === 'HERO' ? 'Hero' : 'Галерея');
  const f = BP_FIELDS[bp];
  const curX = values[f.x];
  const curY = values[f.y];
  const curS = values[f.s];

  return (
    <div className={styles.dynPhotoRow}>
      <div className={styles.dynPhotoThumb}>
        <img src={photo.imageUrl} alt={typeLabel}
          style={{ objectPosition: `${curX}% ${curY}%`, transform: `scale(${curS / 100})` }} />
      </div>
      <div className={styles.dynPhotoMeta}>
        <span className={styles.dynPhotoType}>{typeLabel}</span>
        {saving && <span className={styles.dynPhotoSaving}>сохраняется…</span>}
        {responsive && (
          <div className={styles.bpTabs}>
            {(['desktop','tablet','mobile'] as Breakpoint[]).map((b) => (
              <button
                key={b}
                type="button"
                className={`${styles.bpTab} ${bp === b ? styles.bpTabActive : ''}`}
                onClick={() => setBp(b)}
              >
                {BP_LABELS[b]}
              </button>
            ))}
          </div>
        )}
        <div className={styles.dynPhotoSliders}>
          <label className={styles.sliderField}>
            <span className={styles.sliderName}>Гориз.</span>
            <input type="range" min={0} max={100} value={curX} className={styles.slider}
              onChange={(e) => handlePos('x', Number(e.target.value))} />
            <span className={styles.sliderValue}>{curX}%</span>
          </label>
          <label className={styles.sliderField}>
            <span className={styles.sliderName}>Верт.</span>
            <input type="range" min={0} max={100} value={curY} className={styles.slider}
              onChange={(e) => handlePos('y', Number(e.target.value))} />
            <span className={styles.sliderValue}>{curY}%</span>
          </label>
          <label className={styles.sliderField}>
            <span className={styles.sliderName}>Масштаб</span>
            <input type="range" min={100} max={200} value={curS} className={styles.slider}
              onChange={(e) => handlePos('s', Number(e.target.value))} />
            <span className={styles.sliderValue}>{curS}%</span>
          </label>
        </div>
      </div>
      <div className={styles.dynPhotoActions}>
        {onMoveUp && <button className={styles.orderBtn} onClick={onMoveUp} aria-label="Вверх">↑</button>}
        {onMoveDown && <button className={styles.orderBtn} onClick={onMoveDown} aria-label="Вниз">↓</button>}
        <button className={styles.deleteBtn} onClick={handleDelete} aria-label="Удалить фото">×</button>
      </div>
    </div>
  );
}

// ── Collection photo groups ───────────────────────────────────────────────

type PhotoGroupDef = {
  type: 'HERO' | 'CARD' | 'GALLERY';
  label: string;
  hint: string;
};

const PHOTO_GROUPS: PhotoGroupDef[] = [
  { type: 'HERO',    label: 'Hero — полноэкранный баннер',  hint: 'Занимает весь экран вверху страницы коллекции. Заголовок выводится поверх.' },
  { type: 'CARD',    label: 'Карточка — обложка в каталоге', hint: 'Используется в каталоге /collections и на главной. Если нет Hero-фото — становится баннером страницы.' },
  { type: 'GALLERY', label: 'Галерея',                       hint: 'Фото 1–2: детальный блок (рядом с описанием коллекции). Фото 3+: мозаика в нижней части страницы.' },
];

function CollectionPhotoGroups({
  photos,
  onDelete,
  onUpdate,
  onReorder,
}: {
  photos: DynamicCollectionPhoto[];
  onDelete: (id: number) => void;
  onUpdate: (p: DynamicCollectionPhoto) => void;
  onReorder: (photos: DynamicCollectionPhoto[]) => void;
}) {
  async function handleMove(groupPhotos: DynamicCollectionPhoto[], idx: number, dir: -1 | 1) {
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= groupPhotos.length) return;
    const normalized = groupPhotos.map((p, i) => ({ ...p, sortOrder: i }));
    await reorderCollectionPhoto(normalized[idx].id, swapIdx);
    await reorderCollectionPhoto(normalized[swapIdx].id, idx);
    const updated = [...normalized];
    updated[idx] = { ...normalized[idx], sortOrder: swapIdx };
    updated[swapIdx] = { ...normalized[swapIdx], sortOrder: idx };
    updated.sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
    onReorder([
      ...photos.filter((p) => p.photoType !== groupPhotos[0].photoType),
      ...updated,
    ]);
  }

  return (
    <div className={styles.photoGroupsList}>
      {PHOTO_GROUPS.map((group) => {
        const groupPhotos = photos
          .filter((p) => p.photoType === group.type)
          .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);

        return (
          <div key={group.type} className={styles.photoGroup}>
            <div className={styles.photoGroupHeader}>
              <span className={styles.photoGroupLabel}>{group.label}</span>
              <span className={styles.photoGroupCount}>{groupPhotos.length} фото</span>
            </div>
            <p className={styles.photoGroupHint}>{group.hint}</p>

            {groupPhotos.length === 0 ? (
              <p className={styles.hint} style={{ margin: '8px 0 0' }}>Не загружено</p>
            ) : (
              <div className={styles.dynPhotoList}>
                {groupPhotos.map((photo, i) => (
                  <DynPhotoRow
                    key={photo.id}
                    photo={photo}
                    label={
                      group.type === 'GALLERY'
                        ? (i === 0 ? 'Деталь 1' : i === 1 ? 'Деталь 2' : `Мозаика ${i - 1}`)
                        : undefined
                    }
                    responsive={group.type === 'HERO' || group.type === 'CARD'}
                    onDelete={onDelete}
                    onUpdate={onUpdate}
                    onMoveUp={group.type === 'GALLERY' && i > 0 ? () => handleMove(groupPhotos, i, -1) : undefined}
                    onMoveDown={group.type === 'GALLERY' && i < groupPhotos.length - 1 ? () => handleMove(groupPhotos, i, 1) : undefined}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
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
  const [slug, setSlug] = useState(collection.slug);
  const [title, setTitle] = useState(collection.title);
  const [subtitle, setSubtitle] = useState(collection.subtitle ?? '');
  const [eyebrow, setEyebrow] = useState(collection.eyebrow ?? '');
  const [description, setDescription] = useState(collection.description ?? '');
  const [detailIntro, setDetailIntro] = useState(collection.detailIntro ?? '');
  const [detailFocus, setDetailFocus] = useState(collection.detailFocus ?? '');
  const [groupTitle, setGroupTitle] = useState(collection.groupTitle ?? '');
  const [hideCardLabel, setHideCardLabel] = useState(collection.hideCardLabel ?? false);
  const [heroTitlePosition, setHeroTitlePosition] = useState<HeroTitlePosition>(collection.heroTitlePosition ?? 'bottom-left');
  const [heroHeightMode, setHeroHeightMode] = useState<'full' | 'half' | 'auto'>(collection.heroHeightMode ?? 'full');
  const [heroHeightMobile, setHeroHeightMobile] = useState<string>(collection.heroHeightMobile != null ? String(collection.heroHeightMobile) : '');
  const [heroHeightDesktop, setHeroHeightDesktop] = useState<string>(collection.heroHeightDesktop != null ? String(collection.heroHeightDesktop) : '');
  const [cardHeightMobile, setCardHeightMobile] = useState<string>(collection.cardHeightMobile != null ? String(collection.cardHeightMobile) : '');
  const [cardHeightDesktop, setCardHeightDesktop] = useState<string>(collection.cardHeightDesktop != null ? String(collection.cardHeightDesktop) : '');
  const [tone, setTone] = useState<'warm' | 'cool' | 'neutral'>(collection.tone ?? 'neutral');
  const [category, setCategory] = useState<'COLLECTION' | 'SOLO' | 'SKETCH'>(collection.category ?? 'COLLECTION');
  const [featured, setFeatured] = useState(collection.featured);
  const [saving, setSaving] = useState(false);

  const [addingPhoto, setAddingPhoto] = useState(false);
  const [photoType, setPhotoType] = useState<'CARD' | 'HERO' | 'GALLERY'>('GALLERY');
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSlug(collection.slug);
    setTitle(collection.title);
    setSubtitle(collection.subtitle ?? '');
    setEyebrow(collection.eyebrow ?? '');
    setDescription(collection.description ?? '');
    setDetailIntro(collection.detailIntro ?? '');
    setDetailFocus(collection.detailFocus ?? '');
    setGroupTitle(collection.groupTitle ?? '');
    setHideCardLabel(collection.hideCardLabel ?? false);
    setHeroTitlePosition((collection.heroTitlePosition ?? 'bottom-left') as HeroTitlePosition);
    setHeroHeightMode(collection.heroHeightMode ?? 'full');
    setHeroHeightMobile(collection.heroHeightMobile != null ? String(collection.heroHeightMobile) : '');
    setHeroHeightDesktop(collection.heroHeightDesktop != null ? String(collection.heroHeightDesktop) : '');
    setCardHeightMobile(collection.cardHeightMobile != null ? String(collection.cardHeightMobile) : '');
    setCardHeightDesktop(collection.cardHeightDesktop != null ? String(collection.cardHeightDesktop) : '');
    setTone(collection.tone ?? 'neutral');
    setCategory(collection.category ?? 'COLLECTION');
    setFeatured(collection.featured);
  }, [collection]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { showToast('Название не может быть пустым'); return; }
    if (!slug.trim()) { showToast('Slug не может быть пустым'); return; }
    if (!/^[a-z0-9-]+$/.test(slug)) { showToast('Slug: только строчные буквы, цифры и дефис'); return; }
    setSaving(true);
    try {
      const updated = await updateCollection(collection.id, {
        slug: slug.trim(),
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        eyebrow: eyebrow.trim() || undefined,
        description: description.trim() || undefined,
        detailIntro: detailIntro.trim() || undefined,
        detailFocus: detailFocus.trim() || undefined,
        groupTitle: groupTitle.trim() || undefined,
        hideCardLabel,
        heroTitlePosition,
        heroHeightMode,
        heroHeightMobile: heroHeightMobile !== '' ? Number(heroHeightMobile) : null,
        heroHeightDesktop: heroHeightDesktop !== '' ? Number(heroHeightDesktop) : null,
        cardHeightMobile: cardHeightMobile !== '' ? Number(cardHeightMobile) : null,
        cardHeightDesktop: cardHeightDesktop !== '' ? Number(cardHeightDesktop) : null,
        tone,
        category,
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
      const { publicUrl, key, srcset } = await uploadFile(file);
      const galleryPhotos = collection.photos.filter((p) => p.photoType === 'GALLERY');
      const maxOrder = galleryPhotos.length > 0 ? Math.max(...galleryPhotos.map((p) => p.sortOrder)) : -1;
      const photo = await addCollectionPhoto(collection.id, {
        imageUrl: publicUrl,
        imageKey: key,
        imageSrcSet: srcset,
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

  function handlePhotoReorder(reordered: DynamicCollectionPhoto[]) {
    onChange({ ...collection, photos: reordered });
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
                  <span className={styles.label}>Slug (URL)</span>
                  <input className={styles.input} value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                    placeholder="my-collection" />
                </label>
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
                <label className={styles.field}>
                  <span className={styles.label}>Раздел</span>
                  <select className={styles.input} value={category} onChange={(e) => setCategory(e.target.value as 'COLLECTION' | 'SOLO' | 'SKETCH')}>
                    <option value="COLLECTION">Коллекции</option>
                    <option value="SOLO">Одиночные модели</option>
                    <option value="SKETCH">Эскизные проекты</option>
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
              <label className={styles.field}>
                <span className={styles.label}>Заголовок группы (для страницы /collections)</span>
                <input className={styles.input} value={groupTitle} onChange={(e) => setGroupTitle(e.target.value)} placeholder="Оставьте пустым, чтобы скрыть заголовок" />
              </label>
              <div className={styles.field}>
                <span className={styles.label}>Позиция заголовка на Hero</span>
                <div className={styles.heroTitlePositionGrid}>
                  {([
                    'top-left',    'top-center-left',    'top-center-right',    'top-right',
                    'upper-left',  'upper-center-left',  'upper-center-right',  'upper-right',
                    'lower-left',  'lower-center-left',  'lower-center-right',  'lower-right',
                    'bottom-left', 'bottom-center-left', 'bottom-center-right', 'bottom-right',
                  ] as HeroTitlePosition[]).map((pos) => (
                    <button
                      key={pos}
                      type="button"
                      data-pos={pos}
                      className={`${styles.heroTitlePositionCell} ${heroTitlePosition === pos ? styles.heroTitlePositionCellActive : ''}`}
                      onClick={() => setHeroTitlePosition(pos)}
                      title={pos}
                    >
                      <span className={styles.heroTitlePositionDot} />
                    </button>
                  ))}
                </div>
              </div>
              <label className={styles.field}>
                <span className={styles.label}>Высота Hero-секции</span>
                <select className={styles.input} value={heroHeightMode} onChange={(e) => setHeroHeightMode(e.target.value as 'full' | 'half' | 'auto')}>
                  <option value="full">На весь экран (100vh)</option>
                  <option value="half">Полэкрана (50vh)</option>
                  <option value="auto">По пропорциям фото</option>
                </select>
              </label>
              <div className={styles.createCollectionGrid}>
                <label className={styles.field}>
                  <span className={styles.label}>Высота Hero — мобайл (%)</span>
                  <input
                    className={styles.input}
                    type="number"
                    min={10}
                    max={100}
                    step={5}
                    value={heroHeightMobile}
                    onChange={(e) => setHeroHeightMobile(e.target.value)}
                    placeholder="по режиму выше"
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.label}>Высота Hero — десктоп (%)</span>
                  <input
                    className={styles.input}
                    type="number"
                    min={10}
                    max={100}
                    step={5}
                    value={heroHeightDesktop}
                    onChange={(e) => setHeroHeightDesktop(e.target.value)}
                    placeholder="по режиму выше"
                  />
                </label>
              </div>
              <div className={styles.createCollectionGrid}>
                <label className={styles.field}>
                  <span className={styles.label}>Высота карточки — мобайл (px)</span>
                  <input
                    className={styles.input}
                    type="number"
                    min={100}
                    max={1200}
                    step={10}
                    value={cardHeightMobile}
                    onChange={(e) => setCardHeightMobile(e.target.value)}
                    placeholder="авто"
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.label}>Высота карточки — десктоп (px)</span>
                  <input
                    className={styles.input}
                    type="number"
                    min={100}
                    max={1200}
                    step={10}
                    value={cardHeightDesktop}
                    onChange={(e) => setCardHeightDesktop(e.target.value)}
                    placeholder="авто"
                  />
                </label>
              </div>
              <label className={styles.field} style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" checked={hideCardLabel} onChange={(e) => setHideCardLabel(e.target.checked)} />
                <span className={styles.label} style={{ textTransform: 'none', fontWeight: 500 }}>Скрыть название под карточкой</span>
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
                    {(['HERO', 'CARD', 'GALLERY'] as const).map((t) => (
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
                  <p className={styles.photoTypeHint}>
                    {photoType === 'HERO' && 'Полноэкранный баннер вверху страницы коллекции'}
                    {photoType === 'CARD' && 'Обложка в каталоге коллекций и на главной; fallback для Hero если нет HERO-фото'}
                    {photoType === 'GALLERY' && 'Первые 2 — детальный блок (рядом с описанием), остальные — мозаика внизу страницы'}
                  </p>
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
              <p className={styles.hint}>Фото пока нет. Добавьте Hero, Карточку и фото галереи.</p>
            ) : (
              <CollectionPhotoGroups
                photos={collection.photos}
                onDelete={handlePhotoDelete}
                onUpdate={handlePhotoUpdate}
                onReorder={handlePhotoReorder}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Create collection form ────────────────────────────────────────────────

const MAX_COLLECTIONS = 25;

function CreateCollectionForm({ onCreated, nextSortOrder }: { onCreated: (c: DynamicCollection) => void; nextSortOrder: number }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    slug: '', title: '', subtitle: '', eyebrow: '', description: '',
    tone: 'neutral' as 'warm' | 'cool' | 'neutral',
    category: 'COLLECTION' as 'COLLECTION' | 'SOLO' | 'SKETCH',
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
        category: form.category,
        sortOrder: nextSortOrder,
      });
      onCreated(created);
      setForm({ slug: '', title: '', subtitle: '', eyebrow: '', description: '', tone: 'neutral', category: 'COLLECTION' });
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
        <label className={styles.field}>
          <span className={styles.label}>Раздел</span>
          <select className={styles.input} value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as 'COLLECTION' | 'SOLO' | 'SKETCH' }))}>
            <option value="COLLECTION">Коллекции</option>
            <option value="SOLO">Одиночные модели</option>
            <option value="SKETCH">Эскизные проекты</option>
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

function PositionInput({ index, total, onApply }: { index: number; total: number; onApply: (newIdx: number) => void }) {
  const [draft, setDraft] = useState(String(index + 1));
  // Sync external index changes back to the field (drag/arrow moves)
  useEffect(() => { setDraft(String(index + 1)); }, [index]);

  function commit() {
    const v = parseInt(draft, 10);
    if (Number.isNaN(v) || v < 1 || v > total) {
      setDraft(String(index + 1));
      return;
    }
    if (v - 1 !== index) onApply(v - 1);
  }

  return (
    <input
      type="number"
      min={1}
      max={total}
      value={draft}
      className={styles.positionInput}
      aria-label="Позиция"
      title="Позиция (Enter / уход с поля — применить)"
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') { e.currentTarget.blur(); }
        else if (e.key === 'Escape') { setDraft(String(index + 1)); e.currentTarget.blur(); }
      }}
    />
  );
}

function CollectionsSection() {
  const [collections, setCollections] = useState<DynamicCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  useEffect(() => {
    fetchCollections()
      .then(setCollections)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function handleChange(updated: DynamicCollection) {
    setCollections((prev) => prev.map((c) =>
      c.id === updated.id ? updated : (updated.featured ? { ...c, featured: false } : c)
    ));
  }

  function handleDelete(id: number) {
    setCollections((prev) => prev.filter((c) => c.id !== id));
  }

  function handleCreated(c: DynamicCollection) {
    setCollections((prev) => [...prev, c].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id));
  }

  async function handleReorderTo(id: number, newIdx: number) {
    const sorted = [...collections].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
    const oldIdx = sorted.findIndex((c) => c.id === id);
    if (oldIdx === -1) return;
    const clamped = Math.max(0, Math.min(sorted.length - 1, newIdx));
    if (clamped === oldIdx) return;
    const [moved] = sorted.splice(oldIdx, 1);
    sorted.splice(clamped, 0, moved);
    const updated = sorted.map((c, i) => ({ ...c, sortOrder: i }));
    const prevById = new Map(collections.map((c) => [c.id, c.sortOrder]));
    const changed = updated.filter((c) => prevById.get(c.id) !== c.sortOrder);
    setCollections(updated);
    try {
      await Promise.all(changed.map((c) => reorderCollection(c.id, c.sortOrder)));
    } catch {
      showToast('Ошибка сохранения порядка');
    }
  }

  async function handleMove(id: number, dir: 'up' | 'down') {
    const sorted = [...collections].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
    const idx = sorted.findIndex((c) => c.id === id);
    await handleReorderTo(id, dir === 'up' ? idx - 1 : idx + 1);
  }

  if (loading) return <p className={styles.hint}>Загрузка…</p>;

  const sorted = [...collections].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
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

      {sorted.length > 0 && (
        <div className={styles.collectionsList}>
          {sorted.map((c, idx) => (
            <div
              key={c.id}
              className={`${styles.collectionSortRow} ${draggingId === c.id ? styles.dragging : ''} ${overIdx === idx && draggingId !== null && draggingId !== c.id ? styles.dropTarget : ''}`}
              onDragOver={(e) => { if (draggingId !== null && draggingId !== c.id) { e.preventDefault(); setOverIdx(idx); } }}
              onDragLeave={() => { if (overIdx === idx) setOverIdx(null); }}
              onDrop={(e) => {
                e.preventDefault();
                if (draggingId !== null && draggingId !== c.id) {
                  handleReorderTo(draggingId, idx);
                }
                setDraggingId(null);
                setOverIdx(null);
              }}
            >
              <div className={styles.collectionSortBtns}>
                <button
                  className={styles.dragHandle}
                  draggable
                  onDragStart={(e) => { setDraggingId(c.id); e.dataTransfer.effectAllowed = 'move'; }}
                  onDragEnd={() => { setDraggingId(null); setOverIdx(null); }}
                  aria-label="Перетащить"
                  title="Перетащить"
                  type="button"
                >⋮⋮</button>
                <button className={styles.orderBtn} onClick={() => handleMove(c.id, 'up')} disabled={idx === 0} aria-label="Вверх">↑</button>
                <button className={styles.orderBtn} onClick={() => handleMove(c.id, 'down')} disabled={idx === sorted.length - 1} aria-label="Вниз">↓</button>
                <PositionInput
                  index={idx}
                  total={sorted.length}
                  onApply={(newIdx) => handleReorderTo(c.id, newIdx)}
                />
              </div>
              <DynCollectionCard
                collection={c}
                onChange={handleChange}
                onDelete={handleDelete}
              />
            </div>
          ))}
        </div>
      )}

      {canCreate
        ? <CreateCollectionForm
            onCreated={handleCreated}
            nextSortOrder={collections.length > 0 ? Math.max(...collections.map((c) => c.sortOrder)) + 1 : 0}
          />
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

  const VALID_TABS: Tab[] = ['products', 'patterns', 'portfolio', 'home', 'about', 'collections', 'settings'];
  const DEFAULT_TAB: Tab = SHOP_ENABLED ? 'products' : 'portfolio';
  const urlTab = new URLSearchParams(window.location.search).get('tab') as Tab | null;
  const [tab, setTab] = useState<Tab>(urlTab && VALID_TABS.includes(urlTab) ? urlTab : DEFAULT_TAB);

  function navigateTab(t: Tab) {
    const url = new URL(window.location.href);
    url.searchParams.set('tab', t);
    window.history.pushState(null, '', url);
    setTab(t);
  }

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
    { key: 'home', label: 'Главная' },
    { key: 'about', label: 'Обо мне' },
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
            onClick={() => navigateTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className={styles.content}>
        {tab === 'products' && <ProductsSection />}
        {tab === 'patterns' && <PatternsSection />}
        {tab === 'portfolio' && <PortfolioSection />}
        {tab === 'home' && <HomeSection />}
        {tab === 'about' && <AboutSection />}
        {tab === 'collections' && <CollectionsSection />}
        {tab === 'settings' && <SettingsSection />}
      </main>

      <Toaster />
    </div>
  );
}

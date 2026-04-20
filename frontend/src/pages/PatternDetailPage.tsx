import { useState, type MouseEvent } from 'react';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { showToast } from '../components/toast';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { useFavorites } from '../hooks/useFavorites';
import type { Product } from '../types/product';
import { CATEGORIES, PRODUCTS_BY_CATEGORY } from './patternsData';
import styles from './PatternDetailPage.module.css';

const MEDIA_BASE_URL = 'http://localhost:9000/litiy-sew-media';
const RUB_FORMATTER = new Intl.NumberFormat('ru-RU');

const HEIGHTS = ['149-154', '155-160', '161-166', '167-172', '173-178', '179-184'];
const SIZES = ['38', '40', '42', '44', '46', '48', '50', '52', '54'];
const SIZES_EU = ['32', '34', '36', '38', '40', '42', '44', '46', '48'];

type ParamMode = 'measures' | 'manual';
type SizeSystem = 'ru' | 'eu' | 'cm';

type Measures = {
  height: string;
  bust: string;
  waist: string;
  hips: string;
};

function pickSizeByHips(hips: string): string | null {
  const value = Number(hips);
  if (!Number.isFinite(value) || value <= 0) return null;
  const row = SIZE_TABLE.find((r) => value <= Number(r.hips));
  return row?.size ?? SIZE_TABLE[SIZE_TABLE.length - 1].size;
}

type RouteParams = {
  categorySlug: string;
  productId: string;
} | null;

type TabKey = 'description' | 'includes' | 'recommendations' | 'sizes';

function parseRoute(): RouteParams {
  const match = window.location.pathname.match(/^\/patterns\/([^/]+)\/([^/]+)/);
  if (!match) return null;
  return { categorySlug: match[1], productId: match[2] };
}

const DESCRIPTION = `Шорты расклёшенного силуэта, прямого кроя, с открытыми талией и низом. По спинке пояс расширяется к центру, фиксируется декоративной пряжкой. По полочке центральная встречная складка имитирует запах. Детали дополнены кулиской с эластичной тесьмой и декоративным шнуром. Карманы с отрезным бочком — по боковым швам.`;

const INCLUDES = [
  'PDF-выкройка для печати на A4 и плоттере (36 / 62 / 70 / 114 см)',
  'Инструкция по сборке выкройки из листов A4',
  'Подробное описание этапов пошива со схемами',
  'Расход ткани и список материалов для всех ростов',
];

const RECOMMENDATIONS = [
  'Плотные хлопковые ткани: твил, поплин, плательный хлопок',
  'Лён и смесовые льняные ткани средней плотности',
  'Вискоза, тенсел, тонкие костюмные ткани',
];

type SizeRow = { size: string; bust: string; waist: string; hips: string };

const SIZE_TABLE: SizeRow[] = [
  { size: '38', bust: '84', waist: '66', hips: '92' },
  { size: '40', bust: '88', waist: '70', hips: '96' },
  { size: '42', bust: '92', waist: '74', hips: '100' },
  { size: '44', bust: '96', waist: '78', hips: '104' },
  { size: '46', bust: '100', waist: '82', hips: '108' },
  { size: '48', bust: '104', waist: '86', hips: '112' },
  { size: '50', bust: '110', waist: '92', hips: '118' },
  { size: '52', bust: '116', waist: '98', hips: '124' },
  { size: '54', bust: '122', waist: '104', hips: '130' },
];

function findProduct(params: RouteParams): { product: Product; categoryTitle: string; categorySlug: string } | null {
  if (!params) return null;
  const category = CATEGORIES[params.categorySlug];
  if (!category) return null;
  const list = PRODUCTS_BY_CATEGORY[params.categorySlug] ?? [];
  const product = list.find((p) => p.id === params.productId);
  if (!product) return null;
  return { product, categoryTitle: category.title, categorySlug: params.categorySlug };
}

export default function PatternDetailPage() {
  const params = parseRoute();
  const match = findProduct(params);

  const { status } = useAuth();
  const { isFavorite, toggle } = useFavorites();
  const { add } = useCart();

  const [height, setHeight] = useState<string | null>(null);
  const [size, setSize] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [tab, setTab] = useState<TabKey>('description');
  const [error, setError] = useState<string | null>(null);

  const [paramMode, setParamMode] = useState<ParamMode>('measures');
  const [sizeSystem, setSizeSystem] = useState<SizeSystem>('ru');
  const [measures, setMeasures] = useState<Measures>({ height: '', bust: '', waist: '', hips: '' });
  const [measuresResult, setMeasuresResult] = useState<string | null>(null);

  if (!match) {
    return (
      <>
        <Header />
        <main className={styles.page}>
          <h1 className={styles.title}>Выкройка не найдена</h1>
          <a className={styles.backLink} href="/patterns">← К списку категорий</a>
        </main>

        <Footer />
      </>
    );
  }

  const { product, categoryTitle, categorySlug } = match;
  const favorite = isFavorite(product.id);
  const gallery = [product.image, product.image, product.image];

  const requireAuth = (): boolean => {
    if (status === 'authenticated') return true;
    showToast('Войдите, чтобы добавлять товары в корзину и избранное', {
      label: 'Войти',
      href: '/auth',
    });
    return false;
  };

  const handleFavoriteClick = (e: MouseEvent) => {
    e.preventDefault();
    if (!requireAuth()) return;
    toggle(product);
  };

  const handleAddToCart = async () => {
    if (!height || !size) {
      setError('Выберите рост и размер');
      return;
    }
    if (!requireAuth()) return;
    await add(product, { height, size });
    showToast('Выкройка добавлена в корзину', { label: 'В корзину', href: '/cart' });
  };

  const handleMeasureChange = (field: keyof Measures, value: string) => {
    const sanitized = value.replace(/[^\d]/g, '').slice(0, 3);
    setMeasures((prev) => ({ ...prev, [field]: sanitized }));
    setMeasuresResult(null);
    setError(null);
  };

  const handleCalculate = () => {
    const { height: h, bust, waist, hips } = measures;
    if (!h || !bust || !waist || !hips) {
      setError('Заполните все мерки');
      return;
    }
    const recommendedSize = pickSizeByHips(hips);
    const recommendedHeightRow = HEIGHTS.find((range) => {
      const [min, max] = range.split('-').map(Number);
      const val = Number(h);
      return val >= min && val <= max;
    }) ?? HEIGHTS[2];
    if (recommendedSize) {
      setSize(recommendedSize);
      setHeight(recommendedHeightRow);
      setMeasuresResult(`Рекомендуемый размер: ${recommendedSize}, рост ${recommendedHeightRow}`);
      setError(null);
    }
  };

  const sizesBySystem: Record<SizeSystem, string[]> = {
    ru: SIZES,
    eu: SIZES_EU,
    cm: SIZE_TABLE.map((r) => r.hips),
  };

  return (
    <>
      <Header />
      <main className={styles.page}>
        <nav className={styles.breadcrumbs}>
          <a href="/patterns">Выкройки</a>
          <span className={styles.sep}>/</span>
          <a href={`/patterns/${categorySlug}`}>{categoryTitle}</a>
          <span className={styles.sep}>/</span>
          <span className={styles.current}>{product.title}</span>
        </nav>

        <div className={styles.layout}>
          <section className={styles.gallery}>
            <div className={styles.thumbs}>
              {gallery.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  className={`${styles.thumb} ${activeImage === i ? styles.thumbActive : ''}`}
                  onClick={() => setActiveImage(i)}
                  aria-label={`Фото ${i + 1}`}
                >
                  <img src={`${MEDIA_BASE_URL}/${src}`} alt="" loading="lazy" />
                </button>
              ))}
            </div>
            <div className={styles.mainImage}>
              <img src={`${MEDIA_BASE_URL}/${gallery[activeImage]}`} alt={product.title} />
            </div>
          </section>

          <section className={styles.details}>
            <div className={styles.titleRow}>
              <h1 className={styles.productTitle}>{product.title}</h1>
              <div className={styles.rating} aria-label="Рейтинг">
                <span className={styles.stars}>★★★★★</span>
                <span className={styles.reviewsLink}>0 отзывов</span>
              </div>
            </div>

            <div className={styles.priceRow}>
              <span className={styles.price}>{RUB_FORMATTER.format(product.price)} ₽</span>
            </div>

            <div className={styles.difficulty}>
              <span className={styles.difficultyLabel}>Уровень сложности:</span>
              <span className={styles.difficultyValue}>Средний</span>
              <span className={styles.difficultyBar} aria-hidden="true">
                <span className={styles.difficultyFill} />
              </span>
            </div>

            <section className={styles.paramBlock}>
              <div className={styles.modeTabs} role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={paramMode === 'measures'}
                  className={`${styles.modeTab} ${paramMode === 'measures' ? styles.modeTabActive : ''}`}
                  onClick={() => { setParamMode('measures'); setError(null); }}
                >
                  Подбор размера по меркам
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={paramMode === 'manual'}
                  className={`${styles.modeTab} ${paramMode === 'manual' ? styles.modeTabActive : ''}`}
                  onClick={() => { setParamMode('manual'); setError(null); }}
                >
                  Выбрать вручную
                </button>
              </div>

              {paramMode === 'measures' ? (
                <div className={styles.measuresBody}>
                  <div className={styles.paramGroup}>
                    <div className={styles.paramColumn}>
                      <label className={styles.paramLabel}>Рост, см</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        className={styles.input}
                        placeholder="178"
                        value={measures.height}
                        onChange={(e) => handleMeasureChange('height', e.target.value)}
                      />
                    </div>
                    <div className={styles.paramColumn}>
                      <label className={styles.paramLabel}>Обхват груди, см</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        className={styles.input}
                        placeholder="100"
                        value={measures.bust}
                        onChange={(e) => handleMeasureChange('bust', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className={styles.paramGroup}>
                    <div className={styles.paramColumn}>
                      <label className={styles.paramLabel}>Обхват талии, см</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        className={styles.input}
                        placeholder="70"
                        value={measures.waist}
                        onChange={(e) => handleMeasureChange('waist', e.target.value)}
                      />
                    </div>
                    <div className={styles.paramColumn}>
                      <label className={styles.paramLabel}>Обхват бедер, см</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        className={styles.input}
                        placeholder="100"
                        value={measures.hips}
                        onChange={(e) => handleMeasureChange('hips', e.target.value)}
                      />
                    </div>
                  </div>

                  {measuresResult && <p className={styles.result}>{measuresResult}</p>}
                  {error && <p className={styles.error}>{error}</p>}

                  <button type="button" className={styles.pickBtn} onClick={handleCalculate}>
                    ПОДОБРАТЬ
                  </button>

                  <div className={styles.metaLinks}>
                    <a href="#sizes" onClick={(e) => { e.preventDefault(); setTab('sizes'); document.getElementById('tabs')?.scrollIntoView({ behavior: 'smooth' }); }}>Таблица размеров</a>
                    <a href="#description" onClick={(e) => { e.preventDefault(); setTab('description'); document.getElementById('tabs')?.scrollIntoView({ behavior: 'smooth' }); }}>Как снять мерки</a>
                  </div>

                  <div className={styles.deliveryNote}>
                    <p>
                      После оплаты вам будут отправлены <strong>на электронную почту</strong>, а также сохраняться <strong>в личном кабинете</strong> на сайте: выкройки для печати на принтере A4 и плоттере, подробная инструкция по пошиву с иллюстрациями.
                    </p>
                    <a className={styles.deliveryLink} href="#sample" onClick={(e) => e.preventDefault()}>Скачать пример инструкции</a>
                  </div>
                </div>
              ) : (
                <div className={styles.manualBody}>
                  <div className={styles.systemTabs} role="tablist">
                    <button
                      type="button"
                      role="tab"
                      aria-selected={sizeSystem === 'ru'}
                      className={`${styles.systemTab} ${sizeSystem === 'ru' ? styles.systemTabActive : ''}`}
                      onClick={() => setSizeSystem('ru')}
                    >
                      РАЗМЕР (RU)
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={sizeSystem === 'eu'}
                      className={`${styles.systemTab} ${sizeSystem === 'eu' ? styles.systemTabActive : ''}`}
                      onClick={() => setSizeSystem('eu')}
                    >
                      РАЗМЕР (EU)
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={sizeSystem === 'cm'}
                      className={`${styles.systemTab} ${sizeSystem === 'cm' ? styles.systemTabActive : ''}`}
                      onClick={() => setSizeSystem('cm')}
                    >
                      Эквивалент (в см)
                    </button>
                  </div>

                  <div className={styles.chipGroup}>
                    <h3 className={styles.chipTitle}>Рост (см)</h3>
                    <div className={styles.chips}>
                      {HEIGHTS.map((value) => (
                        <button
                          key={value}
                          type="button"
                          className={`${styles.chip} ${height === value ? styles.chipActive : ''}`}
                          onClick={() => { setHeight(value); setError(null); }}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={styles.chipGroup}>
                    <h3 className={styles.chipTitle}>
                      {sizeSystem === 'ru' && 'Размер (RU)'}
                      {sizeSystem === 'eu' && 'Размер (EU)'}
                      {sizeSystem === 'cm' && 'Обхват бёдер (см)'}
                    </h3>
                    <div className={styles.chips}>
                      {sizesBySystem[sizeSystem].map((value, i) => {
                        const ruValue = SIZES[i] ?? value;
                        return (
                          <button
                            key={value}
                            type="button"
                            className={`${styles.chip} ${size === ruValue ? styles.chipActive : ''}`}
                            onClick={() => { setSize(ruValue); setError(null); }}
                          >
                            {value}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {error && <p className={styles.error}>{error}</p>}
                </div>
              )}

              <div className={styles.actionsRow}>
                <button type="button" className={styles.addToCart} onClick={handleAddToCart}>
                  Добавить в корзину
                </button>
                <button
                  type="button"
                  className={`${styles.favButton} ${favorite ? styles.favButtonActive : ''}`}
                  aria-label={favorite ? 'Убрать из избранного' : 'В избранное'}
                  aria-pressed={favorite}
                  onClick={handleFavoriteClick}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill={favorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
              </div>
            </section>

            <aside className={styles.benefits}>
              <div className={styles.benefit}>
                <div className={styles.benefitIcon}>✓</div>
                <div>
                  <div className={styles.benefitTitle}>Выкройка придёт в ваш личный кабинет</div>
                  <div className={styles.benefitText}>и на почту</div>
                </div>
              </div>
              <div className={styles.benefit}>
                <div className={styles.benefitIcon}>✓</div>
                <div>
                  <div className={styles.benefitTitle}>Размер можно скачать</div>
                  <div className={styles.benefitText}>в любой момент на любое устройство</div>
                </div>
              </div>
              <div className={styles.benefit}>
                <div className={styles.benefitIcon}>✓</div>
                <div>
                  <div className={styles.benefitTitle}>Поддержка автора выкройки</div>
                  <div className={styles.benefitText}>в Telegram-чате покупателей</div>
                </div>
              </div>
            </aside>
          </section>
        </div>

        <section className={styles.tabsSection} id="tabs">
          <div className={styles.tabs} role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'description'}
              className={`${styles.tab} ${tab === 'description' ? styles.tabActive : ''}`}
              onClick={() => setTab('description')}
            >
              Описание
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'includes'}
              className={`${styles.tab} ${tab === 'includes' ? styles.tabActive : ''}`}
              onClick={() => setTab('includes')}
            >
              Что входит в покупку
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'recommendations'}
              className={`${styles.tab} ${tab === 'recommendations' ? styles.tabActive : ''}`}
              onClick={() => setTab('recommendations')}
            >
              Рекомендации по ткани
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'sizes'}
              className={`${styles.tab} ${tab === 'sizes' ? styles.tabActive : ''}`}
              onClick={() => setTab('sizes')}
            >
              Размерная сетка
            </button>
          </div>

          <div className={styles.tabPanel} role="tabpanel">
            {tab === 'description' && (
              <p className={styles.description}>{DESCRIPTION}</p>
            )}

            {tab === 'includes' && (
              <ul className={styles.list}>
                {INCLUDES.map((item) => <li key={item}>{item}</li>)}
              </ul>
            )}

            {tab === 'recommendations' && (
              <ul className={styles.list}>
                {RECOMMENDATIONS.map((item) => <li key={item}>{item}</li>)}
              </ul>
            )}

            {tab === 'sizes' && (
              <div className={styles.tableWrapper}>
                <table className={styles.sizeTable}>
                  <thead>
                    <tr>
                      <th>Размер</th>
                      <th>Обхват груди, см</th>
                      <th>Обхват талии, см</th>
                      <th>Обхват бёдер, см</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SIZE_TABLE.map((row) => (
                      <tr key={row.size}>
                        <td>{row.size}</td>
                        <td>{row.bust}</td>
                        <td>{row.waist}</td>
                        <td>{row.hips}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

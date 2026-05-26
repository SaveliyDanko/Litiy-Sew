import { Fragment, useCallback, useEffect, useRef, useState } from 'react';

import Footer from '../components/Footer';
import Header from '../components/Header';
import { fetchPortfolioPhotos, type PortfolioPhoto } from '../services/portfolio';
import { fetchPortfolioProjects, type PortfolioProject, type ProjectPhoto } from '../services/portfolioProjects';
import { fetchAllSiteImages, type SiteImage } from '../services/siteImages';
import { fetchAllSiteTexts, type SiteText } from '../services/siteTexts';
import { cachedFetch, getCached } from '../utils/cachedFetch';
import { imgSrcSetProps } from '../utils/imgSrcSet';
import { normalizeMediaSrcSet } from '../utils/mediaUrls';
import { ABOUT_PAGE_DATA } from './aboutData';
import styles from './AboutPage.module.css';

function ProjectPhotoSlider({ photos, coverPhoto, coverSrcSet, coverPosX, coverPosY, coverScale, title }: {
  photos: ProjectPhoto[];
  coverPhoto: string | null;
  coverSrcSet: string | null;
  coverPosX: number;
  coverPosY: number;
  coverScale: number;
  title: string;
}) {
  const allPhotos: Array<{ url: string; srcSet: string | null; posX: number; posY: number; scale: number }> = [];

  if (photos.length > 0) {
    for (const p of photos) {
      allPhotos.push({ url: p.imageUrl, srcSet: p.imageSrcSet, posX: p.positionX, posY: p.positionY, scale: p.scale });
    }
  } else if (coverPhoto) {
    allPhotos.push({ url: coverPhoto, srcSet: coverSrcSet, posX: coverPosX, posY: coverPosY, scale: coverScale });
  }

  const [idx, setIdx] = useState(0);

  const goTo = useCallback((next: number) => {
    setIdx(next);
  }, []);

  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  function handleTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    touchStartXRef.current = t.clientX;
    touchStartYRef.current = t.clientY;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartXRef.current;
    const dy = t.clientY - touchStartYRef.current;
    touchStartXRef.current = null;
    touchStartYRef.current = null;
    // Минимум 40px по горизонтали и угол меньше 30° — иначе это вертикальный скролл
    if (Math.abs(dx) < 40 || Math.abs(dy) > Math.abs(dx)) return;
    if (dx < 0) goTo((idx + 1) % allPhotos.length);
    else        goTo((idx - 1 + allPhotos.length) % allPhotos.length);
  }

  if (allPhotos.length === 0) return null;

  return (
    <div
      className={styles.portfolioPreview}
      onTouchStart={allPhotos.length > 1 ? handleTouchStart : undefined}
      onTouchEnd={allPhotos.length > 1 ? handleTouchEnd : undefined}
    >
      <div
        className={styles.sliderTrack}
        style={{ transform: `translateX(-${idx * 100}%)` }}
      >
        {allPhotos.map((photo, i) => (
          <img
            key={i}
            className={styles.portfolioPreviewImage}
            src={photo.url}
            {...imgSrcSetProps(photo.srcSet, '(min-width: 1024px) 50vw, 100vw')}
            alt={title}
            loading={i === 0 ? 'eager' : 'lazy'}
            style={{
              objectPosition: `${photo.posX}% ${photo.posY}%`,
              transform: `scale(${photo.scale / 100})`,
            }}
          />
        ))}
      </div>
      {allPhotos.length > 1 && (
        <>
          <button
            className={`${styles.sliderArrow} ${styles.sliderArrowPrev}`}
            onClick={() => goTo((idx - 1 + allPhotos.length) % allPhotos.length)}
            aria-label="Предыдущее фото"
          >‹</button>
          <button
            className={`${styles.sliderArrow} ${styles.sliderArrowNext}`}
            onClick={() => goTo((idx + 1) % allPhotos.length)}
            aria-label="Следующее фото"
          >›</button>
          <div className={styles.sliderDots}>
            {allPhotos.map((_, i) => (
              <button
                key={i}
                className={`${styles.sliderDot} ${i === idx ? styles.sliderDotActive : ''}`}
                onClick={() => goTo(i)}
                aria-label={`Фото ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ActiveProjectDetail({
  project,
  detailRef,
}: {
  project: PortfolioProject;
  detailRef: React.RefObject<HTMLElement | null>;
}) {
  const hasMedia = project.photos.length > 0 || !!project.imageUrl;
  return (
    <article
      ref={detailRef}
      className={styles.portfolioDetail}
      id={`portfolio-panel-${project.id}`}
      role="tabpanel"
      aria-labelledby={`portfolio-tab-${project.id}`}
    >
      {hasMedia && (
        <ProjectPhotoSlider
          key={project.id}
          photos={project.photos}
          coverPhoto={project.imageUrl}
          coverSrcSet={project.imageSrcSet}
          coverPosX={project.positionX}
          coverPosY={project.positionY}
          coverScale={project.scale ?? 100}
          title={project.title}
        />
      )}
      <div className={styles.portfolioDetailCopy}>
        {project.eyebrow && <p className={styles.portfolioDetailEyebrow}>{project.eyebrow}</p>}
        <h3 className={styles.portfolioDetailTitle}>{project.title}</h3>
        {project.lead && <p className={styles.portfolioDetailLead}>{project.lead}</p>}
        {project.paragraph1 && <p className={styles.portfolioDetailText}>{project.paragraph1}</p>}
        {project.paragraph2 && <p className={styles.portfolioDetailText}>{project.paragraph2}</p>}
        {project.paragraph3 && <p className={styles.portfolioDetailText}>{project.paragraph3}</p>}
        {project.attachmentsEnabled && project.attachments.length > 0 && (
          <ul className={styles.portfolioAttachments}>
            {project.attachments.map((a) => (
              <li key={a.id}>
                <a
                  href={a.url}
                  className={styles.portfolioAttachmentLink}
                  {...(a.kind === 'LINK'
                    ? { target: '_blank', rel: 'noopener noreferrer' }
                    : { target: '_blank', rel: 'noopener', download: a.label ?? undefined })}
                >
                  <span className={styles.portfolioAttachmentIcon} aria-hidden>
                    {a.kind === 'LINK' ? '↗' : '⬇'}
                  </span>
                  <span className={styles.portfolioAttachmentLabel}>{a.label || a.url}</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}

export default function AboutPage() {
  // Seed state from cache (populated by /api/bootstrap before mount) so first
  // render is non-empty if user already visited the home page.
  const [projects, setProjects] = useState<PortfolioProject[]>(
    () => getCached<PortfolioProject[]>('portfolioProjects') ?? []
  );
  const [projectsLoading, setProjectsLoading] = useState(
    () => getCached<PortfolioProject[]>('portfolioProjects') === undefined
  );
  // На мобайле (<640px) все карточки закрыты по умолчанию,
  // на планшете/десктопе — раскрыта первая.
  const [activeProjectId, setActiveProjectId] = useState<number | null>(() => {
    if (typeof window === 'undefined') return null;
    const isDesktop = window.matchMedia('(min-width: 640px)').matches;
    if (!isDesktop) return null;
    const cached = getCached<PortfolioProject[]>('portfolioProjects');
    return cached && cached.length > 0 ? cached[0].id : null;
  });
  const detailRef = useRef<HTMLElement>(null);
  const [photos, setPhotos] = useState<PortfolioPhoto[]>(
    () => getCached<PortfolioPhoto[]>('portfolioPhotos') ?? []
  );
  const [siteImages, setSiteImages] = useState<Map<string, SiteImage>>(() => {
    const cached = getCached<SiteImage[]>('siteImages');
    return cached ? new Map(cached.map((img) => [img.slotKey, img])) : new Map();
  });
  const [siteTexts, setSiteTexts] = useState<Map<string, string>>(() => {
    const cached = getCached<SiteText[]>('siteTexts');
    return cached ? new Map(cached.map((t) => [t.slotKey, t.value])) : new Map();
  });

  useEffect(() => {
    cachedFetch<PortfolioPhoto[]>('portfolioPhotos', fetchPortfolioPhotos, setPhotos)
      .then(setPhotos).catch(() => {});
    cachedFetch<SiteImage[]>('siteImages', fetchAllSiteImages,
      (list) => setSiteImages(new Map(list.map((img) => [img.slotKey, img]))))
      .then((list) => setSiteImages(new Map(list.map((img) => [img.slotKey, img]))))
      .catch(() => {});
    cachedFetch<SiteText[]>('siteTexts', fetchAllSiteTexts,
      (list) => setSiteTexts(new Map(list.map((t) => [t.slotKey, t.value]))))
      .then((list) => setSiteTexts(new Map(list.map((t) => [t.slotKey, t.value]))))
      .catch(() => {});
    cachedFetch<PortfolioProject[]>('portfolioProjects', fetchPortfolioProjects, (list) => {
      setProjects(list);
      // На десктопе/планшете — открыть первую карточку,
      // если пользователь ещё не выбрал другую. На мобайле всё закрыто.
      if (list.length > 0 && window.matchMedia('(min-width: 640px)').matches) {
        setActiveProjectId((prev) => prev ?? list[0].id);
      }
    })
      .then((list) => {
        setProjects(list);
        if (list.length > 0 && window.matchMedia('(min-width: 640px)').matches) {
          setActiveProjectId((prev) => prev ?? list[0].id);
        }
      })
      .catch(() => {})
      .finally(() => setProjectsLoading(false));
  }, []);

  const activePortfolio = projects.find((p) => p.id === activeProjectId) ?? null;

  function imgStyle(slotKey: string): React.CSSProperties {
    const si = siteImages.get(slotKey);
    if (!si) return {};
    return {
      objectPosition: `${si.positionX}% ${si.positionY}%`,
      transform: `scale(${(si.scale ?? 100) / 100})`,
    };
  }

  function slotSrcSet(slotKey: string, sizes = '100vw') {
    return imgSrcSetProps(siteImages.get(slotKey)?.imageSrcSet, sizes);
  }

  return (
    <>
      <Header />

      <main className={styles.page}>
        <section
          className={styles.hero}
          style={(() => {
            const desk = siteImages.get('about-hero');
            const mob = siteImages.get('about-hero-mobile');
            return {
              ...(desk ? {
                '--hero-desk-pos-x': `${desk.positionX}%`,
                '--hero-desk-pos-y': `${desk.positionY}%`,
                '--hero-desk-scale': `${(desk.scale ?? 100) / 100}`,
              } : {}),
              ...(mob ? {
                '--hero-mobile-pos-x': `${mob.positionX}%`,
                '--hero-mobile-pos-y': `${mob.positionY}%`,
                '--hero-mobile-scale': `${(mob.scale ?? 100) / 100}`,
              } : {}),
            } as React.CSSProperties;
          })()}
        >
          {siteImages.get('about-hero') && (
            <picture>
              {siteImages.get('about-hero-mobile') && (
                <source
                  media="(max-width: 639px)"
                  srcSet={normalizeMediaSrcSet(siteImages.get('about-hero-mobile')!.imageSrcSet ?? siteImages.get('about-hero-mobile')!.imageUrl)}
                  sizes="100vw"
                />
              )}
              <img
                className={styles.heroImage}
                src={siteImages.get('about-hero')!.imageUrl}
                {...slotSrcSet('about-hero', '100vw')}
                alt={ABOUT_PAGE_DATA.hero.imageAlt}
                fetchPriority="high"
              />
            </picture>
          )}
          <div className={styles.heroOverlay} />
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>{ABOUT_PAGE_DATA.hero.title}</h1>
          </div>
        </section>

        <section className={styles.story}>
          {siteImages.get('about-portrait') && (
            <div className={styles.storyFigure}>
              <img
                className={styles.storyImage}
                src={siteImages.get('about-portrait')!.imageUrl}
                {...slotSrcSet('about-portrait', '(min-width: 1024px) 40vw, 100vw')}
                alt={ABOUT_PAGE_DATA.story.imageAlt}
                loading="lazy"
                style={imgStyle('about-portrait')}
              />
            </div>
          )}

          <div className={styles.storyCopy}>
            {ABOUT_PAGE_DATA.story.paragraphs.map((fallback, i) => {
              const text = siteTexts.get(`about-story-p${i + 1}`) ?? fallback;
              return <p key={i}>{text}</p>;
            })}
          </div>
        </section>

        <section className={styles.portfolio}>
          <div className={styles.sectionHeading}>
            <p className={styles.sectionEyebrow}>{ABOUT_PAGE_DATA.portfolio.eyebrow}</p>
            <h2 className={styles.sectionTitle}>{ABOUT_PAGE_DATA.portfolio.title}</h2>
          </div>

          <div
            className={styles.portfolioCards}
            role="tablist"
            aria-label={ABOUT_PAGE_DATA.portfolio.tablistLabel}
          >
            {projectsLoading && Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={styles.portfolioCardSkeleton} aria-hidden="true" />
            ))}
            {projects.map((item) => {
              const isActive = item.id === activeProjectId;

              return (
                <Fragment key={item.id}>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`portfolio-panel-${item.id}`}
                    id={`portfolio-tab-${item.id}`}
                    className={`${styles.portfolioCard} ${isActive ? styles.portfolioCardActive : ''}`}
                    onClick={() => {
                      setActiveProjectId(item.id);
                      if (window.innerWidth < 900) {
                        setTimeout(() => {
                          detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }, 50);
                      }
                    }}
                  >
                    <span className={styles.portfolioCardEyebrow}>{item.eyebrow}</span>
                    <span className={styles.portfolioCardTitle}>{item.title}</span>
                    <span className={styles.portfolioCardMeta}>{item.meta}</span>
                  </button>

                  {isActive && activePortfolio && (
                    <ActiveProjectDetail
                      project={activePortfolio}
                      detailRef={detailRef}
                    />
                  )}
                </Fragment>
              );
            })}
          </div>
        </section>
        {photos.length > 0 && (
          <section className={styles.gallery}>
            <div className={styles.sectionHeading}>
              <p className={styles.sectionEyebrow}>Работы</p>
              <h2 className={styles.sectionTitle}>Gallery</h2>
            </div>
            <div className={styles.galleryGrid}>
              {photos.map((photo) => (
                <div key={photo.id} className={styles.galleryItem}>
                  <img
                    src={photo.photoUrl}
                    {...imgSrcSetProps(photo.photoSrcSet, '(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw')}
                    alt={photo.caption ?? ''}
                    className={styles.galleryImg}
                    loading="lazy"
                    style={{ objectPosition: `${photo.positionX}% ${photo.positionY}%`, transform: `scale(${(photo.scale ?? 100) / 100})` }}
                  />
                  {photo.caption && <p className={styles.galleryCaption}>{photo.caption}</p>}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}

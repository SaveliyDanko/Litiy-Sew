import { Fragment, useCallback, useEffect, useRef, useState } from 'react';

import Footer from '../components/Footer';
import Header from '../components/Header';
import { fetchPortfolioPhotos, type PortfolioPhoto } from '../services/portfolio';
import { fetchPortfolioProjects, type PortfolioProject, type ProjectPhoto } from '../services/portfolioProjects';
import { fetchAllSiteImages, type SiteImage } from '../services/siteImages';
import { imgSrcSetProps } from '../utils/imgSrcSet';
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
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = useCallback((next: number) => {
    setIdx(next);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setIdx((i) => (i + 1) % allPhotos.length);
    }, 4000);
  }, [allPhotos.length]);

  useEffect(() => {
    setIdx(0);
    if (allPhotos.length <= 1) return;
    timerRef.current = setTimeout(() => setIdx(1), 4000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [photos, coverPhoto]); // eslint-disable-line react-hooks/exhaustive-deps

  if (allPhotos.length === 0) return null;

  const current = allPhotos[idx] ?? allPhotos[0];

  return (
    <div className={styles.portfolioPreview}>
      <img
        key={current.url}
        className={styles.portfolioPreviewImage}
        src={current.url}
        {...imgSrcSetProps(current.srcSet, '(min-width: 1024px) 50vw, 100vw')}
        alt={title}
        loading="lazy"
        style={{
          objectPosition: `${current.posX}% ${current.posY}%`,
          transform: `scale(${current.scale / 100})`,
        }}
      />
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
      </div>
    </article>
  );
}

export default function AboutPage() {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<number | null>(null);
  const detailRef = useRef<HTMLElement>(null);
  const [photos, setPhotos] = useState<PortfolioPhoto[]>([]);
  const [siteImages, setSiteImages] = useState<Map<string, SiteImage>>(new Map());

  useEffect(() => {
    fetchPortfolioPhotos().then(setPhotos).catch(() => {});
    fetchAllSiteImages()
      .then((list) => setSiteImages(new Map(list.map((img) => [img.slotKey, img]))))
      .catch(() => {});
    fetchPortfolioProjects()
      .then((list) => {
        setProjects(list);
        if (list.length > 0) setActiveProjectId(list[0].id);
      })
      .catch(() => {});
  }, []);

  const activePortfolio = projects.find((p) => p.id === activeProjectId) ?? null;

  function imgUrl(slotKey: string, fallback: string) {
    const si = siteImages.get(slotKey);
    return si ? si.imageUrl : fallback;
  }

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
          <picture>
            {siteImages.get('about-hero-mobile') && (
              <source
                media="(max-width: 639px)"
                srcSet={siteImages.get('about-hero-mobile')!.imageSrcSet ?? siteImages.get('about-hero-mobile')!.imageUrl}
                sizes="100vw"
              />
            )}
            <img
              className={styles.heroImage}
              src={imgUrl('about-hero', ABOUT_PAGE_DATA.hero.imageUrl)}
              {...slotSrcSet('about-hero', '100vw')}
              alt={ABOUT_PAGE_DATA.hero.imageAlt}
              fetchPriority="high"
            />
          </picture>
          <div className={styles.heroOverlay} />
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>{ABOUT_PAGE_DATA.hero.title}</h1>
          </div>
        </section>

        <section className={styles.story}>
          <div className={styles.storyFigure}>
            <img
              className={styles.storyImage}
              src={imgUrl('about-portrait', ABOUT_PAGE_DATA.story.imageUrl)}
              {...slotSrcSet('about-portrait', '(min-width: 1024px) 40vw, 100vw')}
              alt={ABOUT_PAGE_DATA.story.imageAlt}
              loading="lazy"
              style={imgStyle('about-portrait')}
            />
          </div>

          <div className={styles.storyCopy}>
            {ABOUT_PAGE_DATA.story.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
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

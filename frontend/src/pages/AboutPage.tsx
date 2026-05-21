import { Fragment, useEffect, useRef, useState } from 'react';

import Footer from '../components/Footer';
import Header from '../components/Header';
import { fetchPortfolioPhotos, type PortfolioPhoto } from '../services/portfolio';
import { fetchAllSiteImages, type SiteImage } from '../services/siteImages';
import { ABOUT_PAGE_DATA, PORTFOLIO_ITEMS } from './aboutData';
import styles from './AboutPage.module.css';

const PORTFOLIO_SLOT_KEYS: Record<string, string> = {
  problonde:     'portfolio-problonde',
  melon:         'portfolio-melon',
  'spring-breath': 'portfolio-spring',
  'zigzag-diplom': 'portfolio-zigzag',
  'prize-diploma': 'portfolio-prize',
  diplom:        'portfolio-diplom',
};

export default function AboutPage() {
  const [activePortfolioId, setActivePortfolioId] = useState(PORTFOLIO_ITEMS[0].id);
  const activePortfolio = PORTFOLIO_ITEMS.find((item) => item.id === activePortfolioId) ?? PORTFOLIO_ITEMS[0];
  const detailRef = useRef<HTMLElement>(null);
  const [photos, setPhotos] = useState<PortfolioPhoto[]>([]);
  const [siteImages, setSiteImages] = useState<Map<string, SiteImage>>(new Map());

  useEffect(() => {
    fetchPortfolioPhotos().then(setPhotos).catch(() => {});
    fetchAllSiteImages()
      .then((list) => setSiteImages(new Map(list.map((img) => [img.slotKey, img]))))
      .catch(() => {});
  }, []);

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
                srcSet={siteImages.get('about-hero-mobile')!.imageUrl}
              />
            )}
            <img
              className={styles.heroImage}
              src={imgUrl('about-hero', ABOUT_PAGE_DATA.hero.imageUrl)}
              alt={ABOUT_PAGE_DATA.hero.imageAlt}
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
              alt={ABOUT_PAGE_DATA.story.imageAlt}
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
            {PORTFOLIO_ITEMS.map((item) => {
              const isActive = item.id === activePortfolio.id;

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
                      setActivePortfolioId(item.id);
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

                  {isActive && (
                    <article
                      ref={detailRef}
                      className={styles.portfolioDetail}
                      id={`portfolio-panel-${activePortfolio.id}`}
                      role="tabpanel"
                      aria-labelledby={`portfolio-tab-${activePortfolio.id}`}
                    >
                      <div className={styles.portfolioPreview}>
                        <img
                          className={styles.portfolioPreviewImage}
                          src={imgUrl(PORTFOLIO_SLOT_KEYS[activePortfolio.id] ?? '', activePortfolio.imageUrl)}
                          alt={activePortfolio.imageAlt}
                          style={imgStyle(PORTFOLIO_SLOT_KEYS[activePortfolio.id] ?? '')}
                        />
                      </div>

                      <div className={styles.portfolioDetailCopy}>
                        <p className={styles.portfolioDetailEyebrow}>{activePortfolio.eyebrow}</p>
                        <h3 className={styles.portfolioDetailTitle}>{activePortfolio.title}</h3>
                        <p className={styles.portfolioDetailLead}>{activePortfolio.lead}</p>
                        {activePortfolio.paragraphs.map((paragraph) => (
                          <p key={paragraph} className={styles.portfolioDetailText}>{paragraph}</p>
                        ))}
                      </div>
                    </article>
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
                    alt={photo.caption ?? ''}
                    className={styles.galleryImg}
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

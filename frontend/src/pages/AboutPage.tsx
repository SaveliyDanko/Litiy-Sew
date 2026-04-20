import { Fragment, useState } from 'react';

import Footer from '../components/Footer';
import Header from '../components/Header';
import { ABOUT_PAGE_DATA, PORTFOLIO_ITEMS } from './aboutData';
import styles from './AboutPage.module.css';

export default function AboutPage() {
  const [activePortfolioId, setActivePortfolioId] = useState(PORTFOLIO_ITEMS[0].id);
  const activePortfolio = PORTFOLIO_ITEMS.find((item) => item.id === activePortfolioId) ?? PORTFOLIO_ITEMS[0];

  return (
    <>
      <Header />

      <main className={styles.page}>
        <section className={styles.hero}>
          <img
            className={styles.heroImage}
            src={ABOUT_PAGE_DATA.hero.imageUrl}
            alt={ABOUT_PAGE_DATA.hero.imageAlt}
          />
          <div className={styles.heroOverlay} />
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>{ABOUT_PAGE_DATA.hero.title}</h1>
          </div>
        </section>

        <section className={styles.story}>
          <div className={styles.storyFigure}>
            <img
              className={styles.storyImage}
              src={ABOUT_PAGE_DATA.story.imageUrl}
              alt={ABOUT_PAGE_DATA.story.imageAlt}
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
                    onClick={() => setActivePortfolioId(item.id)}
                  >
                    <span className={styles.portfolioCardEyebrow}>{item.eyebrow}</span>
                    <span className={styles.portfolioCardTitle}>{item.title}</span>
                    <span className={styles.portfolioCardMeta}>{item.meta}</span>
                  </button>

                  {isActive && (
                    <article
                      className={styles.portfolioDetail}
                      id={`portfolio-panel-${activePortfolio.id}`}
                      role="tabpanel"
                      aria-labelledby={`portfolio-tab-${activePortfolio.id}`}
                    >
                      <div className={styles.portfolioPreview}>
                        <img
                          className={styles.portfolioPreviewImage}
                          src={activePortfolio.imageUrl}
                          alt={activePortfolio.imageAlt}
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
      </main>

      <Footer />
    </>
  );
}

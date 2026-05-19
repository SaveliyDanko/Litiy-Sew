import { useEffect, useState } from 'react';

import Footer from '../components/Footer';
import Header from '../components/Header';
import { fetchPortfolioPhotos, type PortfolioPhoto } from '../services/portfolio';
import { fetchAllSiteImages, type SiteImage } from '../services/siteImages';
import styles from './PortfolioPage.module.css';

export default function PortfolioPage() {
  const [photos, setPhotos] = useState<PortfolioPhoto[]>([]);
  const [siteImages, setSiteImages] = useState<Map<string, SiteImage>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchPortfolioPhotos(),
      fetchAllSiteImages(),
    ]).then(([photoList, imageList]) => {
      setPhotos(photoList);
      setSiteImages(new Map(imageList.map((img) => [img.slotKey, img])));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const hero = siteImages.get('portfolio-hero');

  return (
    <>
      <Header />

      <main className={styles.page}>

        <section
          className={styles.hero}
          style={hero ? ({
            '--portfolio-hero-offset-x': `${hero.positionX}%`,
            '--portfolio-hero-offset-y': `${hero.positionY}%`,
          } as React.CSSProperties) : undefined}
        >
          {hero ? (
            <img
              className={styles.heroImage}
              src={hero.imageUrl}
              alt="Portfolio"
            />
          ) : (
            <div className={styles.heroPlaceholder} />
          )}
          <div className={styles.heroOverlay} />
          <div className={styles.heroContent}>
            <p className={styles.heroEyebrow}>Избранные работы</p>
            <h1 className={styles.heroTitle}>Portfolio</h1>
          </div>
        </section>

        {loading ? (
          <div className={styles.loadingState} />
        ) : photos.length === 0 ? (
          <section className={styles.empty}>
            <p className={styles.emptyText}>Фотографии пока не добавлены</p>
          </section>
        ) : (
          <section className={styles.gallery}>
            <div className={styles.galleryGrid}>
              {photos.map((photo) => (
                <div key={photo.id} className={styles.galleryItem}>
                  <img
                    className={styles.galleryImage}
                    src={photo.photoUrl}
                    alt={photo.caption ?? ''}
                    loading="lazy"
                  />
                  {photo.caption && (
                    <p className={styles.galleryCaption}>{photo.caption}</p>
                  )}
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

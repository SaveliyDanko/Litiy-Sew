import React, { useEffect, useState } from 'react';

import Footer from '../components/Footer';
import Header from '../components/Header';
import Lightbox from '../components/Lightbox';
import { fetchCollections, type DynamicCollection } from '../services/collections';
import { cachedFetch, getCached } from '../utils/cachedFetch';
import { imgSrcSetProps } from '../utils/imgSrcSet';
import { responsivePhotoStyle } from '../utils/photoStyles';
import { getCollectionHref } from './collectionsData';
import styles from './CollectionsPage.module.css';

function cardPhoto(c: DynamicCollection) {
  return c.photos.find((p) => p.photoType === 'CARD') ?? c.photos[0] ?? null;
}

function CollectionCard({
  collection,
  onLightbox,
}: {
  collection: DynamicCollection;
  onLightbox?: (c: DynamicCollection) => void;
}) {
  const photo = cardPhoto(collection);
  const isLightbox = collection.category === 'SKETCH' && photo;

  const inner = (
    <article className={styles.card} data-tone={collection.tone} data-category={collection.category}>
      <div
        className={styles.cardMedia}
        style={{
          ...(collection.cardHeightMobile != null ? { '--card-h-mobile': `${collection.cardHeightMobile}px` } as React.CSSProperties : {}),
          ...(collection.cardHeightDesktop != null ? { '--card-h-desktop': `${collection.cardHeightDesktop}px` } as React.CSSProperties : {}),
        }}
      >
        {collection.eyebrow && (
          <div className={styles.cardBadge}>{collection.eyebrow}</div>
        )}
        {photo ? (
          <img
            className={`${styles.cardImage} responsivePhoto`}
            src={photo.imageUrl}
            {...imgSrcSetProps(photo.imageSrcSet, '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw')}
            alt={collection.title}
            loading="lazy"
            style={responsivePhotoStyle(photo)}
          />
        ) : (
          <div className={styles.cardPlaceholder} />
        )}
        <div className={styles.cardOverlay} />
      </div>

      {!collection.hideCardLabel && (
        <div className={styles.cardBody}>
          <p className={styles.cardSubtitle}>{collection.subtitle ?? ''}</p>
          <h3 className={styles.cardTitle}>{collection.title}</h3>
          <p className={styles.cardDescription}>{collection.description ?? ''}</p>
        </div>
      )}
    </article>
  );

  if (isLightbox && onLightbox) {
    return (
      <button
        type="button"
        className={`${styles.cardLink} ${styles.cardLinkButton}`}
        aria-label={`Открыть эскиз ${collection.title}`}
        onClick={() => onLightbox(collection)}
      >
        {inner}
      </button>
    );
  }

  return (
    <a
      href={getCollectionHref(collection.slug)}
      className={styles.cardLink}
      aria-label={`Открыть коллекцию ${collection.title}`}
    >
      {inner}
    </a>
  );
}

function CollectionGroup({ title, collections, onLightbox }: {
  title: string;
  collections: DynamicCollection[];
  onLightbox?: (c: DynamicCollection) => void;
}) {
  if (collections.length === 0) return null;
  return (
    <section className={styles.group}>
      {title && (
        <div className={styles.groupHeading}>
          <h2 className={styles.groupTitle}>{title}:</h2>
        </div>
      )}
      <div className={styles.soloGrid}>
        {collections.map((c) => (
          <CollectionCard
            key={c.slug}
            collection={c}
            onLightbox={onLightbox}
          />
        ))}
      </div>
    </section>
  );
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<DynamicCollection[]>(() => getCached<DynamicCollection[]>('collections') ?? []);
  const [loading, setLoading] = useState(() => getCached<DynamicCollection[]>('collections') === undefined);
  const [lightboxOf, setLightboxOf] = useState<DynamicCollection | null>(null);

  useEffect(() => {
    cachedFetch<DynamicCollection[]>('collections', fetchCollections, setCollections)
      .then(setCollections)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const lightboxPhoto = lightboxOf ? cardPhoto(lightboxOf) : null;

  if (loading) {
    return (
      <>
        <Header />
        <main className={styles.page} />
        <Footer />
      </>
    );
  }

  const featured = collections.find((c) => c.featured) ?? collections.find((c) => c.category === 'COLLECTION') ?? null;
  const featuredCard = featured ? cardPhoto(featured) : null;

  const soloList = collections.filter((c) => c.category === 'SOLO');
  const sketchList = collections.filter((c) => c.category === 'SKETCH');
  // COLLECTION category cards (excluding the featured one)
  const collectionList = collections.filter((c) => c.category === 'COLLECTION' && c !== featured);

  const hasAnyGroups = soloList.length > 0 || sketchList.length > 0 || collectionList.length > 0;

  if (!featured && !hasAnyGroups) {
    return (
      <>
        <Header />
        <main className={styles.page}>
          <section className={styles.featured}>
            <div className={styles.featuredCopy}>
              <h1 className={styles.featuredTitle}>Коллекции</h1>
              <p className={styles.featuredSubtitle}>Коллекции пока не добавлены</p>
            </div>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <main className={styles.page}>
        {featured && (
          <section className={styles.featured}>
            <a
              href={getCollectionHref(featured.slug)}
              className={styles.featuredMedia}
              aria-label={`Открыть коллекцию ${featured.title}`}
            >
              {featuredCard ? (
                <img
                  className={`${styles.featuredImage} responsivePhoto`}
                  src={featuredCard.imageUrl}
                  {...imgSrcSetProps(featuredCard.imageSrcSet, '100vw')}
                  alt={featured.title}
                  fetchPriority="high"
                  style={responsivePhotoStyle(featuredCard)}
                />
              ) : (
                <div className={styles.featuredPlaceholder} />
              )}
            </a>

            <div className={styles.featuredCopy}>
              <p className={styles.featuredEyebrow}>{featured.eyebrow ?? ''}</p>
              <h1 className={styles.featuredTitle}>{featured.title}</h1>
              <p className={styles.featuredSubtitle}>{featured.subtitle ?? ''}</p>
              <p className={styles.featuredDescription}>{featured.description ?? ''}</p>
            </div>
          </section>
        )}

        {collectionList.length > 0 && (
          <CollectionGroup title="Коллекции" collections={collectionList} />
        )}

        <CollectionGroup title={soloList[0]?.groupTitle ?? 'Одиночные модели'} collections={soloList} />
        <CollectionGroup
          title={sketchList[0]?.groupTitle ?? 'Эскизные проекты'}
          collections={sketchList}
          onLightbox={setLightboxOf}
        />
      </main>

      <Footer />

      {lightboxOf && lightboxPhoto && (
        <Lightbox
          src={lightboxPhoto.imageUrl}
          srcSet={lightboxPhoto.imageSrcSet}
          alt={lightboxOf.title}
          onClose={() => setLightboxOf(null)}
        />
      )}
    </>
  );
}

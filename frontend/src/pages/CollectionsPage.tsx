import { useEffect, useState } from 'react';

import Footer from '../components/Footer';
import Header from '../components/Header';
import { fetchCollectionsMeta, type CollectionMeta } from '../services/admin';
import { fetchCollections, type DynamicCollection } from '../services/collections';
import { fetchAllSiteImages, type SiteImage } from '../services/siteImages';
import {
  ALL_COLLECTIONS,
  FEATURED_COLLECTION,
  getCollectionHref,
} from './collectionsData';
import styles from './CollectionsPage.module.css';

export default function CollectionsPage() {
  const [siteImages, setSiteImages] = useState<Map<string, SiteImage>>(new Map());
  const [metas, setMetas] = useState<Record<string, CollectionMeta>>({});
  const [dynamicCollections, setDynamicCollections] = useState<DynamicCollection[]>([]);

  useEffect(() => {
    fetchAllSiteImages()
      .then((list) => setSiteImages(new Map(list.map((img) => [img.slotKey, img]))))
      .catch(() => {});
    fetchCollectionsMeta().then(setMetas).catch(() => {});
    fetchCollections().then(setDynamicCollections).catch(() => {});
  }, []);

  // Slugs that have a dynamic collection override
  const dynamicSlugs = new Set(dynamicCollections.map((c) => c.slug));

  function collectionTitle(slug: string, fallback: string) {
    return metas[slug]?.title ?? fallback;
  }
  function collectionSubtitle(slug: string, fallback: string) {
    return metas[slug]?.subtitle ?? fallback;
  }

  function imgUrl(slotKey: string) {
    return siteImages.get(slotKey)?.imageUrl ?? null;
  }

  function imgStyle(slotKey: string): React.CSSProperties {
    const si = siteImages.get(slotKey);
    return si ? { objectPosition: `${si.positionX}% ${si.positionY}%` } : {};
  }

  // For a dynamic collection, get the CARD photo (first one of type CARD)
  function dynCardPhoto(c: DynamicCollection) {
    return c.photos.find((p) => p.photoType === 'CARD') ?? c.photos[0] ?? null;
  }

  // Featured: prefer dynamic version, else static
  const dynamicFeatured = dynamicCollections.find((c) => c.featured) ?? dynamicCollections.find((c) => c.slug === FEATURED_COLLECTION.slug);
  const staticFeatured = FEATURED_COLLECTION;

  const featuredUrl = dynamicFeatured
    ? dynCardPhoto(dynamicFeatured)?.imageUrl ?? null
    : imgUrl(staticFeatured.cardSlotKey);

  const featuredStyle: React.CSSProperties = dynamicFeatured
    ? (() => {
        const p = dynCardPhoto(dynamicFeatured);
        return p ? { objectPosition: `${p.positionX}% ${p.positionY}%` } : {};
      })()
    : imgStyle(staticFeatured.cardSlotKey);

  const featuredTitle = dynamicFeatured
    ? dynamicFeatured.title
    : collectionTitle(staticFeatured.slug, staticFeatured.title);

  const featuredSubtitle = dynamicFeatured
    ? (dynamicFeatured.subtitle ?? '')
    : collectionSubtitle(staticFeatured.slug, staticFeatured.subtitle);

  const featuredSlug = dynamicFeatured ? dynamicFeatured.slug : staticFeatured.slug;
  const featuredEyebrow = dynamicFeatured ? (dynamicFeatured.eyebrow ?? '') : staticFeatured.eyebrow;
  const featuredDescription = dynamicFeatured ? (dynamicFeatured.description ?? '') : staticFeatured.description;

  // Solo collections: dynamic (non-featured) first, then static (not overridden by dynamic, not the featured one)
  const dynamicSolo = dynamicCollections.filter((c) => c !== dynamicFeatured);
  const staticSolo = ALL_COLLECTIONS.filter(
    (c) => c.slug !== staticFeatured.slug && !dynamicSlugs.has(c.slug)
  );

  return (
    <>
      <Header />

      <main className={styles.page}>
        <section className={styles.featured}>
          <a
            href={getCollectionHref(featuredSlug)}
            className={styles.featuredMedia}
            aria-label={`Открыть коллекцию ${featuredTitle}`}
          >
            {featuredUrl ? (
              <img
                className={styles.featuredImage}
                src={featuredUrl}
                alt={featuredTitle}
                style={featuredStyle}
              />
            ) : (
              <div className={styles.featuredPlaceholder} />
            )}
          </a>

          <div className={styles.featuredCopy}>
            <p className={styles.featuredEyebrow}>{featuredEyebrow}</p>
            <h1 className={styles.featuredTitle}>{featuredTitle}</h1>
            <p className={styles.featuredSubtitle}>{featuredSubtitle}</p>
            <p className={styles.featuredDescription}>{featuredDescription}</p>
          </div>
        </section>

        {(dynamicSolo.length > 0 || staticSolo.length > 0) && (
          <section className={styles.solo}>
            <div className={styles.soloHeading}>
              <p className={styles.soloEyebrow}>Подборка образов</p>
              <h2 className={styles.soloTitle}>Одиночные модели:</h2>
            </div>

            <div className={styles.soloGrid}>
              {/* Dynamic solo collections */}
              {dynamicSolo.map((collection, index) => {
                const cardPhoto = dynCardPhoto(collection);
                return (
                  <a
                    key={collection.slug}
                    href={getCollectionHref(collection.slug)}
                    className={styles.cardLink}
                    aria-label={`Открыть коллекцию ${collection.title}`}
                  >
                    <article className={styles.card} data-tone={collection.tone}>
                      <div className={styles.cardMedia}>
                        <div className={styles.cardBadge}>Look {String(index + 1).padStart(2, '0')}</div>
                        {cardPhoto ? (
                          <img
                            className={styles.cardImage}
                            src={cardPhoto.imageUrl}
                            alt={collection.title}
                            style={{ objectPosition: `${cardPhoto.positionX}% ${cardPhoto.positionY}%` }}
                          />
                        ) : (
                          <div className={styles.cardPlaceholder} />
                        )}
                        <div className={styles.cardOverlay} />
                      </div>

                      <div className={styles.cardBody}>
                        <p className={styles.cardSubtitle}>{collection.subtitle ?? ''}</p>
                        <h3 className={styles.cardTitle}>{collection.title}</h3>
                        <p className={styles.cardDescription}>{collection.description ?? ''}</p>
                      </div>
                    </article>
                  </a>
                );
              })}

              {/* Static solo collections not overridden by dynamic */}
              {staticSolo.map((collection, index) => {
                const cardUrl = imgUrl(collection.cardSlotKey);
                return (
                  <a
                    key={collection.slug}
                    href={getCollectionHref(collection.slug)}
                    className={styles.cardLink}
                    aria-label={`Открыть коллекцию ${collection.title}`}
                  >
                    <article className={styles.card} data-tone={collection.tone}>
                      <div className={styles.cardMedia}>
                        <div className={styles.cardBadge}>
                          Look {String(dynamicSolo.length + index + 1).padStart(2, '0')}
                        </div>
                        {cardUrl ? (
                          <img
                            className={styles.cardImage}
                            src={cardUrl}
                            alt={collection.title}
                            style={imgStyle(collection.cardSlotKey)}
                          />
                        ) : (
                          <div className={styles.cardPlaceholder} />
                        )}
                        <div className={styles.cardOverlay} />
                      </div>

                      <div className={styles.cardBody}>
                        <p className={styles.cardSubtitle}>{collectionSubtitle(collection.slug, collection.subtitle)}</p>
                        <h3 className={styles.cardTitle}>{collectionTitle(collection.slug, collection.title)}</h3>
                        <p className={styles.cardDescription}>{collection.description}</p>
                      </div>
                    </article>
                  </a>
                );
              })}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}

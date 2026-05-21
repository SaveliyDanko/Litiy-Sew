import { useEffect, useState } from 'react';

import Footer from '../components/Footer';
import Header from '../components/Header';
import { fetchCollections, type DynamicCollection } from '../services/collections';
import { getCollectionHref } from './collectionsData';
import styles from './CollectionsPage.module.css';

function cardPhoto(c: DynamicCollection) {
  return c.photos.find((p) => p.photoType === 'CARD') ?? c.photos[0] ?? null;
}

function CollectionCard({ collection, globalIndex: _globalIndex }: { collection: DynamicCollection; globalIndex: number }) {
  const photo = cardPhoto(collection);
  return (
    <a
      href={getCollectionHref(collection.slug)}
      className={styles.cardLink}
      aria-label={`Открыть коллекцию ${collection.title}`}
    >
      <article className={styles.card} data-tone={collection.tone}>
        <div className={styles.cardMedia}>
          {collection.eyebrow && (
            <div className={styles.cardBadge}>{collection.eyebrow}</div>
          )}
          {photo ? (
            <img
              className={styles.cardImage}
              src={photo.imageUrl}
              alt={collection.title}
              loading="lazy"
              style={{ objectPosition: `${photo.positionX}% ${photo.positionY}%`, transform: `scale(${(photo.scale ?? 100) / 100})` }}
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
}

function CollectionGroup({ title, collections, allCollections }: {
  title: string;
  collections: DynamicCollection[];
  allCollections: DynamicCollection[];
}) {
  if (collections.length === 0) return null;
  return (
    <section className={styles.group}>
      <div className={styles.groupHeading}>
        <h2 className={styles.groupTitle}>{title}:</h2>
      </div>
      <div className={styles.soloGrid}>
        {collections.map((c) => (
          <CollectionCard key={c.slug} collection={c} globalIndex={allCollections.indexOf(c)} />
        ))}
      </div>
    </section>
  );
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<DynamicCollection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCollections()
      .then(setCollections)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
                  className={styles.featuredImage}
                  src={featuredCard.imageUrl}
                  alt={featured.title}
                  fetchPriority="high"
                  style={{ objectPosition: `${featuredCard.positionX}% ${featuredCard.positionY}%`, transform: `scale(${(featuredCard.scale ?? 100) / 100})` }}
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
          <CollectionGroup title="Коллекции" collections={collectionList} allCollections={collections} />
        )}

        <CollectionGroup title="Одиночные модели" collections={soloList} allCollections={collections} />
        <CollectionGroup title="Эскизные проекты" collections={sketchList} allCollections={collections} />
      </main>

      <Footer />
    </>
  );
}

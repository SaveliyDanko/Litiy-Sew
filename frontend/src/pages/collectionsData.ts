export const COLLECTIONS_MEDIA_BASE_URL = 'http://localhost:9000/litiy-sew-media';

export type CollectionTone = 'warm' | 'cool' | 'neutral';

export type CollectionEntry = {
  slug: string;
  title: string;
  eyebrow: string;
  subtitle: string;
  description: string;
  tone: CollectionTone;
  imagePath: string;
  detailIntro: string;
  detailFocus: string;
  detailHeroImagePath: string;
  detailGalleryImagePaths: [string, string, string, string];
};

export const FEATURED_COLLECTION: CollectionEntry = {
  slug: 'the-glow-of-love',
  title: 'The glow of love',
  eyebrow: 'Featured collection',
  subtitle: 'История о самом нежном дне',
  description:
    'Капсула о деликатности, свете и ощущении близости, где формы остаются мягкими, а настроение собирается из деталей, фактуры и воздуха между линиями.',
  tone: 'neutral',
  imagePath: 'collections/the-glow-of-love-placeholder.jpg',
  detailIntro:
    'Основная идея коллекции заключается в том, что современная свадебная одежда всё больше сближается с повседневной эстетикой.',
  detailFocus: 'Главный акцент — лаконичные формы',
  detailHeroImagePath: 'collections/details/the-glow-of-love-hero-placeholder.jpg',
  detailGalleryImagePaths: [
    'collections/details/the-glow-of-love-look-1-placeholder.jpg',
    'collections/details/the-glow-of-love-look-2-placeholder.jpg',
    'collections/details/the-glow-of-love-look-3-placeholder.jpg',
    'collections/details/the-glow-of-love-look-4-placeholder.jpg',
  ],
};

export const SOLO_COLLECTIONS: CollectionEntry[] = [
  {
    slug: 'queen-of-hearts',
    title: 'Queen of Hearts',
    eyebrow: 'Look 01',
    subtitle: 'Театральный силуэт',
    description: 'Объёмная форма, декоративность и игра с образом как самостоятельным высказыванием.',
    tone: 'warm',
    imagePath: 'collections/queen-of-hearts-placeholder.jpg',
    detailIntro:
      'Образ строится на контрасте драматичной декоративности и чёткой, почти сценической собранности силуэта.',
    detailFocus: 'Главный акцент — корсетная линия и выразительный объём',
    detailHeroImagePath: 'collections/details/look-1/queen-of-hearts-hero-placeholder.jpg',
    detailGalleryImagePaths: [
      'collections/details/look-1/queen-of-hearts-look-1-placeholder.jpg',
      'collections/details/look-1/queen-of-hearts-look-2-placeholder.jpg',
      'collections/details/look-1/queen-of-hearts-look-3-placeholder.jpg',
      'collections/details/look-1/queen-of-hearts-look-4-placeholder.jpg',
    ],
  },
  {
    slug: 'blue-reverie',
    title: 'Blue Reverie',
    eyebrow: 'Look 02',
    subtitle: 'Воздух и пластика',
    description: 'Лёгкая фактура, мягкий вертикальный ритм и деликатный акцент на линии плеч и шеи.',
    tone: 'cool',
    imagePath: 'collections/blue-reverie-placeholder.jpg',
    detailIntro:
      'Этот образ держится на ощущении воздуха, световой прозрачности и спокойной вертикали, собранной вокруг плечевого пояса.',
    detailFocus: 'Главный акцент — прозрачность материала и мягкий объём',
    detailHeroImagePath: 'collections/details/blue-reverie-hero-placeholder.jpg',
    detailGalleryImagePaths: [
      'collections/details/blue-reverie-look-1-placeholder.jpg',
      'collections/details/blue-reverie-look-2-placeholder.jpg',
      'collections/details/blue-reverie-look-3-placeholder.jpg',
      'collections/details/blue-reverie-look-4-placeholder.jpg',
    ],
  },
  {
    slug: 'ivory-hush',
    title: 'Ivory Hush',
    eyebrow: 'Look 03',
    subtitle: 'Тихая чувственность',
    description: 'Минималистичная композиция, в которой ткань, посадка и поза работают как единый образ.',
    tone: 'neutral',
    imagePath: 'collections/ivory-hush-placeholder.jpg',
    detailIntro:
      'В основе этого образа лежит сдержанная пластика: внимание смещается с декора на посадку, пропорции и текучесть поверхности.',
    detailFocus: 'Главный акцент — чистый силуэт и тактильная фактура',
    detailHeroImagePath: 'collections/details/ivory-hush-hero-placeholder.jpg',
    detailGalleryImagePaths: [
      'collections/details/ivory-hush-look-1-placeholder.jpg',
      'collections/details/ivory-hush-look-2-placeholder.jpg',
      'collections/details/ivory-hush-look-2-placeholder.jpg',
      'collections/details/ivory-hush-look-2-placeholder.jpg',
    ],
  },
];

export const ALL_COLLECTIONS = [FEATURED_COLLECTION, ...SOLO_COLLECTIONS];

export function getCollectionImageUrl(imagePath: string) {
  return `${COLLECTIONS_MEDIA_BASE_URL}/${imagePath}`;
}

export function getCollectionHref(slug: string) {
  return `/collections/${slug}`;
}

export function getCollectionBySlug(slug: string) {
  return ALL_COLLECTIONS.find((collection) => collection.slug === slug);
}

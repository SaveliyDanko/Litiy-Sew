export type CollectionTone = 'warm' | 'cool' | 'neutral';

export type CollectionEntry = {
  slug: string;
  title: string;
  eyebrow: string;
  subtitle: string;
  description: string;
  tone: CollectionTone;
  cardSlotKey: string;
  detailIntro: string;
  detailFocus: string;
  detailHeroSlotKey: string;
  detailGallerySlotKeys: [string, string, string, string];
};

export const FEATURED_COLLECTION: CollectionEntry = {
  slug: 'the-glow-of-love',
  title: 'The glow of love',
  eyebrow: 'Featured collection',
  subtitle: 'История о самом нежном дне',
  description:
    'Капсула о деликатности, свете и ощущении близости, где формы остаются мягкими, а настроение собирается из деталей, фактуры и воздуха между линиями.',
  tone: 'neutral',
  cardSlotKey: 'collection-glow-card',
  detailIntro:
    'Основная идея коллекции заключается в том, что современная свадебная одежда всё больше сближается с повседневной эстетикой.',
  detailFocus: 'Главный акцент — лаконичные формы',
  detailHeroSlotKey: 'collection-glow-hero',
  detailGallerySlotKeys: [
    'collection-glow-look-1',
    'collection-glow-look-2',
    'collection-glow-look-3',
    'collection-glow-look-4',
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
    cardSlotKey: 'collection-hearts-card',
    detailIntro:
      'Образ строится на контрасте драматичной декоративности и чёткой, почти сценической собранности силуэта.',
    detailFocus: 'Главный акцент — корсетная линия и выразительный объём',
    detailHeroSlotKey: 'collection-hearts-hero',
    detailGallerySlotKeys: [
      'collection-hearts-look-1',
      'collection-hearts-look-2',
      'collection-hearts-look-3',
      'collection-hearts-look-4',
    ],
  },
  {
    slug: 'blue-reverie',
    title: 'Blue Reverie',
    eyebrow: 'Look 02',
    subtitle: 'Воздух и пластика',
    description: 'Лёгкая фактура, мягкий вертикальный ритм и деликатный акцент на линии плеч и шеи.',
    tone: 'cool',
    cardSlotKey: 'collection-reverie-card',
    detailIntro:
      'Этот образ держится на ощущении воздуха, световой прозрачности и спокойной вертикали, собранной вокруг плечевого пояса.',
    detailFocus: 'Главный акцент — прозрачность материала и мягкий объём',
    detailHeroSlotKey: 'collection-reverie-hero',
    detailGallerySlotKeys: [
      'collection-reverie-look-1',
      'collection-reverie-look-2',
      'collection-reverie-look-3',
      'collection-reverie-look-4',
    ],
  },
  {
    slug: 'ivory-hush',
    title: 'Ivory Hush',
    eyebrow: 'Look 03',
    subtitle: 'Тихая чувственность',
    description: 'Минималистичная композиция, в которой ткань, посадка и поза работают как единый образ.',
    tone: 'neutral',
    cardSlotKey: 'collection-hush-card',
    detailIntro:
      'В основе этого образа лежит сдержанная пластика: внимание смещается с декора на посадку, пропорции и текучесть поверхности.',
    detailFocus: 'Главный акцент — чистый силуэт и тактильная фактура',
    detailHeroSlotKey: 'collection-hush-hero',
    detailGallerySlotKeys: [
      'collection-hush-look-1',
      'collection-hush-look-2',
      'collection-hush-look-3',
      'collection-hush-look-4',
    ],
  },
];

export const ALL_COLLECTIONS = [FEATURED_COLLECTION, ...SOLO_COLLECTIONS];

export function getCollectionHref(slug: string) {
  return `/collections/${slug}`;
}

export function getCollectionBySlug(slug: string) {
  return ALL_COLLECTIONS.find((collection) => collection.slug === slug);
}

import { useState } from 'react';
import Header from '../components/Header';
import styles from './AboutPage.module.css';

const MEDIA_BASE_URL = 'http://localhost:9000/litiy-sew-media';
const ABOUT_HERO_IMAGE_PATH = 'about/about-hero-placeholder.jpg';
const ABOUT_HERO_IMAGE_URL = `${MEDIA_BASE_URL}/${ABOUT_HERO_IMAGE_PATH}`;
const ABOUT_PORTRAIT_IMAGE_PATH = 'about/about-portrait-placeholder.jpg';
const ABOUT_PORTRAIT_IMAGE_URL = `${MEDIA_BASE_URL}/${ABOUT_PORTRAIT_IMAGE_PATH}`;

const BIO_PARAGRAPHS = [
  'Конструктор одежды, выпускница Инженерной школы одежды СПбГУПТД по направлению «Конструирование, моделирование и технология швейных изделий».',
  'В своих проектах я в первую очередь обращаюсь к теме женственности и стремлюсь раскрывать красоту через пластику линий, пропорции и внимание к деталям. Для меня важен диалог между конструкцией и образом, когда форма становится продолжением характера.',
];

type PortfolioTone = 'warm' | 'graphite' | 'sage' | 'lilac' | 'blue';

type PortfolioItem = {
  id: string;
  eyebrow: string;
  title: string;
  meta: string;
  lead: string;
  paragraphs: string[];
  previewLabel: string;
  previewNote: string;
  tone: PortfolioTone;
};

const PORTFOLIO_ITEMS: PortfolioItem[] = [
  {
    id: 'problonde',
    eyebrow: 'Практика',
    title: 'Problonde',
    meta: 'Бренд, производство и съёмка',
    lead: 'Практика в небольшом модном бренде с участием в пошиве изделий и визуальной презентации коллекции.',
    paragraphs: [
      'В течение месяца я работала швеёй в бренде PROBLONDE, где принимала участие в изготовлении изделий повседневного ассортимента.',
      'Дополнительно я выступала моделью для сайта бренда, представляя готовые изделия в рамках визуальной презентации коллекции. Этот опыт позволил мне глубже понять особенности работы небольшого модного бренда и полный цикл создания изделия.',
    ],
    previewLabel: 'PROBLONDE',
    previewNote: 'brand practice',
    tone: 'warm',
  },
  {
    id: 'melon',
    eyebrow: 'Индустрия',
    title: 'Melon Fashion Group',
    meta: 'Аналитика и fashion-исследование',
    lead: 'Разбор структуры крупной fashion-группы, её ассортиментной логики и визуальных кодов массового рынка.',
    paragraphs: [
      'В рамках учебного проекта я исследовала работу крупного fashion-ритейла, анализируя ассортиментные матрицы, сезонные решения и логику брендинга в рамках группы Melon Fashion.',
      'Этот кейс помог сформировать системный взгляд на соотношение дизайна, коммерции и производственных ограничений внутри больших модных структур.',
    ],
    previewLabel: 'MELON',
    previewNote: 'fashion group',
    tone: 'graphite',
  },
  {
    id: 'spring-breath',
    eyebrow: 'Коллекция',
    title: 'Дыхание весны',
    meta: 'Концепт-капсула и художественный образ',
    lead: 'Авторский проект, построенный на ощущении лёгкости, воздуха и мягкой пластики формы.',
    paragraphs: [
      'Проект «Дыхание весны» развивался как визуальное и конструктивное исследование женственного силуэта. В центре внимания были мягкие объёмы, текучие линии и деликатные цветовые решения.',
      'Мне было важно собрать коллекцию, в которой конструкция поддерживает настроение образа и работает не отдельно от него, а вместе с ним.',
    ],
    previewLabel: 'SPRING',
    previewNote: 'capsule concept',
    tone: 'sage',
  },
  {
    id: 'winner-diploma',
    eyebrow: 'Награда',
    title: 'Диплом победителя',
    meta: 'Олимпиада креативных технологий',
    lead: 'Подтверждение сильной проектной базы и навыка доводить идею до убедительного результата.',
    paragraphs: [
      'Диплом победителя стал для меня важным маркером того, что проектный подход, внимание к деталям и аккуратная подача действительно работают вместе.',
      'Такие результаты особенно ценны тем, что фиксируют не только визуальный итог, но и дисциплину работы над проектом на всех этапах.',
    ],
    previewLabel: 'WINNER',
    previewNote: 'creative technologies',
    tone: 'lilac',
  },
  {
    id: 'prize-diploma',
    eyebrow: 'Награда',
    title: 'Диплом призёра',
    meta: 'Всероссийский конкурс',
    lead: 'Опыт конкурсной презентации идеи в публичном поле и подтверждение качества проектного мышления.',
    paragraphs: [
      'Участие в конкурсах помогает мне точнее формулировать идею проекта, ясно представлять её и выстраивать убедительную визуальную систему.',
      'Для меня это не только результат, но и практика профессиональной коммуникации, где важно соединить образ, аргументацию и качество исполнения.',
    ],
    previewLabel: 'AWARD',
    previewNote: 'national contest',
    tone: 'blue',
  },
];

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
            src={ABOUT_HERO_IMAGE_URL}
            alt="Елизавета на съёмке"
          />
          <div className={styles.heroOverlay} />

          <div className={styles.heroContent}>
            <p className={styles.heroEyebrow}>ОБО МНЕ</p>
            <h1 className={styles.heroTitle}>Elizaveta</h1>
          </div>
        </section>

        <section className={styles.story}>
          <div className={styles.storyFigure}>
            <img
              className={styles.storyImage}
              src={ABOUT_PORTRAIT_IMAGE_URL}
              alt="Портрет Елизаветы"
            />
          </div>

          <div className={styles.storyCopy}>
            <p className={styles.storyLead}>Линии, пластика, характер.</p>
            {BIO_PARAGRAPHS.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>

        <section className={styles.portfolio}>
          <div className={styles.sectionHeading}>
            <p className={styles.sectionEyebrow}>Избранные проекты</p>
            <h2 className={styles.sectionTitle}>Portfolio</h2>
          </div>

          <div className={styles.portfolioCards} role="tablist" aria-label="Карточки проектов">
            {PORTFOLIO_ITEMS.map((item) => {
              const isActive = item.id === activePortfolio.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`portfolio-panel-${item.id}`}
                  id={`portfolio-tab-${item.id}`}
                  className={`${styles.portfolioCard} ${isActive ? styles.portfolioCardActive : ''}`}
                  data-tone={item.tone}
                  onClick={() => setActivePortfolioId(item.id)}
                >
                  <span className={styles.portfolioCardEyebrow}>{item.eyebrow}</span>
                  <span className={styles.portfolioCardTitle}>{item.title}</span>
                  <span className={styles.portfolioCardMeta}>{item.meta}</span>
                </button>
              );
            })}
          </div>

          <article
            className={styles.portfolioDetail}
            id={`portfolio-panel-${activePortfolio.id}`}
            role="tabpanel"
            aria-labelledby={`portfolio-tab-${activePortfolio.id}`}
          >
            <div className={styles.portfolioPreview} data-tone={activePortfolio.tone}>
              <div className={styles.portfolioPreviewBadge}>{activePortfolio.eyebrow}</div>
              <div className={styles.portfolioPreviewBody}>
                <p className={styles.portfolioPreviewNote}>{activePortfolio.previewNote}</p>
                <p className={styles.portfolioPreviewLabel}>{activePortfolio.previewLabel}</p>
              </div>
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
        </section>
      </main>
    </>
  );
}

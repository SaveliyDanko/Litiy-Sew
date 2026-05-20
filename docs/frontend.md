# Фронтенд

React 19 SPA с ручным роутингом (без React Router). Entrypoint: `frontend/src/App.tsx`.

---

## Маршруты

Все роуты определены в `frontend/src/App.tsx` → функция `renderPage()`.

| URL | Компонент | Режим |
|---|---|---|
| `/` | `HomePage` | оба |
| `/about` | `AboutPage` | оба |
| `/collections` | `CollectionsPage` | оба |
| `/collections/:slug` | `CollectionPlaceholderPage` | оба |
| `/legal/privacy` | `PrivacyPage` | оба |
| `/legal/terms` | `TermsPage` | оба |
| `/legal/offer` | `OfferPage` | оба |
| `/auth`, `/profile`, `/profile/*` | `AuthPage` | оба (рендерит вкладку по URL) |
| `/admin`, `/admin/*` | `AdminPage` | оба (только роль ADMIN) |
| `/patterns` | `PatternsPage` | только shop |
| `/patterns/:category` | `PatternCategoryPage` | только shop |
| `/patterns/:category/:id` | `PatternDetailPage` | только shop |
| `/cart` | `CartPage` | только shop |
| `/favorites` | `FavoritesPage` | только shop |
| `/checkout` | `CheckoutUnavailablePage` | только shop |
| всё остальное | `NotFoundPage` | оба |

---

## Страницы (`frontend/src/pages/`)

| Файл | Назначение |
|---|---|
| `HomePage.tsx` | Главная: hero-баннер, карточка коллекции |
| `AboutPage.tsx` | О мастере: текст, отзывы |
| `CollectionsPage.tsx` | Список коллекций, разделённых по категориям (COLLECTION / SOLO / SKETCH) |
| `CollectionPlaceholderPage.tsx` | Страница конкретной коллекции: hero → детальный блок (2 фото + текст) → мозаика |
| `PatternsPage.tsx` | Каталог выкроек |
| `PatternCategoryPage.tsx` | Выкройки одной категории |
| `PatternDetailPage.tsx` | Карточка выкройки, выбор размера/роста |
| `CartPage.tsx` | Корзина |
| `FavoritesPage.tsx` | Избранное |
| `AuthPage.tsx` | Логин / регистрация / профиль (выбирает вкладку по URL) |
| `ProfileCabinetPage.tsx` | Личный кабинет |
| `ProfileMeasurementsPage.tsx` | Мерки |
| `ProfileOrdersPage.tsx` | История заказов (заглушка) |
| `ProfilePatternsPage.tsx` | Мои выкройки (заглушка) |
| `ProfileReviewsPage.tsx` | Мои отзывы (заглушка) |
| `AdminPage.tsx` | Панель администратора |
| `CheckoutUnavailablePage.tsx` | Заглушка оформления заказа |
| `PrivacyPage.tsx` | Политика конфиденциальности |
| `TermsPage.tsx` | Условия использования |
| `OfferPage.tsx` | Публичная оферта |
| `NotFoundPage.tsx` | 404 |

---

## Компоненты (`frontend/src/components/`)

| Файл | Назначение |
|---|---|
| `Header.tsx` | Шапка: логотип, меню, иконки корзины/избранного/профиля. Принимает проп `transparent` для прозрачного режима поверх hero. |
| `Footer.tsx` | Подвал. Скрыт при `VITE_SHOP_ENABLED=false`. |
| `HeroSection.tsx` | Hero-блок главной страницы. Читает изображение из слота `home-hero` через `siteImages`. |
| `ProductCard.tsx` | Карточка товара в каталоге. |
| `PatternCard.tsx` | Карточка выкройки. |
| `PatternParamsModal.tsx` | Модалка выбора размера и роста перед добавлением в корзину. |
| `Toaster.tsx` | Контейнер toast-уведомлений (использует `components/toast.ts`). |

---

## Сервисы (`frontend/src/services/`)

| Файл | Назначение |
|---|---|
| `auth.ts` | Регистрация, вход (2 шага), выход, `GET /me` |
| `cart.ts` | CRUD корзины |
| `favorites.ts` | CRUD избранного |
| `measurements.ts` | Мерки пользователя |
| `collections.ts` | Публичный список и детали коллекций; типы `DynamicCollection`, `DynamicCollectionPhoto` |
| `portfolio.ts` | Публичный список портфолио |
| `siteImages.ts` | Слоты изображений сайта (`site-images`) |
| `admin.ts` | Все admin-операции: загрузка файлов, CRUD товаров / выкроек / портфолио / hero / коллекций |

---

## Хуки (`frontend/src/hooks/`)

| Хук | Что делает |
|---|---|
| `useAuth` | Состояние аутентификации: `user`, `loading`, `login`, `logout` |
| `useCart` | Состояние корзины: `items`, `add`, `remove`, `update`, `clear` |
| `useFavorites` | Состояние избранного: `items`, `add`, `remove` |

---

## Как добавить новую страницу

1. Создать `frontend/src/pages/NewPage.tsx`
2. Добавить `import NewPage from './pages/NewPage'` в `App.tsx`
3. Добавить условие в `renderPage()` в `App.tsx`:
   ```typescript
   if (path.startsWith('/new-path')) return <NewPage />;
   ```

Если страница только для shop-режима — обернуть в блок `if (SHOP_ENABLED) { ... }`.

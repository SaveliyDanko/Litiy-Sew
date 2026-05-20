# Модель данных

## Таблицы PostgreSQL

| Таблица | Java Entity | Назначение |
|---|---|---|
| `users` | `User` | Аккаунты пользователей |
| `cart_items` | `CartItem` | Позиции корзины |
| `favorite_items` | `FavoriteItem` | Избранное |
| `measurements` | `Measurement` | Мерки пользователя |
| `products` | `Product` | Товары магазина |
| `pattern_items` | `PatternItem` | Выкройки |
| `portfolio_photos` | `PortfolioPhoto` | Фото портфолио |
| `hero_banners` | `HeroBanner` | Hero-баннер главной страницы (один активный) |
| `site_images` | `SiteImage` | Именованные слоты изображений сайта |
| `dynamic_collections` | `DynamicCollection` | Коллекции (портфолио) |
| `dynamic_collection_photos` | `DynamicCollectionPhoto` | Фотографии коллекций |
| `collection_meta` | `CollectionMeta` | Дополнительный заголовок/подзаголовок для коллекций |

---

## Сущности

### `users`
| Поле | Тип | Примечание |
|---|---|---|
| `id` | BIGINT PK | |
| `email` | VARCHAR(255) UNIQUE | |
| `password_hash` | TEXT | BCrypt |
| `email_verified` | BOOLEAN | false до подтверждения |
| `first_name` | VARCHAR(100) | |
| `last_name` | VARCHAR(100) | |
| `phone_number` | VARCHAR(32) | |
| `role` | VARCHAR(16) | `USER` или `ADMIN` |
| `created_at` | TIMESTAMP | |

### `cart_items`
Уникальный constraint: `(user_id, product_id, height, size)` — один вариант товара = одна строка, `quantity` увеличивается.

| Поле | Тип | Примечание |
|---|---|---|
| `product_id` | VARCHAR(128) | строковый ID из каталога фронта |
| `title`, `price`, `image` | — | денормализованы (не зависят от каталога) |
| `height` | VARCHAR(32) | диапазон роста, напр. `167-172` |
| `size` | VARCHAR(16) | размер, напр. `44` |
| `quantity` | INT | |

### `favorite_items`
Уникальный constraint: `(user_id, product_id)`. Поля `title`, `price`, `image` денормализованы аналогично корзине.

### `measurements`
| Поле | Тип |
|---|---|
| `name` | VARCHAR(80) — название набора мерок |
| `height_cm`, `chest_cm`, `waist_cm`, `hips_cm` | INT |
| `fullness_group` | VARCHAR(8) — группа полноты |
| `comment` | VARCHAR(500) |

### `products`
`imageUrl` + `imageKey` — URL для отображения и ключ файла для удаления с диска.

### `pattern_items`
| Поле | Примечание |
|---|---|
| `category` | VARCHAR(64) — произвольная строка категории |
| `sizes` | VARCHAR(255) — через запятую: `"38,40,42,44"` |
| `heights` | VARCHAR(255) — через запятую: `"155-160,161-166,167-172"` |
| `preview_url` + `preview_key` | изображение превью |

### `portfolio_photos`
`positionX`, `positionY`, `scale` — для настройки кадрирования в админке.

### `hero_banners`
Хранит один активный баннер. Поля: `imageUrl/Key` (десктоп), `imageUrlMobile/KeyMobile` (мобильный), `positionX/Y`, `positionXMobile/YMobile`, `scale`, `scaleMobile`.

### `site_images`
Именованные слоты (`slotKey`) для управляемых изображений сайта. `containerHeight` — высота контейнера в пикселях (0 = авто по aspect-ratio).

Текущие слоты:
- `home-hero` — главный hero на главной странице
- `home-featured-media` — карточка коллекции на главной (только `containerHeight`)

### `dynamic_collections`
| Поле | Примечание |
|---|---|
| `slug` | UNIQUE — используется в URL `/collections/:slug` |
| `eyebrow` | надпись над заголовком |
| `detail_intro`, `detail_focus` | тексты в детальном блоке страницы коллекции |
| `tone` | `warm` / `cool` / `neutral` — цвет плейсхолдера карточки |
| `category` | `COLLECTION` / `SOLO` / `SKETCH` — раздел на странице /collections |
| `featured` | BOOLEAN — отображается как главная карточка на /collections |
| `sort_order` | INT — порядок сортировки |

### `dynamic_collection_photos`
| Поле | Примечание |
|---|---|
| `collection_id` | FK на `dynamic_collections.id` |
| `photo_type` | `HERO` — полноэкранный баннер; `CARD` — обложка в списке; `GALLERY` — первые 2 идут в детальный блок, остальные в мозаику |
| `position_x`, `position_y`, `scale` | кадрирование |
| `sort_order` | порядок внутри типа |

### `collection_meta`
Устаревший слот для заголовка/подзаголовка коллекций (применялся до введения `DynamicCollection`). Сейчас используется для отображения имени коллекции на статических страницах.

---

## Redis — временные данные

| Ключ | Содержимое | TTL |
|---|---|---|
| `auth:verify:email:{email}` | `{hash, attempts}` — код подтверждения регистрации | 10 мин |
| `auth:verify:email:cooldown:{email}` | cooldown между повторными отправками | 60 сек |
| `auth:login:challenge:{challengeId}` | `{hash, attempts}` — login-код | 10 мин |
| `auth:login:challenge:{challengeId}:email` | email, привязанный к challengeId | 10 мин |
| `auth:login:cooldown:{email}` | cooldown для повторной отправки login-кода | 60 сек |

При достижении `max-attempts: 5` ключ удаляется — нужно запросить новый код.

# Backend — Spring Boot API

## Что это

REST API e-commerce платформы. Двухфакторная аутентификация пользователей по email (пароль + одноразовый код из письма), подтверждение email при регистрации, персональные избранное и корзина.

## Стек

- Java 21, Spring Boot 3.5
- Spring Security 6 (session cookie, BCrypt)
- Spring Data JPA, PostgreSQL 16
- Spring Data Redis — хранилище одноразовых кодов и login-challenge'ей
- Spring Boot Starter Mail (Gmail SMTP + STARTTLS, App Password)
- Lombok, Bean Validation

## Запуск

```bash
# из корня репозитория — собрать и поднять backend вместе с Postgres, Redis
docker compose up --build -d backend

# альтернативно: поднять только инфраструктуру и запускать backend локально
docker compose up -d postgres redis

# из backend/ — запустить приложение локально
./gradlew bootRun
```

Приложение слушает `http://localhost:8080`. БД и креды — в [backend/src/main/resources/application.yaml](../backend/src/main/resources/application.yaml). Таблицы создаются автоматически (`spring.jpa.hibernate.ddl-auto=update`).

## Конфигурация окружения

Чувствительные параметры берутся из env-переменных (значения по умолчанию указаны в [application.yaml](../backend/src/main/resources/application.yaml)):

| Переменная | Назначение | Default |
|---|---|---|
| `MAIL_USERNAME` | Gmail-адрес отправителя | — |
| `MAIL_PASSWORD` | [Google App Password](https://myaccount.google.com/apppasswords) (требует 2FA в аккаунте) | — |
| `MAIL_FROM` | Адрес в поле `From` | = `MAIL_USERNAME` |
| `MAIL_HOST` | SMTP-хост | `smtp.gmail.com` |
| `MAIL_PORT` | SMTP-порт | `587` |
| `APP_MAIL_CONSOLE_FALLBACK_ENABLED` | Если `true` и SMTP не настроен, коды печатаются в лог backend вместо отправки письма | `false` |
| `BACKEND_PORT` | Локальный порт backend в Docker Compose | `8080` |
| `REDIS_HOST` | Redis-хост | `localhost` |
| `REDIS_PORT` | Redis-порт | `6379` |
| `REDIS_PASSWORD` | Пароль Redis | пусто |

В `docker compose` для локальной разработки `APP_MAIL_CONSOLE_FALLBACK_ENABLED=true` по умолчанию. Если `MAIL_USERNAME`/`MAIL_PASSWORD` не заданы, backend не падает, а пишет одноразовый код в лог контейнера.

Параметры одноразовых кодов фиксированы в конфиге (`app.auth.code.*`):

- `length: 6` — длина кода
- `ttl: 10m` — срок жизни
- `max-attempts: 5` — максимум попыток ввода
- `resend-cooldown: 60s` — минимальный интервал между повторными отправками

## Конфигурация безопасности

См. [SecurityConfig.java](../backend/src/main/java/com/litiy/backend/config/SecurityConfig.java).

- Сессионная аутентификация: `SessionCreationPolicy.IF_REQUIRED`, контекст сохраняется через `HttpSessionSecurityContextRepository`.
- CSRF отключён (SPA + сессионная кука с `SameSite=Lax` по умолчанию).
- CORS: разрешены `http://localhost:5173` и `http://localhost:4173`, `allowCredentials=true` — фронт должен слать `fetch(..., { credentials: 'include' })`.
- Пароли — `BCryptPasswordEncoder`. Коды подтверждения хранятся в Redis в виде BCrypt-хеша, проверка через `PasswordEncoder.matches`.
- Публичные эндпоинты: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/login/verify`, `POST /api/auth/verify-email`, `POST /api/auth/resend-code`, публичные GET-контент API и чтение медиа (`GET /media/**`, локально также `GET /api/media/**`).
- Запись медиа (`POST /api/media/upload`, `DELETE /api/media`) доступна только `ADMIN`.
- Остальные требуют авторизации, при 401 возвращается пустой ответ с `HttpStatusEntryPoint`.

## Аутентификация

### Регистрация + подтверждение email

1. `POST /api/auth/register` — создаёт `User` с `emailVerified=false`, генерирует 6-значный код, шлёт письмо.
2. `POST /api/auth/verify-email` — принимает `{email, code}`, при совпадении ставит `emailVerified=true`. После этого нужно выполнить логин через общий flow.
3. `POST /api/auth/resend-code` — повторная отправка с cooldown 60 секунд.

### Вход (2FA)

1. `POST /api/auth/login` — `{email, password}`. Проверяет креды через `AuthenticationManager`, требует `emailVerified=true`, стартует login-challenge в Redis и шлёт код. **Сессия не создаётся.** Ответ: `{challengeId, email, expiresInSeconds}`.
2. `POST /api/auth/login/verify` — `{challengeId, code}`. При совпадении создаёт `SecurityContext`, сохраняет в сессию через `HttpSessionSecurityContextRepository`, выставляет `JSESSIONID`.

### Хранилище кодов — Redis

Реализовано в [VerificationCodeService.java](../backend/src/main/java/com/litiy/backend/service/VerificationCodeService.java) и [AuthChallengeService.java](../backend/src/main/java/com/litiy/backend/service/AuthChallengeService.java).

| Ключ | Назначение | TTL |
|---|---|---|
| `auth:verify:email:{email}` | Hash `{hash, attempts}` — код подтверждения регистрации | `app.auth.code.ttl` |
| `auth:verify:email:cooldown:{email}` | Cooldown между повторными отправками | `app.auth.code.resend-cooldown` |
| `auth:login:challenge:{challengeId}` | Hash `{hash, attempts}` — login-код | `app.auth.code.ttl` |
| `auth:login:challenge:{challengeId}:email` | Email, привязанный к challengeId | `app.auth.code.ttl` |
| `auth:login:cooldown:{email}` | Cooldown для повторной отправки login-кода | `app.auth.code.resend-cooldown` |

При достижении `max-attempts` соответствующий ключ удаляется — пользователю нужно запросить новый код.

## Ошибки

Единый формат в [GlobalExceptionHandler.java](../backend/src/main/java/com/litiy/backend/exception/GlobalExceptionHandler.java):

| Код | HTTP | Когда |
|---|---|---|
| `validation_failed` | 400 | Bean Validation провалилась — в `fields` карта `field → message` |
| `bad_request` | 400 | `IllegalArgumentException` из сервисов |
| `invalid_credentials` | 401 | `BadCredentialsException`, `UsernameNotFoundException` |
| `invalid_code` | 400 | Неверный код подтверждения |
| `code_expired` | 410 | TTL кода истёк — запросить новый |
| `challenge_not_found` | 410 | `challengeId` неизвестен / протух |
| `too_many_attempts` | 429 | Превышен `max-attempts`, ключ удалён |
| `resend_too_soon` | 429 | Повторная отправка внутри cooldown, в теле `retryAfterSeconds` + заголовок `Retry-After` |
| `email_not_verified` | 403 | Логин до подтверждения email |
| `email_already_verified` | 409 | Повторный `/verify-email` для уже подтверждённого |

Пример:

```json
{ "error": "resend_too_soon", "message": "Подождите перед повторной отправкой", "retryAfterSeconds": 47 }
```

## Модель данных

| Таблица | Сущность | Ключевые поля |
|---|---|---|
| `users` | [User](../backend/src/main/java/com/litiy/backend/model/entity/User.java) | `email` UNIQUE, `password_hash`, `email_verified`, `role` (USER/ADMIN), `created_at` |
| `favorite_items` | [FavoriteItem](../backend/src/main/java/com/litiy/backend/model/entity/FavoriteItem.java) | UNIQUE `(user_id, product_id)` |
| `cart_items` | [CartItem](../backend/src/main/java/com/litiy/backend/model/entity/CartItem.java) | UNIQUE `(user_id, product_id, height, size)`, `quantity` |

Каталог товаров в БД не хранится — `product_id` приходит с фронта как строка (идентификатор позиции из статического каталога). Поля `title/price/image` денормализованы в избранное и корзину, чтобы список восстанавливался без обращения к каталогу.

## Эндпоинты

### Auth — `/api/auth`

Контроллер: [AuthController.java](../backend/src/main/java/com/litiy/backend/controller/AuthController.java).

| Метод | Путь | Авторизация | Описание |
|---|---|---|---|
| POST | `/register` | публичный | Создаёт пользователя с ролью `USER`, `emailVerified=false`, шлёт код подтверждения. |
| POST | `/verify-email` | публичный | Подтверждает email по коду. Возвращает `UserResponse`. |
| POST | `/resend-code` | публичный | Повторная отправка кода регистрации (cooldown 60с). |
| POST | `/login` | публичный | Шаг 1 логина: проверяет креды, стартует challenge, шлёт код. Сессия не создаётся. |
| POST | `/login/verify` | публичный | Шаг 2 логина: сверяет код, выставляет `JSESSIONID`. |
| POST | `/logout` | авторизованный | Инвалидирует сессию, чистит контекст. 204. |
| GET | `/me` | авторизованный | Текущий пользователь. |

`RegisterRequest`: `email` (валидный email, ≤255), `password` 6–128 (обязательны).
`VerifyEmailRequest`: `email`, `code` (`\d{4,8}`).
`ResendCodeRequest`: `email`.
`LoginRequest`: `email`, `password` — обязательны.
`LoginVerifyRequest`: `challengeId` (UUID), `code`.
`RegisterResponse`: `{ userId, email, status: "email_verification_required", expiresInSeconds }`.
`LoginChallengeResponse`: `{ challengeId, email, expiresInSeconds }`.
`UserResponse`: `{ id, email, role }`.

### Favorites — `/api/favorites`

Контроллер: [FavoriteController.java](../backend/src/main/java/com/litiy/backend/controller/FavoriteController.java). Все эндпоинты — только для авторизованного пользователя, работают исключительно с его записями.

| Метод | Путь | Описание |
|---|---|---|
| GET | `/` | Список избранного, новые сверху (`createdAt DESC`). |
| POST | `/` | Добавляет/обновляет позицию по `productId` (идемпотентно). |
| DELETE | `/{productId}` | Убирает позицию. 204. |

`FavoriteRequest`: `productId` (≤128), `title` (≤255), `price` (≥0), `image` (≤512).
`FavoriteResponse`: `{ productId, title, price, image }`.

### Cart — `/api/cart`

Контроллер: [CartController.java](../backend/src/main/java/com/litiy/backend/controller/CartController.java). Все эндпоинты — только для авторизованного пользователя.

| Метод | Путь | Описание |
|---|---|---|
| GET | `/` | Список позиций, новые сверху. |
| POST | `/` | Добавляет позицию; при совпадении `(productId, height, size)` увеличивает `quantity`. |
| PATCH | `/{itemId}` | Меняет `quantity`. 400, если позиция принадлежит другому пользователю. |
| DELETE | `/{itemId}` | Удаляет одну позицию. 204. |
| DELETE | `/` | Очищает всю корзину пользователя. 204. |

`CartItemRequest`: `productId`, `title`, `price`, `image`, `height` (≤32), `size` (≤16), `quantity` (≥1).
`CartItemUpdateRequest`: `quantity` (≥1).
`CartItemResponse`: `{ id, productId, title, price, image, height, size, quantity }`.


## Примеры запросов

Регистрация:

```bash
curl -i -X POST http://localhost:8080/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"alice@example.com","password":"password1"}'
```

Подтверждение email:

```bash
curl -i -X POST http://localhost:8080/api/auth/verify-email \
  -H 'Content-Type: application/json' \
  -d '{"email":"alice@example.com","code":"123456"}'
```

Логин — шаг 1 (получить challenge):

```bash
curl -i -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"alice@example.com","password":"password1"}'
```

Логин — шаг 2 (подтвердить код, сохранить куку):

```bash
curl -i -c cookies.txt -X POST http://localhost:8080/api/auth/login/verify \
  -H 'Content-Type: application/json' \
  -d '{"challengeId":"<uuid-из-шага-1>","code":"123456"}'
```

Добавить в избранное:

```bash
curl -b cookies.txt -X POST http://localhost:8080/api/favorites \
  -H 'Content-Type: application/json' \
  -d '{"productId":"skirt-1","title":"Юбка Лиа","price":2990,"image":"patterns/skirt-1.jpg"}'
```

Добавить в корзину:

```bash
curl -b cookies.txt -X POST http://localhost:8080/api/cart \
  -H 'Content-Type: application/json' \
  -d '{"productId":"skirt-1","title":"Юбка Лиа","price":2990,"image":"patterns/skirt-1.jpg","height":"167-172","size":"44","quantity":1}'
```

## Локальная разработка

```bash
./gradlew bootRun        # hot reload через spring-boot-devtools
./gradlew compileJava    # быстрая проверка сборки
./gradlew test           # тесты
./gradlew build          # собрать jar в build/libs/
```

---

## Коллекции — `/api/collections`

Контроллер: [DynamicCollectionController.java](../backend/src/main/java/com/litiy/backend/controller/DynamicCollectionController.java).

| Метод | Путь | Авторизация | Описание |
|---|---|---|---|
| GET | `/api/collections` | публичный | Список всех коллекций, сортировка по `sortOrder`. |
| GET | `/api/collections/{slug}` | публичный | Одна коллекция по slug с фотографиями. 404 если не найдена. |
| POST | `/api/admin/collections` | ADMIN | Создать коллекцию. 201. |
| PUT | `/api/admin/collections/{id}` | ADMIN | Обновить коллекцию. |
| DELETE | `/api/admin/collections/{id}` | ADMIN | Удалить коллекцию и все её фотографии с диска. 204. |
| POST | `/api/admin/collections/{collectionId}/photos` | ADMIN | Добавить фото к коллекции. 201. |
| PATCH | `/api/admin/collections/photos/{photoId}/position` | ADMIN | Обновить кадрирование фото (`positionX`, `positionY`, `scale`). |
| DELETE | `/api/admin/collections/photos/{photoId}` | ADMIN | Удалить фото. 204. |

`DynamicCollectionRequest`: `slug`, `title`, `subtitle`, `eyebrow`, `description`, `detailIntro`, `detailFocus`, `tone` (`warm`/`cool`/`neutral`), `category` (`COLLECTION`/`SOLO`/`SKETCH`), `sortOrder`, `featured`.

`DynamicCollectionPhotoRequest`: `imageUrl`, `imageKey`, `photoType` (`HERO`/`CARD`/`GALLERY`), `positionX`, `positionY`, `scale`, `sortOrder`.

---

## Медиафайлы — `/api/media`

Контроллер: [MediaController.java](../backend/src/main/java/com/litiy/backend/controller/MediaController.java).

| Метод | Путь | Авторизация | Описание |
|---|---|---|---|
| POST | `/api/media/upload` | ADMIN | Загрузить файл. `multipart/form-data`, поле `file`. Возвращает `{ publicUrl, key, srcset }`. |
| DELETE | `/api/media?key=...` | ADMIN | Удалить файл по ключу. 204. |

На практике эндпоинты вызываются из авторизованной AdminPage.

`MediaService` конвертирует изображения в WebP, сохраняет `original.webp` и
responsive-варианты, а в ответе возвращает относительный `publicUrl` вида
`/media/<uuid>/original.webp` и `srcset`.

В production сами файлы `/media/**` отдаёт Nginx через alias на
`/opt/litiy-sew/uploads`. Spring ResourceHandler нужен для локального режима
и для Vite proxy. Если на проде `/media/...` отвечает `403`, это почти всегда
права на `uploads`: Nginx должен иметь доступ через группу `www-data`.

---

## Изображения сайта — `/api/site-images`

Контроллер: [SiteImageController.java](../backend/src/main/java/com/litiy/backend/controller/SiteImageController.java).

Именованные слоты для управляемых изображений (hero, обложка коллекции и т.д.).

| Метод | Путь | Авторизация | Описание |
|---|---|---|---|
| GET | `/api/site-images` | публичный | Список всех слотов. |
| GET | `/api/site-images/{slotKey}` | публичный | Один слот. 204 если не заполнен. |
| POST | `/api/admin/site-images` | ADMIN | Создать/обновить слот (upsert по `slotKey`). |
| PATCH | `/api/admin/site-images/{slotKey}/position` | ADMIN | Обновить `positionX`, `positionY`, `scale`, `containerHeight`. |
| DELETE | `/api/admin/site-images/{slotKey}` | ADMIN | Удалить слот и файл с диска. 204. |

`SiteImageRequest`: `slotKey`, `imageUrl`, `imageKey`, `positionX`, `positionY`, `scale`, `containerHeight`.

---

## Публичный контент — без авторизации

Контроллер: [PublicContentController.java](../backend/src/main/java/com/litiy/backend/controller/PublicContentController.java).

| Метод | Путь | Описание |
|---|---|---|
| GET | `/api/products` | Список товаров (новые сверху). |
| GET | `/api/patterns` | Список выкроек. |
| GET | `/api/portfolio` | Фото портфолио (по `sortOrder`). |
| GET | `/api/hero` | Текущий hero-баннер. 204 если не задан. |
| GET | `/api/collections/meta` | Карта `slug → { title, subtitle }` для коллекций. |

---

## Администрирование — `/api/admin`

Контроллер: [AdminController.java](../backend/src/main/java/com/litiy/backend/controller/AdminController.java). Все эндпоинты — только роль `ADMIN`.

### Товары

| Метод | Путь | Описание |
|---|---|---|
| GET | `/api/admin/products` | Список товаров. |
| POST | `/api/admin/products` | Создать товар. 201. |
| DELETE | `/api/admin/products/{id}` | Удалить товар и файл. 204. |

`ProductRequest`: `title`, `description`, `price`, `imageUrl`, `imageKey`.

### Выкройки

| Метод | Путь | Описание |
|---|---|---|
| GET | `/api/admin/patterns` | Список выкроек. |
| POST | `/api/admin/patterns` | Создать выкройку. 201. |
| DELETE | `/api/admin/patterns/{id}` | Удалить выкройку и файл. 204. |

`PatternItemRequest`: `title`, `category`, `price`, `description`, `previewUrl`, `previewKey`, `sizes` (через запятую), `heights` (через запятую).

### Портфолио

| Метод | Путь | Описание |
|---|---|---|
| GET | `/api/admin/portfolio` | Список фото. |
| POST | `/api/admin/portfolio` | Добавить фото. 201. |
| DELETE | `/api/admin/portfolio/{id}` | Удалить фото и файл. 204. |
| PATCH | `/api/admin/portfolio/{id}/order` | Изменить порядок. Body: `{ "sortOrder": N }`. 204. |
| PATCH | `/api/admin/portfolio/{id}/position` | Обновить кадрирование. Body: `{ positionX, positionY, scale }`. |

### Hero-баннер

| Метод | Путь | Описание |
|---|---|---|
| GET | `/api/admin/hero` | Текущий баннер. 204 если нет. |
| POST | `/api/admin/hero` | Заменить баннер (старый файл и запись удаляются). 201. |
| PATCH | `/api/admin/hero/position` | Обновить позицию/масштаб для десктопа и мобайла. |
| PUT | `/api/admin/hero/mobile` | Установить мобильное изображение. Body: `{ imageUrl, imageKey }`. |
| DELETE | `/api/admin/hero/mobile` | Удалить мобильное изображение. |
| DELETE | `/api/admin/hero` | Удалить баннер полностью. 204. |

### Учётные данные администратора

| Метод | Путь | Описание |
|---|---|---|
| PATCH | `/api/admin/credentials` | Изменить email/пароль текущего ADMIN-пользователя. 204. |

### Метаданные коллекций

| Метод | Путь | Описание |
|---|---|---|
| PUT | `/api/admin/collections/{slug}/meta` | Upsert заголовка/подзаголовка для slug. |

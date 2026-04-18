# Backend — Spring Boot API

## Что это

REST API e-commerce платформы. Аутентификация пользователей, персональные избранное и корзина, presigned-ссылки на загрузку медиафайлов в MinIO.

## Стек

- Java 21, Spring Boot 3.5
- Spring Security 6 (session cookie, BCrypt)
- Spring Data JPA, PostgreSQL 16
- AWS SDK v2 (S3) — интеграция с MinIO
- Lombok, Bean Validation

## Запуск

```bash
# из корня репозитория — поднять Postgres и MinIO
docker compose up -d

# из backend/ — запустить приложение
./gradlew bootRun
```

Приложение слушает `http://localhost:8080`. БД и креды — в [backend/src/main/resources/application.yaml](../backend/src/main/resources/application.yaml). Таблицы создаются автоматически (`spring.jpa.hibernate.ddl-auto=update`).

## Конфигурация безопасности

См. [SecurityConfig.java](../backend/src/main/java/com/litiy/backend/config/SecurityConfig.java).

- Сессионная аутентификация: `SessionCreationPolicy.IF_REQUIRED`, контекст сохраняется через `HttpSessionSecurityContextRepository`.
- CSRF отключён (SPA + сессионная кука с `SameSite=Lax` по умолчанию).
- CORS: разрешены `http://localhost:5173` и `http://localhost:4173`, `allowCredentials=true` — фронт должен слать `fetch(..., { credentials: 'include' })`.
- Пароли — `BCryptPasswordEncoder`.
- Публичные эндпоинты: `POST /api/auth/register`, `POST /api/auth/login`, `/api/media/**`.
- Остальные требуют авторизации, при 401 возвращается пустой ответ с `HttpStatusEntryPoint`.

## Ошибки

Единый формат в [GlobalExceptionHandler.java](../backend/src/main/java/com/litiy/backend/exception/GlobalExceptionHandler.java):

| Код | HTTP | Когда |
|---|---|---|
| `validation_failed` | 400 | Bean Validation провалилась — в `fields` карта `field → message` |
| `bad_request` | 400 | `IllegalArgumentException` из сервисов |
| `invalid_credentials` | 401 | `BadCredentialsException`, `UsernameNotFoundException` |

Пример:

```json
{ "error": "validation_failed", "fields": { "password": "size must be between 6 and 128" } }
```

## Модель данных

| Таблица | Сущность | Ключевые поля |
|---|---|---|
| `users` | [User](../backend/src/main/java/com/litiy/backend/model/entity/User.java) | `username` UNIQUE, `password_hash`, `role` (USER/ADMIN), `created_at` |
| `favorite_items` | [FavoriteItem](../backend/src/main/java/com/litiy/backend/model/entity/FavoriteItem.java) | UNIQUE `(user_id, product_id)` |
| `cart_items` | [CartItem](../backend/src/main/java/com/litiy/backend/model/entity/CartItem.java) | UNIQUE `(user_id, product_id, height, size)`, `quantity` |

Каталог товаров в БД не хранится — `product_id` приходит с фронта как строка (идентификатор позиции из статического каталога). Поля `title/price/image` денормализованы в избранное и корзину, чтобы список восстанавливался без обращения к каталогу.

## Эндпоинты

### Auth — `/api/auth`

Контроллер: [AuthController.java](../backend/src/main/java/com/litiy/backend/controller/AuthController.java).

| Метод | Путь | Авторизация | Описание |
|---|---|---|---|
| POST | `/register` | публичный | Создаёт пользователя с ролью `USER`. Возвращает `UserResponse`. |
| POST | `/login` | публичный | Проверяет креды, сохраняет `SecurityContext` в сессию, выставляет `JSESSIONID`. |
| POST | `/logout` | авторизованный | Инвалидирует сессию, чистит контекст. 204. |
| GET | `/me` | авторизованный | Текущий пользователь. |

`RegisterRequest`: `username` 3–64, `password` 6–128 (обязательны).
`LoginRequest`: `username`, `password` — обязательны.
`UserResponse`: `{ id, username, role }`.

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

### Media — `/api/media`

Контроллер: [MediaController.java](../backend/src/main/java/com/litiy/backend/controller/MediaController.java). Публичные эндпоинты (см. [SecurityConfig.java](../backend/src/main/java/com/litiy/backend/config/SecurityConfig.java)).

| Метод | Путь | Описание |
|---|---|---|
| POST | `/presign` | Выдаёт presigned URL для PUT-загрузки в MinIO (TTL 15 минут). |
| DELETE | `/?key=...` | Удаляет объект из бакета. |

Подробнее про MinIO — [minio.md](minio.md).

## Примеры запросов

Логин (сохранить куку):

```bash
curl -i -c cookies.txt -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"alice","password":"password1"}'
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

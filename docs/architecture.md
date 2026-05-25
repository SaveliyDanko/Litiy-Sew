# Архитектура

## Слои системы

```
Браузер
  │  HTTPS (продакшн) / HTTP (локально)
  ▼
Nginx                          — reverse proxy, раздаёт статику фронта и медиа
  │  /api/** → http://backend:8080
  │  /media/** → /opt/litiy-sew/uploads
  ▼
Spring Boot (порт 8080)
  ├── REST Controllers          — принимают запросы, возвращают JSON
  ├── Services                  — бизнес-логика
  ├── Repositories (Spring Data JPA)
  │     ├── PostgreSQL          — основное хранилище (пользователи, товары, коллекции…)
  │     └── Redis               — временные данные (коды подтверждения, login-challenge)
  └── MediaService              — сохраняет файлы в /opt/litiy-sew/uploads
```

Локально бэкенд запускается напрямую (порт 8080), а фронтенд через Vite dev-server
(порт 5173) с прокси `/api` и `/media` → `localhost:8080`.

---

## Аутентификация

Двухшаговый вход через email-код:

```
1. POST /api/auth/login  { email, password }
       │  ← проверка пароля (BCrypt)
       │  ← генерация 6-значного кода, отправка на email
       └→ { challengeId, expiresInSeconds }   (сессия ещё не создана)

2. POST /api/auth/login/verify  { challengeId, code }
       │  ← проверка кода из Redis
       └→ Set-Cookie: JSESSIONID=...          (сессия создана)
```

Все последующие запросы — с cookie `JSESSIONID`. Регистрация аналогична: сначала `POST /register`, потом `POST /verify-email`.

Коды хранятся в Redis в виде BCrypt-хешей с TTL 10 минут, максимум 5 попыток ввода.

Подробнее: [backend.md — Аутентификация](./backend.md#аутентификация)

---

## Загрузка медиафайлов

```
Браузер
  │  POST /api/media/upload  (multipart/form-data, поле "file")
  ▼
MediaController → MediaService
  │  сохраняет файл в MEDIA_UPLOAD_DIR (по умолчанию /opt/litiy-sew/uploads)
  │  конвертирует в WebP и генерирует варианты 400/800/1280/1920
  └→ { "publicUrl": "/media/uuid/original.webp", "key": "uuid/original.webp", "srcset": "..." }

Браузер
  │  GET /media/uuid/original.webp
  ▼
Prod: Nginx alias /media/ → /opt/litiy-sew/uploads
Dev: Vite proxy /media → Spring ResourceHandler
```

`imageKey` / `photoKey` — это путь относительно `MEDIA_UPLOAD_DIR`. При удалении сущности сервис вызывает `mediaService.deleteFile(key)`, которая удаляет файл с диска.

На VPS права `uploads` важны для Nginx:

```text
/opt/litiy-sew/uploads      litiy-sew:www-data 2750
вложенные директории        litiy-sew:www-data 2750
файлы                       litiy-sew:www-data 0640
```

Setgid-бит (`2` в `2750`) нужен, чтобы новые папки наследовали группу
`www-data`. Если вложенные папки останутся `litiy-sew:litiy-sew` с `750`,
Nginx вернёт `403` и в error.log будет `Permission denied`.

---

## Ключевые архитектурные решения

### Ручной роутинг без React Router
`frontend/src/App.tsx` содержит функцию `renderPage()` — один большой `if/else` по `window.location.pathname`. При добавлении страницы нужно: создать файл страницы → добавить `import` → добавить `if` в `renderPage()`.

Навигация — обычные `<a href="...">` или `window.location.href = ...`. Никакого `push`/`navigate`.

### Denormalized cart и favorites
`cart_items` и `favorite_items` хранят `title`, `price`, `image` прямо в строке — чтобы список восстанавливался без обращения к каталогу, даже если товар удалён из БД.

### `ddl-auto: update` — добавление колонок
Hibernate автоматически создаёт новые таблицы и добавляет новые колонки. Колонка добавляется **без DEFAULT**, поэтому:
- `@Column(nullable = false)` на новом поле в заполненной таблице → строки нарушают NOT NULL constraint → приложение не стартует.
- Всегда добавляй новые поля как nullable (`@Column` без `nullable = false`) или делай ручной `ALTER TABLE ... ADD COLUMN IF NOT EXISTS ... DEFAULT ...` на VPS **до деплоя**.
- `Boolean.TRUE.equals(field)` — безопасный способ читать nullable Boolean (возвращает `false` для `null`).

### Feature flags через Vite
`VITE_SHOP_ENABLED` считывается в `frontend/src/utils/featureFlags.ts` через `import.meta.env`. Значение подставляется на этапе сборки — изменение требует пересборки (`npm run build`) или перезапуска dev-сервера.

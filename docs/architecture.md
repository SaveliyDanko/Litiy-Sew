# Архитектура

## Слои системы

```
Браузер
  │  HTTPS (продакшн) / HTTP (локально)
  ▼
Nginx                          — reverse proxy, раздаёт статику фронта и проксирует /api
  │  /api/** → http://backend:8080
  ▼
Spring Boot (порт 8080)
  ├── REST Controllers          — принимают запросы, возвращают JSON
  ├── Services                  — бизнес-логика
  ├── Repositories (Spring Data JPA)
  │     ├── PostgreSQL          — основное хранилище (пользователи, товары, коллекции…)
  │     └── Redis               — временные данные (коды подтверждения, login-challenge)
  └── MediaService              — файлы → локальная папка /opt/litiy-sew/uploads
          ▲
          └── /media/**         — Spring отдаёт загруженные файлы как статику
```

Локально бэкенд запускается напрямую (порт 8080), а фронтенд через Vite dev-server (порт 5173) с прокси `/api → localhost:8080`.

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
  │  генерирует уникальное имя: uuid/originalname.ext
  └→ { "publicUrl": "http://host/media/uuid/file.ext", "key": "uuid/file.ext" }

Браузер
  │  GET /media/uuid/file.ext
  ▼
Spring (ResourceHandler)  → отдаёт файл из MEDIA_UPLOAD_DIR
```

`imageKey` / `photoKey` — это путь относительно `MEDIA_UPLOAD_DIR`. При удалении сущности сервис вызывает `mediaService.deleteFile(key)`, которая удаляет файл с диска.

---

## Ключевые архитектурные решения

### Ручной роутинг без React Router
`frontend/src/App.tsx` содержит функцию `renderPage()` — один большой `if/else` по `window.location.pathname`. При добавлении страницы нужно: создать файл страницы → добавить `import` → добавить `if` в `renderPage()`.

Навигация — обычные `<a href="...">` или `window.location.href = ...`. Никакого `push`/`navigate`.

### Denormalized cart и favorites
`cart_items` и `favorite_items` хранят `title`, `price`, `image` прямо в строке — чтобы список восстанавливался без обращения к каталогу, даже если товар удалён из БД.

### `ddl-auto: update` — только для новых таблиц
Hibernate автоматически создаёт **новые** таблицы и добавляет **новые** колонки в **пустые** таблицы. Если таблица уже содержит строки и нужно добавить колонку — обязателен ручной `ALTER TABLE ... ADD COLUMN IF NOT EXISTS ...` на VPS перед деплоем.

### Feature flags через Vite
`VITE_SHOP_ENABLED` считывается в `frontend/src/utils/featureFlags.ts` через `import.meta.env`. Значение подставляется на этапе сборки — изменение требует пересборки (`npm run build`) или перезапуска dev-сервера.

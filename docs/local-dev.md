# Локальная разработка

## Вариант А — всё в Docker

Собирает и запускает бэкенд в контейнере вместе с PostgreSQL и Redis:

```bash
# из корня репозитория
cp .env.example .env          # один раз — создать файл с переменными
docker compose up --build -d backend

# фронтенд отдельно (горячая перезагрузка)
cd frontend
npm install
npm run dev
```

## Вариант Б — инфра в Docker, бэкенд локально

Быстрее при частых изменениях в Java-коде:

```bash
# поднять только PostgreSQL и Redis
docker compose up -d postgres redis

# из backend/
./gradlew bootRun

# в отдельном терминале, из frontend/
npm run dev
```

---

## Порты

| Сервис | Порт |
|---|---|
| Фронтенд (Vite) | http://localhost:5173 |
| Бэкенд (Spring Boot) | http://localhost:8080 |
| PostgreSQL | localhost:5433 |
| Redis | localhost:6379 |

Vite автоматически проксирует `/api/*` → `http://localhost:8080` (настроено в `frontend/vite.config.ts`).

---

## Переменные окружения

Минимальный `.env` в корне репозитория:

```bash
POSTGRES_PORT=5433
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=litiy_sew

REDIS_PASSWORD=

# Если нет SMTP — коды будут печататься в лог бэкенда
APP_MAIL_CONSOLE_FALLBACK_ENABLED=true
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_FROM=
```

Полный шаблон: `.env.example`

Для фронтенда — `frontend/.env.local` (при необходимости):
```bash
VITE_SHOP_ENABLED=true    # включить режим магазина
```

---

## Полезные команды

### Бэкенд (из `backend/`)
```bash
./gradlew bootRun        # запуск с hot-reload (spring-boot-devtools)
./gradlew compileJava    # быстрая проверка сборки
./gradlew test           # тесты
./gradlew build          # собрать jar → build/libs/
```

### Фронтенд (из `frontend/`)
```bash
npm run dev              # dev-сервер на :5173
npm run build            # production-сборка → dist/
npm run lint             # ESLint
```

---

## Медиафайлы (загруженные фотографии)

Загруженные через админку фото хранятся на хосте в `/opt/litiy-sew/uploads/` и монтируются в контейнер как bind mount — файлы **не теряются** при пересборке. Путь задаётся переменной `MEDIA_UPLOAD_DIR` в `.env`.

**Фото загруженные на проде остаются на проде.** `ansible-playbook deploy.yml` обновляет только код — БД и медиафайлы он не трогает. Это намеренно: данные накапливаются на VPS независимо от деплоев.

Полная инструкция по переносу — в следующем разделе.

---

## Перенос проекта (dev → prod или сервер → сервер)

Состояние проекта разделено на три части с разным жизненным циклом:

| Часть | Где лежит | Обновляется при деплое | Как переносить |
|---|---|---|---|
| **Код** | git-репозиторий | ✅ автоматически (`deploy.yml`) | `git push` / `git pull` |
| **Медиафайлы** | `/opt/litiy-sew/uploads/` на хосте VPS | ❌ не трогается | `rsync` или `tar + scp` |
| **БД** | PostgreSQL на VPS | ❌ не трогается | `pg_dump` / `psql` |

> Медиафайлы и БД живут только на VPS. `deploy.yml` их не трогает — поэтому фото загруженные через админку на проде никуда не пропадают после деплоя.

### 1. Экспорт (на исходном сервере)

```bash
# Дамп базы данных
docker compose exec postgres pg_dump -U postgres litiy_sew > backup.sql

# Архив медиафайлов
tar -czf uploads.tar.gz -C /opt/litiy-sew uploads/
```

### 2. Перенос файлов

```bash
scp backup.sql uploads.tar.gz user@новый-сервер:~
```

Или через rsync (быстрее при повторных переносах):

```bash
rsync -avz --progress ./uploads/ user@новый-сервер:/opt/litiy-sew/uploads/
```

### 3. Импорт (на новом сервере)

```bash
# Распаковать медиафайлы
tar -xzf uploads.tar.gz -C /opt/litiy-sew/

# Восстановить БД (сервисы должны быть запущены)
docker compose exec -T postgres psql -U postgres litiy_sew < backup.sql
```

> **Важно:** `MEDIA_PUBLIC_URL` в `.env` должен совпадать с доменом в URL-ах, хранящихся в БД. При смене домена обновить `image_url` во всех таблицах:
> `products`, `pattern_items`, `portfolio_photos`, `hero_banners`, `site_images`, `dynamic_collection_photos`.

---

## Добавить новую колонку в существующую таблицу

`ddl-auto: update` **не** добавляет колонки в таблицы с данными. Нужен ручной ALTER:

```sql
-- подключиться к PostgreSQL
docker compose exec postgres psql -U postgres -d litiy_sew

-- пример
ALTER TABLE dynamic_collections ADD COLUMN IF NOT EXISTS category VARCHAR(16) NOT NULL DEFAULT 'COLLECTION';
```

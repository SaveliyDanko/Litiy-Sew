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

## Добавить новую колонку в существующую таблицу

`ddl-auto: update` **не** добавляет колонки в таблицы с данными. Нужен ручной ALTER:

```sql
-- подключиться к PostgreSQL
docker compose exec postgres psql -U postgres -d litiy_sew

-- пример
ALTER TABLE dynamic_collections ADD COLUMN IF NOT EXISTS category VARCHAR(16) NOT NULL DEFAULT 'COLLECTION';
```

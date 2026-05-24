# CLAUDE.md

## Контекст

E-commerce платформа по продаже одежды. Два модуля: React SPA (`frontend/`) и Spring Boot API (`backend/`).

---

## Документация

| Файл | О чём |
|---|---|
| [docs/overview.md](docs/overview.md) | Точка входа: стек, карта репо, ссылки на всё |
| [docs/architecture.md](docs/architecture.md) | Слои, потоки данных, ключевые архитектурные решения |
| [docs/frontend.md](docs/frontend.md) | Роутинг, страницы, компоненты, сервисы, хуки |
| [docs/data-model.md](docs/data-model.md) | Все сущности, таблицы, Redis-ключи |
| [docs/backend.md](docs/backend.md) | Полный API-справочник: все эндпоинты, auth flow, коды ошибок |
| [docs/local-dev.md](docs/local-dev.md) | Как запустить локально |
| [docs/feature-flags.md](docs/feature-flags.md) | Флаги сборки (`VITE_SHOP_ENABLED`) |
| [DEPLOY.md](DEPLOY.md) | Деплой на VPS через Ansible |

---

## Ключевые соглашения

**Миграции БД через Liquibase** — changelogs лежат в `backend/src/main/resources/db/changelog/`, прогоняются автоматически при старте бэкенда. Hibernate (`ddl-auto: update`) создаёт новые таблицы из `@Entity`, а всё что он не умеет (NOT NULL колонки в таблицу с данными, бэкфилл, индексы, constraints) — добавляется changeset'ом в `changes/YYYY-MM-DD-<slug>.yaml`, который подключается через include в `db.changelog-master.yaml`. Каждый changeset обязан иметь `preConditions` с `onFail: MARK_RAN` для идемпотентности и на чистом стенде, и на проде с уже применёнными изменениями.

**Два режима работы** — `VITE_SHOP_ENABLED=false` (по умолчанию): портфолио, бэкенд не нужен. `VITE_SHOP_ENABLED=true`: полный магазин, Spring Boot + PostgreSQL + Redis обязательны. Значение подставляется на этапе сборки Vite — изменение требует перезапуска dev-сервера или пересборки.

**Загрузка файлов** — все медиафайлы хранятся на диске. `MEDIA_UPLOAD_DIR` (продакшн: `/opt/litiy-sew/uploads`). Доступны по URL `/media/...`. При удалении сущности сервис вызывает `mediaService.deleteFile(imageKey)`.

**Все admin-запросы** с `credentials: 'include'` (cookie `JSESSIONID`). Доступно только роли `ADMIN`.

**Роутинг на фронте** — ручной, без React Router. Логика в `frontend/src/App.tsx` → `renderPage()`. Добавление страницы: создать файл → добавить import → добавить `if` в `renderPage()`.

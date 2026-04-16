# Release Notes

## [Unreleased]

Функциональность в разработке.

---

## v0.2.0 — 2026-04-16

### Добавлено
- Интеграция MinIO для хранения медиафайлов товаров
- `MediaService` — генерация presigned URLs для прямой загрузки с клиента
- `MediaController` — эндпоинты `POST /api/media/presign` и `DELETE /api/media`
- `MinioConfig` — конфигурация S3-клиента и S3Presigner
- `docker-compose.yml` — локальный запуск MinIO (API :9000, консоль :9001)
- `.env.example` — шаблон переменных окружения

---

## v0.1.0 — 2026-04-16

### Добавлено
- Инициализация monorepo: `frontend/` + `backend/`
- Frontend: React 19, TypeScript strict, Vite 8, ESLint
- Backend: Spring Boot 3.5, Java 21, Spring Data JPA, PostgreSQL
- Базовая структура директорий (`components`, `pages`, `services`, `hooks`, `types`, `utils`)
- Конфигурация БД в `application.yaml`
- `docs/` — директория для документации
- `frontend/references/` — директория для визуальных референсов

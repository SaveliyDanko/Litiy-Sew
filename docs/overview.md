# LitiySew — Описание проекта

## Что это

Интернет-магазин одежды. Fullstack monorepo: React SPA на фронтенде, Spring Boot REST API на бэкенде.

## Стек

| Слой       | Технологии                                      |
|------------|-------------------------------------------------|
| Frontend   | React 19, TypeScript 5.9 (strict), Vite 8       |
| Backend    | Java 21, Spring Boot 3.5, Spring Data JPA       |
| База данных| PostgreSQL 15                                   |
| Хранилище  | MinIO (S3-совместимый object storage)           |

## Структура репозитория

```
LitiySew/
├── frontend/       — React SPA
├── backend/        — Spring Boot REST API
├── docs/           — документация, release notes, заметки
├── docker-compose.yml
└── .env.example
```

## Ключевые решения

- **Медиафайлы** хранятся в MinIO (self-hosted S3). Бэкенд выдаёт presigned URL, клиент загружает напрямую — без проксирования через сервер.
- **Изображения в UI** подключаются напрямую по публичному URL MinIO: `http://localhost:9000/litiy-sew-media/<путь>`.
- **Адаптивность** — через `clamp()` и медиазапросы, без внешних UI-библиотек.
- **TypeScript strict** — no `any`, все типы явные.
- **Пакет бэкенда** — `com.litiy.backend`. Сущности в `model/entity`, DTO в `model/dto`.

## Локальный запуск

```bash
# MinIO
docker compose up -d

# Backend (http://localhost:8080)
cd backend && ./gradlew bootRun

# Frontend (http://localhost:5173)
cd frontend && npm install && npm run dev
```

База данных: PostgreSQL, база `litiy_sew`, креды по умолчанию `postgres:postgres`.

## Документация

- [minio.md](minio.md) — запуск, доступ, загрузка файлов, API

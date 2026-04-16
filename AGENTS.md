# AGENTS.md

## Контекст

E-commerce платформа по продаже одежды. Два модуля: React SPA (`frontend/`) и Spring Boot API (`backend/`).

## Для агентов

- Бэкенд слушает на порту 8080, фронтенд dev-сервер — на 5173
- БД: PostgreSQL, база `litiy_sew`
- Перед коммитом: `npm run lint` (frontend), `./gradlew test` (backend)
- Не коммитить креды и `.env` файлы

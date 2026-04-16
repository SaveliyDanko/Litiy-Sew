# CLAUDE.md

## Проект

LitiySew — интернет-магазин одежды. Monorepo: `frontend/` (React) + `backend/` (Spring Boot).

## Команды

- Frontend: `cd frontend && npm run dev` / `npm run build` / `npm run lint`
- Backend: `cd backend && ./gradlew bootRun` / `./gradlew test`

## Правила

- Backend пакет: `com.litiy.backend`
- Сущности — в `model/entity`, DTO — в `model/dto`
- Java 21, Spring Boot 3.5, PostgreSQL
- Frontend: TypeScript strict, React 19, Vite 8

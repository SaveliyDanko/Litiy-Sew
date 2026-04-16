# LitiySew

Интернет-магазин одежды. Fullstack-приложение: React (frontend) + Spring Boot (backend).

## Технологии

| Часть    | Стек                                          |
|----------|-----------------------------------------------|
| Frontend | React 19, TypeScript, Vite 8                  |
| Backend  | Java 21, Spring Boot 3.5, Spring Data JPA     |
| БД       | PostgreSQL                                    |

## Структура проекта

```
LitiySew/
├── frontend/   — React SPA
├── backend/    — Spring Boot REST API
```

## Быстрый старт

### Требования

- Node.js 20+
- Java 21+
- Gradle 8+ (wrapper включён)
- PostgreSQL 15+

### База данных

```bash
createdb litiy_sew
```

Креды по умолчанию в `backend/src/main/resources/application.yaml` — `postgres:postgres`.

### Backend

```bash
cd backend
./gradlew bootRun
```

Сервер запустится на http://localhost:8080

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Dev-сервер запустится на http://localhost:5173

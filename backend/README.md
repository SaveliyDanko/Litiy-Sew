# LitiySew — Backend

REST API для интернет-магазина одежды на Spring Boot.

## Стек

- Java 21
- Spring Boot 4.0.5
- Spring Data JPA
- Spring Security
- PostgreSQL
- Lombok
- Gradle

## Структура пакетов

`com.litiy.backend`

| Пакет          | Назначение                    |
|----------------|-------------------------------|
| `controller`   | REST-контроллеры              |
| `service`      | Бизнес-логика                 |
| `repository`   | JPA-репозитории               |
| `model.entity` | JPA-сущности                  |
| `model.dto`    | DTO для запросов и ответов    |
| `config`       | Конфигурации (Security, CORS) |
| `exception`    | Обработка ошибок              |

## Команды

```bash
./gradlew bootRun         # запуск (http://localhost:8080)
./gradlew build           # сборка JAR
./gradlew test            # тесты
docker compose up --build -d backend  # backend + postgres + redis + minio в Docker
```

## Локальный запуск

Есть два варианта запуска backend:

1. Полностью в Docker:

```bash
docker compose up --build -d backend
```

Эта команда соберёт образ backend и поднимет вместе с ним `postgres`, `redis`, `minio`, а также автоматически выполнит `minio-init` для создания бакета.

2. Локально через Gradle, оставив инфраструктуру в Docker:

```bash
docker compose up -d postgres redis minio minio-init
./gradlew bootRun
```

При локальном запуске приложение не создаёт PostgreSQL-базу автоматически. Перед `./gradlew bootRun` должна существовать база с именем из `POSTGRES_DB` (по умолчанию `litiy_sew`).

Самый короткий путь для локального `bootRun`:

```bash
docker compose up -d postgres redis minio minio-init
```

Если используете локальный PostgreSQL без Docker, создайте базу вручную:

```bash
createdb -U postgres litiy_sew
```

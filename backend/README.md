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
```
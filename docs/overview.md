# LitiySew — обзор проекта

E-commerce платформа для продажи одежды и выкроек. Работает в двух режимах:

| Режим | Флаг | Что доступно |
|---|---|---|
| **Портфолио** | `VITE_SHOP_ENABLED=false` (по умолчанию) | Главная, О себе, Коллекции, юридические страницы. Бэкенд не нужен. |
| **Магазин** | `VITE_SHOP_ENABLED=true` | + Выкройки, Корзина, Избранное, Профиль, Оформление заказа. Требует работающий бэкенд. |

Подробнее: [feature-flags.md](./feature-flags.md)

---

## Стек

| Слой | Технология |
|---|---|
| Фронтенд | React 19, TypeScript, Vite 8 |
| Бэкенд | Java 21, Spring Boot 3.5 |
| База данных | PostgreSQL 16 |
| Кэш / временные данные | Redis 7 |
| Деплой | Docker Compose + Nginx + Certbot (Ansible) |

---

## Карта репозитория

```
LitiySew/
├── frontend/          React SPA — всё что видит пользователь
├── backend/           Spring Boot API
├── docs/              Документация (этот каталог)
├── ansible/           Автоматизация деплоя на VPS
├── docker-compose.yml            Локальная разработка
├── docker-compose.prod.yml       Продакшн
├── .env.example                  Шаблон переменных окружения
└── DEPLOY.md                     Гайд по деплою
```

---

## Документация

| Файл | О чём |
|---|---|
| [architecture.md](./architecture.md) | Как всё работает: слои, потоки данных, ключевые решения |
| [frontend.md](./frontend.md) | Роутинг, страницы, компоненты, сервисы |
| [data-model.md](./data-model.md) | Все сущности и таблицы БД |
| [backend.md](./backend.md) | API-справочник: все эндпоинты, auth flow, коды ошибок |
| [local-dev.md](./local-dev.md) | Как запустить локально |
| [feature-flags.md](./feature-flags.md) | Флаги сборки Vite |
| [DEPLOY.md](../DEPLOY.md) | Деплой на VPS через Ansible |

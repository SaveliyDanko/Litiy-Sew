# LitiySew — Frontend

React SPA для интернет-магазина одежды.

## Стек

- React 19, TypeScript 5.9 (strict), Vite 8, ESLint

## Структура `src/`

```
src/
├── components/   — переиспользуемые компоненты
├── pages/        — компоненты-страницы
├── services/     — API-запросы к бэкенду (http://localhost:8080)
├── hooks/        — кастомные React-хуки
├── types/        — TypeScript типы и интерфейсы
├── utils/        — вспомогательные функции
└── styles/       — глобальные стили
```

## Команды

```bash
npm install       # установка зависимостей
npm run dev       # dev-сервер → http://localhost:5173
npm run build     # production-сборка (tsc + vite)
npm run lint      # линтинг
```

## Референсы

Визуальные референсы и примеры дизайна — в [references/](references/).

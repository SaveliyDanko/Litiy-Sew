# CLAUDE.md — Frontend

## Стек

React 19, TypeScript strict, Vite 8. Бэкенд API: `http://localhost:8080`.

## Команды

```bash
npm run dev    # dev-сервер
npm run build  # сборка
npm run lint   # линтинг (запускать перед коммитом)
```

## Правила

- TypeScript strict — no `any`, типы в `src/types/`
- API-запросы только через `src/services/`
- Компоненты — в `src/components/`, страницы — в `src/pages/`
- Глобальные стили — в `src/styles/`

## Дизайн

Визуальные референсы — в `references/`. Смотри их при реализации UI.

# MinIO — Хранилище медиафайлов

## Что это

MinIO — self-hosted S3-совместимый object storage. Используется для хранения изображений товаров и других медиафайлов. Запускается локально через Docker.

## Запуск

```bash
docker compose up -d
```

При первом запуске сервис `minio-init` автоматически:
- создаст бакет `litiy-sew-media`
- выставит публичный доступ на чтение

Данные хранятся в Docker volume `minio_data` и **не удаляются** при перезапуске контейнера.
Удалить данные можно только явно: `docker compose down -v`.

## Доступ

| Интерфейс   | URL                       | Логин   | Пароль         |
|-------------|---------------------------|---------|----------------|
| Веб-панель  | http://localhost:9001     | admin   | strongpassword |
| S3 API      | http://localhost:9000     | —       | —              |

Креды берутся из `.env` (см. `.env.example`). Если `.env` не создан — используются значения по умолчанию выше.

## Загрузка файлов через веб-панель

1. Открой http://localhost:9001
2. Войди с кредами выше
3. Перейди в бакет `litiy-sew-media`
4. Нажми **Upload** → выбери файлы
5. Публичный URL файла после загрузки:
   ```
   http://localhost:9000/litiy-sew-media/<путь/к/файлу>
   ```

## Структура бакета

```
litiy-sew-media/
├── hero/           — фоновые изображения главной страницы
├── products/       — фото товаров
└── collections/    — обложки коллекций
```

## Загрузка файлов через API (для фронтенда)

Прямая загрузка файла на фронтенде без проксирования через бэкенд:

```typescript
// 1. Получить presigned URL у бэкенда
const res = await fetch('/api/media/presign', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ filename: file.name, contentType: file.type }),
});
const { uploadUrl, publicUrl } = await res.json();

// 2. Загрузить файл напрямую в MinIO
await fetch(uploadUrl, {
  method: 'PUT',
  body: file,
  headers: { 'Content-Type': file.type },
});

// 3. publicUrl сохранить в БД через бэкенд
```

### Эндпоинты бэкенда

| Метод  | URL                  | Описание                                 |
|--------|----------------------|------------------------------------------|
| POST   | `/api/media/presign` | Получить presigned URL для загрузки      |
| DELETE | `/api/media?key=...` | Удалить файл по ключу (путь в бакете)    |

### Тело запроса `POST /api/media/presign`

```json
{ "filename": "photo.jpg", "contentType": "image/jpeg" }
```

### Ответ

```json
{
  "uploadUrl": "http://localhost:9000/litiy-sew-media/uuid/photo.jpg?X-Amz-...",
  "publicUrl": "http://localhost:9000/litiy-sew-media/uuid/photo.jpg",
  "key": "uuid/photo.jpg"
}
```

## Смена кредов

Создай `.env` в корне проекта (скопируй из `.env.example`):

```bash
cp .env.example .env
```

Отредактируй значения и перезапусти:

```bash
docker compose down && docker compose up -d
```

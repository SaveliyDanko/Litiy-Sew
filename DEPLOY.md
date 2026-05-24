# Гайд по деплою LitiySew на VPS

## Оглавление

1. [Требования](#1-требования)
2. [Подготовка локальной машины](#2-подготовка-локальной-машины)
3. [Подготовка VPS](#3-подготовка-vps)
4. [Настройка Ansible](#4-настройка-ansible)
5. [SSL-сертификат](#5-ssl-сертификат)
6. [Первый деплой](#6-первый-деплой)
7. [Обновление приложения](#7-обновление-приложения)
8. [Управление на сервере](#8-управление-на-сервере)
9. [Диагностика проблем](#9-диагностика-проблем)
10. [Админка](#10-админка)

---

## 1. Требования

### Локальная машина
- Python 3.8+
- Ansible 2.14+
- **JDK 21** (для локальной сборки backend через `./gradlew bootJar`).
  Сборка происходит на dev-машине, на VPS улетает уже готовый `.jar` —
  это экономит ~10 минут деплоя и не упирается в RAM сервера.
- Node.js + npm — для сборки frontend (`npm run build`)
- SSH-ключ для доступа к VPS

### VPS
- Ubuntu 22.04 / 24.04
- Минимум 1 GB RAM, 20 GB диск (раньше нужно было 2 GB из-за on-server Gradle)
- Открытые порты: 22 (SSH), 80 (HTTP), 443 (HTTPS)

### Домен
- `litiy.site` — A-запись должна указывать на IP VPS до первого запуска
- Certbot проверяет домен через HTTP (порт 80), без этого сертификат не выдаётся

---

## 2. Подготовка локальной машины

### Установить Ansible и коллекции

```bash
pip install ansible bcrypt
ansible-galaxy collection install community.docker community.general
```

> `bcrypt` нужен на локальной машине: Ansible использует его для хеширования пароля admin-пользователя перед записью в PostgreSQL.

### Проверить SSH-доступ к VPS

```bash
ssh ubuntu@YOUR_VPS_IP
```

Если ключ ещё не добавлен на сервер:

```bash
ssh-copy-id -i ~/.ssh/id_rsa.pub ubuntu@YOUR_VPS_IP
```

---

## 3. Подготовка VPS

На свежем сервере достаточно иметь пользователя с правами `sudo`. Ansible сделает всё остальное автоматически:

- обновит пакеты и установит базовые утилиты
- настроит файрвол UFW (разрешит 22, 80, 443)
- создаст системного пользователя `litiy-sew`
- установит Docker Engine + Compose plugin
- установит Nginx и Certbot
- получит SSL-сертификат Let's Encrypt для `litiy.site`
- настроит автообновление сертификата по cron (каждый понедельник в 03:00)

---

## 4. Настройка Ansible

### 4.1. Заполнить inventory

Открыть [ansible/inventory.ini](ansible/inventory.ini) и вставить реальные данные:

```ini
[vps]
litiy-sew ansible_host=1.2.3.4 ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/id_rsa
```

| Параметр | Описание |
|---|---|
| `ansible_host` | IP-адрес VPS |
| `ansible_user` | Пользователь с sudo (обычно `ubuntu` или `root`) |
| `ansible_ssh_private_key_file` | Путь к приватному SSH-ключу |

### 4.2. Публичные переменные

Домен и email уже прописаны в [ansible/group_vars/vps.yml](ansible/group_vars/vps.yml):

```yaml
domain: litiy.site
certbot_email: dankosaveliy.m@gmail.com
```

Менять не нужно.

### 4.3. Создать vault с секретами

Vault **обязан лежать в `ansible/group_vars/vps/vault.yml`** — тогда Ansible автоматически подхватывает его для хоста `vps`.

```bash
cp ansible/vault.yml.example ansible/group_vars/vps/vault.yml
```

Открыть `ansible/group_vars/vps/vault.yml` и заменить все `CHANGE_ME` на реальные значения:

```yaml
postgres_password: "StrongPassword123"
redis_password: ""                      # можно оставить пустым
mail_username: "yourmail@gmail.com"
mail_password: "gmail-app-password"     # App Password, не обычный пароль
mail_from: "yourmail@gmail.com"
admin_email: "your@email.com"           # email для входа в /admin
admin_password: "StrongAdminPassword"   # пароль для входа в /admin (мин. 8 символов)
```

> Ansible автоматически создаст или обновит admin-пользователя при каждом запуске `site.yml` и `deploy.yml`.
> Для смены кредов достаточно изменить значения в vault и перезапустить `deploy.yml` — или поменять прямо в браузере через вкладку **Настройки** в `/admin`.

> **Gmail:** нужен App Password, не обычный пароль аккаунта.
> Создать: Google Account → Security → 2-Step Verification → App passwords

Зашифровать vault:

```bash
ansible-vault encrypt ansible/group_vars/vps/vault.yml
```

Придумать и запомнить vault-пароль — он понадобится при каждом запуске плейбука.

> `ansible/group_vars/vps/vault.yml` добавлен в `.gitignore`. Никогда не коммить незашифрованный файл.

---

## 5. SSL-сертификат

SSL выдаётся автоматически через **Let's Encrypt** при первом запуске плейбука. Процесс:

1. Nginx поднимается с HTTP-конфигом на порту 80
2. Certbot обращается к `http://litiy.site/.well-known/acme-challenge/` для верификации домена
3. После успешной проверки выдаётся сертификат в `/etc/letsencrypt/live/litiy.site/`
4. Nginx переключается на HTTPS-конфиг:
   - порт 80 → редирект на 443
   - порт 443 → HTTPS с сертификатом Let's Encrypt

### Что получается в итоге

```
http://litiy.site  →  301  →  https://litiy.site   (Nginx редирект)
https://litiy.site →  React SPA (frontend/dist)
https://litiy.site/api/  →  Spring Boot :8080
```

### Автообновление сертификата

Сертификат Let's Encrypt действует 90 дней. Ansible настраивает cron-задачу:

```
0 3 * * 1   certbot renew --quiet --post-hook 'systemctl reload nginx'
```

Каждый понедельник в 03:00 certbot проверяет, нужно ли обновление (обновляет, если осталось < 30 дней), и перезагружает Nginx.

### Проверить сертификат вручную

```bash
# На сервере:
sudo certbot certificates

# Вывод:
# Certificate Name: litiy.site
#   Domains: litiy.site
#   Expiry Date: 2025-08-15 (VALID: 89 days)
#   Certificate Path: /etc/letsencrypt/live/litiy.site/fullchain.pem
```

---

## 6. Первый деплой

Перед запуском убедиться:
- A-запись `litiy.site` указывает на IP VPS (`dig litiy.site`)
- inventory заполнен, vault создан и зашифрован

> **Все ansible-команды запускать из папки `ansible/`** — там лежит `ansible.cfg` с нужными настройками.

```bash
cd ansible
ansible-playbook site.yml --ask-vault-pass
```

Плейбук выполнит по порядку:

| Шаг | Что происходит |
|---|---|
| `common` | Обновление apt, базовые пакеты, UFW, системный пользователь |
| `docker` | Установка Docker Engine + Compose plugin |
| `nginx` | Nginx, HTTP-конфиг → Certbot SSL → HTTPS-конфиг |
| `app` | Rsync кода, `npm run build`, `docker compose up --build` |

Время выполнения: ~5–10 минут.

После успешного завершения сайт доступен по **https://litiy.site**.

---

## 7. Обновление приложения

После изменений в коде:

```bash
cd ansible
ansible-playbook deploy.yml --ask-vault-pass
```

Этот плейбук **не трогает** Docker-установку, Nginx и сертификаты — только:

1. **Локально** собирает backend (`./gradlew bootJar`) — нужен JDK 21 на dev-машине
2. Заливает на VPS `backend/Dockerfile` + `backend/build/libs/*.jar` + папку миграций
3. Синхронизирует frontend на VPS и пересобирает (`npm run build`)
4. Пересобирает Docker-образ backend (runtime-only, без Gradle) и перезапускает контейнеры
5. Перезагружает Nginx

Время выполнения: ~2–4 минуты (раньше было 10–15 из-за Gradle на VPS).

---

## 8. Управление на сервере

Подключиться к VPS:

```bash
ssh ubuntu@YOUR_VPS_IP
```

### Контейнеры

```bash
# Статус всех контейнеров
sudo -u litiy-sew docker compose -f /opt/litiy-sew/docker-compose.yml ps

# Логи backend (live)
sudo -u litiy-sew docker compose -f /opt/litiy-sew/docker-compose.yml logs -f backend

# Логи конкретного сервиса
sudo -u litiy-sew docker compose -f /opt/litiy-sew/docker-compose.yml logs -f postgres

# Рестарт отдельного сервиса
sudo -u litiy-sew docker compose -f /opt/litiy-sew/docker-compose.yml restart backend

# Полная остановка
sudo -u litiy-sew docker compose -f /opt/litiy-sew/docker-compose.yml down

# Запуск после остановки
sudo -u litiy-sew docker compose -f /opt/litiy-sew/docker-compose.yml up -d
```

### Nginx

```bash
# Проверить конфиг
sudo nginx -t

# Перезагрузить без даунтайма
sudo systemctl reload nginx

# Статус
sudo systemctl status nginx
```

### SSL-сертификат

```bash
# Статус и срок действия
sudo certbot certificates

# Принудительное обновление (обычно не нужно — автоматически по cron)
sudo certbot renew --force-renewal --post-hook 'systemctl reload nginx'
```

### Структура файлов на VPS

```
/opt/litiy-sew/
├── backend/          # исходники Spring Boot
├── frontend/
│   └── dist/         # собранный React SPA (отдаётся Nginx)
├── docker-compose.yml
└── .env              # production-секреты (генерируется Ansible)
```

---

## 9. Диагностика проблем

### Сайт не открывается

```bash
# Проверить что Nginx слушает 80/443
sudo ss -tlnp | grep nginx

# Проверить UFW
sudo ufw status

# Проверить конфиг Nginx
sudo nginx -t
sudo cat /etc/nginx/sites-enabled/litiy-sew
```

### Backend не отвечает (502 Bad Gateway)

```bash
# Проверить что контейнер запущен
sudo -u litiy-sew docker compose -f /opt/litiy-sew/docker-compose.yml ps

# Посмотреть логи на ошибки при старте
sudo -u litiy-sew docker compose -f /opt/litiy-sew/docker-compose.yml logs backend

# Проверить что порт 8080 слушается
sudo ss -tlnp | grep 8080
```

### Ошибка Certbot при первом деплое

```bash
# Проверить что домен резолвится в IP сервера
dig litiy.site

# Проверить что порт 80 доступен снаружи
curl -I http://litiy.site
```

Частые причины:
- A-запись ещё не распространилась (подождать до 10 минут)
- Порт 80 закрыт в настройках хостинга/файрволе VPS-провайдера
- На порту 80 уже что-то запущено (`sudo ss -tlnp | grep :80`)

### Ошибка при ansible-playbook

```bash
# Запустить с подробным выводом
cd ansible && ansible-playbook site.yml --ask-vault-pass -vv

# Проверить доступность сервера
cd ansible && ansible vps -m ping
```

### Пересоздать контейнеры с нуля (крайняя мера)

```bash
sudo -u litiy-sew docker compose -f /opt/litiy-sew/docker-compose.yml down -v
sudo -u litiy-sew docker compose -f /opt/litiy-sew/docker-compose.yml up -d --build
```

> `-v` удаляет Docker volumes — **все данные БД будут потеряны.**

---

## 10. Админка

Админка доступна по адресу **https://litiy.site/admin** — только для пользователей с ролью `ADMIN`.

### 10.1. Деплой (первый раз или после изменений кода)

Если сервер уже поднят (`site.yml` отработал ранее), достаточно запустить быстрый re-deploy:

```bash
cd ansible && ansible-playbook deploy.yml --ask-vault-pass
```

Плейбук пересоберёт backend и frontend, новые таблицы (`products`, `pattern_items`, `portfolio_photos`, `hero_banners`) создадутся автоматически при старте Spring Boot (через `ddl-auto: update`).

### 10.2. Локальное тестирование

Запустить docker-compose для инфраструктуры (PostgreSQL, Redis):

```bash
docker compose up -d postgres redis
```

Задать переменные окружения с кредами для локального теста:

```bash
export ADMIN_EMAIL=admin@example.com
export ADMIN_PASSWORD=testpassword
```

Запустить backend:

```bash
cd backend && ./gradlew bootRun
```

Создать ADMIN вручную в локальной БД (один раз):

```bash
docker compose exec postgres psql -U postgres -d litiy_sew \
  -c "INSERT INTO users (email, password_hash, email_verified, role, created_at)
      VALUES ('admin@example.com', '\$2a\$12\$...bcrypt_hash...', true, 'ADMIN', NOW())
      ON CONFLICT (email) DO UPDATE SET role = 'ADMIN';"
```

> Или зарегистрируйтесь на сайте, а потом обновите роль через SQL — это проще при первом запуске локально.

Запустить frontend:

```bash
cd frontend && npm run dev
```

Открыть **http://localhost:5173/admin**.

### 10.3. Что умеет админка

| Вкладка | Действия |
|---|---|
| **Товары** | Добавить (фото + название + цена + описание), удалить |
| **Выкройки** | Добавить (фото + категория + размеры + рост + цена), удалить |
| **Портфолио** | Добавить фото (опционально подпись), изменить порядок ↑↓, удалить |
| **Баннер** | Загрузить/заменить hero-фото главной страницы, удалить |
| **Настройки** | Изменить email и/или пароль для входа в админку |

### 10.4. Публичные API для отображения на сайте

Эти эндпоинты доступны без авторизации и возвращают контент, добавленный через админку:

```
GET /api/products    — список товаров
GET /api/patterns    — список выкроек
GET /api/portfolio   — фото портфолио (отсортированы по sortOrder)
GET /api/hero        — текущий баннер (204 если не установлен)
```

### 10.5. Диагностика

**Админка не открывается (редирект на главную)**
— Пользователь не залогинен или роль не `ADMIN`. Проверить, что `admin_email` / `admin_password` заданы в vault и `deploy.yml` отработал успешно.

**403 при запросах к `/api/admin/**`**
— Сессия не передаётся. Убедиться, что браузер отправляет куки (`credentials: include` уже проставлено в коде).

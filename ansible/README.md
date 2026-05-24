# Ansible — деплой LitiySew на VPS

> Полный гайд (с подробностями про SSL, диагностику, админку) — в [../DEPLOY.md](../DEPLOY.md).
> Этот файл — краткая шпаргалка по командам.

---

## Структура

```
ansible/
├── site.yml              # Полный provision + deploy (первый запуск или смена сервера)
├── deploy.yml            # Быстрый re-deploy кода (без provision)
├── backup.yml            # Скачать БД + медиафайлы с VPS на локальный ПК
├── restore.yml           # Восстановить из бэкапа на чистый VPS
├── migrate.yml           # Перенос данных с локальной dev-БД на VPS (опасный!)
├── inventory.ini         # IP / SSH-доступ к VPS
├── ansible.cfg           # Локальные настройки Ansible
├── group_vars/
│   └── vps/
│       ├── vars.yml      # Публичные переменные (домен, пути, postgres_db, ...)
│       └── vault.yml     # Зашифрованные секреты (gitignore'd!)
├── vault.yml.example     # Шаблон секретов — копируется в vps/vault.yml
└── roles/
    ├── common/           # apt update, UFW, системный пользователь litiy-sew
    ├── docker/           # Docker Engine + compose plugin
    ├── nginx/            # Nginx config + Certbot SSL
    └── app/              # Заливка кода, npm build, docker compose up
```

Миграции схемы БД лежат **в jar приложения** (`backend/src/main/resources/db/changelog/`)
и прогоняются Liquibase при старте бэка — ansible-роли их не трогают.

---

## Требования на локальной машине

```bash
# Ansible
pip install ansible bcrypt
ansible-galaxy collection install community.docker community.general
```

Плюс установлены:

- **JDK 21** — для `./gradlew bootJar` (ansible собирает backend jar локально
  и отправляет на VPS только готовый артефакт).
- **Node.js + npm** — для сборки frontend.
- **rsync** и **ssh-клиент** (обычно уже есть).

VPS — Ubuntu 22.04 / 24.04, минимум 1 GB RAM, открытые 22 / 80 / 443.

---

## Первый запуск (provision + deploy)

### 1. Заполни inventory

```ini
# ansible/inventory.ini
[vps]
litiy-sew ansible_host=1.2.3.4 ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/id_rsa
```

### 2. Заполни публичные переменные

[ansible/group_vars/vps/vars.yml](group_vars/vps/vars.yml) — домен, email для Certbot
уже выставлены. Если меняешь домен — правишь здесь.

### 3. Создай vault с секретами

```bash
cp ansible/vault.yml.example ansible/group_vars/vps/vault.yml
# Отредактируй: postgres_password, mail_*, admin_email, admin_password
ansible-vault encrypt ansible/group_vars/vps/vault.yml
```

> Vault **обязан** лежать именно в `ansible/group_vars/vps/vault.yml` — тогда Ansible
> автоматически подхватит его для группы хостов `vps`.

### 4. Убедись что DNS и фаервол готовы

- A-запись домена указывает на IP VPS (`dig +short litiy.site A`).
- **AAAA-запись отсутствует** (или указывает на рабочий IPv6) — иначе Certbot
  «secondary validation» зафейлится.
- Порт 80 открыт **И в UFW на сервере, И в фаерволе хостинг-провайдера**
  (это разные слои!).

### 5. Запусти provision

```bash
cd ansible
ansible-playbook site.yml --ask-vault-pass
```

Что делает:

1. `common` — apt update, UFW, создаёт пользователя `litiy-sew`.
2. `docker` — ставит Docker Engine + compose plugin.
3. `nginx` — HTTP-конфиг → Certbot SSL → HTTPS-конфиг с HTTP/2.
4. `app` — собирает jar локально, заливает на VPS, поднимает контейнеры
   (postgres, redis, backend) через docker compose.

Время выполнения: ~5–10 минут.

---

## Обновление приложения (re-deploy)

Когда изменился только код, без provision-шагов:

```bash
cd ansible
ansible-playbook deploy.yml --ask-vault-pass
```

| Что | `deploy.yml` делает |
|---|---|
| Backend код | ✅ собирает jar локально (`./gradlew bootJar`), копирует на VPS |
| Frontend код | ✅ синхронизирует, пересобирает `npm run build` на VPS |
| Docker-образ backend | ✅ пересобирает (`--no-cache`, чтобы buildkit не цеплял протухший `.dockerignore`) |
| Nginx config | ❌ не трогает (для этого `site.yml`) |
| SSL-сертификаты | ❌ не трогает |
| Медиа `/opt/litiy-sew/uploads/` | ❌ не трогает |
| База PostgreSQL | ❌ не трогает данные; **Liquibase сам прогонит новые changesets при старте бэка** |

Время выполнения: ~2–4 минуты.

### Миграции схемы БД

Никаких ручных `psql -f` или ALTER TABLE больше не нужно. Когда в `@Entity`
появляется новое поле или нужна реструктуризация:

1. Пишешь changeset в `backend/src/main/resources/db/changelog/changes/YYYY-MM-DD-<slug>.yaml`.
2. Подключаешь его через `include` в `db.changelog-master.yaml`.
3. Деплоишь обычным `deploy.yml` — Liquibase прогонит при старте контейнера.

Каждый changeset обязан иметь `preConditions` с `onFail: MARK_RAN` для
идемпотентности. Подробности — в [CLAUDE.md](../CLAUDE.md).

---

## Бэкап (VPS → локальный ПК)

```bash
cd ansible
ansible-playbook backup.yml --ask-vault-pass
```

Результат:

```
backups/
└── 2026-05-24/
    ├── db.sql.gz   — сжатый дамп PostgreSQL
    └── uploads/    — медиафайлы
```

`backups/` в `.gitignore`. Делай это перед любыми рискованными изменениями.

---

## Восстановление / перенос данных

Используется когда: переехал на новый VPS / разворачиваешь чистый стенд / откатываешься.

```bash
cd ansible

# 1. Полный provision (если VPS чистый)
ansible-playbook site.yml --ask-vault-pass

# 2a. Восстановить из бэкапа, который ты скачал через backup.yml
ansible-playbook restore.yml --ask-vault-pass -e "backup_dir=../backups/2026-05-24"

# 2b. ИЛИ — залить данные прямо с локальной dev-БД (опасный, перетирает прод!)
ansible-playbook migrate.yml --ask-vault-pass
```

| | `restore.yml` | `migrate.yml` |
|---|---|---|
| Откуда берёт БД | `backups/<date>/db.sql.gz` | `pg_dump` твоей локальной dev-БД |
| Откуда берёт медиа | `backups/<date>/uploads/` | `MEDIA_UPLOAD_DIR` или `/opt/litiy-sew/uploads` |
| Когда использовать | переезд / откат на ранее снятый снимок | первый деплой dev → prod |

⚠ Оба playbook'а **перетирают** существующие данные на VPS. На работающем
проде запускать НЕ нужно — для нового кода используется `deploy.yml`.

Оба автоматически переписывают URL картинок в БД (`localhost`/старый домен → `media_public_url` из vars.yml).

---

## Архитектура на VPS

```
Internet
   │ 80 (redirect) / 443
   ▼
 Nginx (host)
   ├── /       → /opt/litiy-sew/frontend/dist            (статика React SPA)
   ├── /api/   → 127.0.0.1:8080                          (Spring Boot backend)
   └── /media/ → /opt/litiy-sew/uploads                  (загруженные фото)

Docker (внутренняя сеть litiy-sew_default):
  backend  → :8080  ─→ postgres:5432
                    └→ redis:6379
  postgres → volume litiy-sew_postgres_data
  redis    → volume litiy-sew_redis_data
```

Все порты Docker биндятся на `127.0.0.1` — наружу торчат только 443 nginx.
Структура файлов:

```
/opt/litiy-sew/
├── backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   └── build/libs/backend-*.jar     # заливается из локальной сборки
├── frontend/dist/                   # собранный SPA (отдаётся nginx)
├── uploads/                         # медиафайлы (mount в backend контейнер)
├── docker-compose.yml
└── .env                             # production-секреты (генерируется Ansible)
```

---

## Полезные команды на VPS

```bash
# Статус контейнеров
sudo -u litiy-sew docker compose -f /opt/litiy-sew/docker-compose.yml ps

# Логи backend (live)
sudo -u litiy-sew docker compose -f /opt/litiy-sew/docker-compose.yml logs -f backend

# Лог Liquibase при старте (грепаем мигрэйшен-вывод)
sudo -u litiy-sew docker logs litiy-sew-backend 2>&1 | grep -i liquibase

# Ручной рестарт сервиса
sudo -u litiy-sew docker compose -f /opt/litiy-sew/docker-compose.yml restart backend

# Подключиться к Postgres
sudo -u litiy-sew docker compose -f /opt/litiy-sew/docker-compose.yml exec postgres psql -U postgres -d litiy_sew
```

---

## Диагностика — частые проблемы

**Certbot падает с timeout на `/.well-known/acme-challenge/`**
→ Закрыт 80 в фаерволе провайдера (не UFW!) или есть AAAA-запись на нерабочий IPv6.
См. подробности в [DEPLOY.md](../DEPLOY.md) → раздел 9.

**Docker build: `transferring context: 2B`**
→ Buildkit зацепил протухший `.dockerignore`. В ansible уже стоит `nocache: true`,
но если ловишь это снова — `docker compose build --no-cache backend` вручную на VPS.

**Backend стартует, но 500 на API**
→ Смотри `docker logs litiy-sew-backend`. Часто это Liquibase нашёл конфликт
(changeset уже выполнен с другим checksum). Проверь таблицу `databasechangelog`.

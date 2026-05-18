# Ansible — деплой LitiySew на VPS

## Структура

```
ansible/
├── site.yml              # Полный provision + deploy (первый запуск)
├── deploy.yml            # Быстрый re-deploy (без provision)
├── inventory.ini         # Адрес VPS и SSH-пользователь
├── group_vars/
│   └── vps.yml           # Публичные переменные
├── vault.yml             # Зашифрованные секреты (git-ignore!)
├── vault.yml.example     # Шаблон секретов
└── roles/
    ├── common/           # Базовые пакеты, UFW, системный пользователь
    ├── docker/           # Docker Engine + Compose plugin
    ├── nginx/            # Nginx + Certbot + шаблоны конфигов
    └── app/              # Rsync кода, сборка frontend, docker compose up
```

---

## Первый запуск (provision + deploy)

### 1. Заполни inventory

```ini
# ansible/inventory.ini
[vps]
litiy-sew ansible_host=1.2.3.4 ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/id_rsa
```

### 2. Заполни переменные

```yaml
# ansible/group_vars/vps.yml
domain: yourdomain.com
certbot_email: you@example.com
```

### 3. Создай vault с секретами

```bash
cp ansible/vault.yml.example ansible/vault.yml
# Отредактируй vault.yml — вставь реальные пароли
ansible-vault encrypt ansible/vault.yml
```

### 4. Запусти provision

```bash
ansible-playbook -i ansible/inventory.ini ansible/site.yml --ask-vault-pass
```

Это сделает:
- установит Docker, Nginx, Certbot
- получит SSL-сертификат Let's Encrypt
- соберёт и задеплоит frontend + backend

---

## Обновление (re-deploy)

После изменений в коде:

```bash
ansible-playbook -i ansible/inventory.ini ansible/deploy.yml --ask-vault-pass
```

Это сделает:
- синхронизирует исходники по rsync
- пересоберёт frontend (`npm run build`)
- пересоберёт Docker-образ backend и перезапустит контейнеры
- перезагрузит Nginx

---

## Архитектура на VPS

```
Internet
   │ 80 / 443
   ▼
 Nginx
   ├── / → /opt/litiy-sew/frontend/dist   (статика React SPA)
   ├── /api/ → 127.0.0.1:8080             (Spring Boot backend)
   └── /media/ → 127.0.0.1:9000           (MinIO объекты)

Docker (внутренняя сеть):
  backend:8080 ← postgres:5432, redis:6379, minio:9000
```

Все порты Docker биндятся только на `127.0.0.1` — наружу не торчат.

---

## Полезные команды на VPS

```bash
# Статус контейнеров
sudo -u litiy-sew docker compose -f /opt/litiy-sew/docker-compose.yml ps

# Логи backend
sudo -u litiy-sew docker compose -f /opt/litiy-sew/docker-compose.yml logs -f backend

# Ручной рестарт
sudo -u litiy-sew docker compose -f /opt/litiy-sew/docker-compose.yml restart backend
```

---

## Требования на локальной машине

```bash
pip install ansible
ansible-galaxy collection install community.docker community.general
```

# Remna Traffic Usage

Микросервис для получения статистики платного трафика пользователей по узлам за текущий месяц.

## Описание

Сервис предоставляет REST API для получения информации о пользователях, которые использовали платный трафик на определенных узлах (nodes) в течение текущего календарного месяца.

## API

### GET /

Получить статистику использования трафика пользователями.

**Query параметры:**
- `nodes` (required) - список UUID узлов, разделенных запятыми

**Пример запроса:**
```bash
# Без авторизации (если BASIC_AUTH_USER и BASIC_AUTH_PASSWORD не установлены)
curl "http://localhost:3000/?nodes=961d0439-29a7-42ba-9174-9a0974a12adf,7542394a-7929-4409-a2a1-58e98fa2c6b5"

# С авторизацией
curl -u admin:secret "http://localhost:3000/?nodes=961d0439-29a7-42ba-9174-9a0974a12adf,7542394a-7929-4409-a2a1-58e98fa2c6b5"
```

**Пример успешного ответа:**
```json
{
  "success": true,
  "data": [
    {
      "user_uuid": "123e4567-e89b-12d3-a456-426614174000",
      "username": "john_doe",
      "paid_traffic": "1073741824"
    }
  ]
}
```

**Пример ошибки:**
```json
{
  "success": false,
  "error": "Parameter \"nodes\" is required"
}
```

## Требования

- Node.js 20+
- PostgreSQL 16+
- Docker & Docker Compose (опционально)

## Установка

### Локально

1. Установите зависимости:
```bash
npm install
```

2. Скопируйте файл с переменными окружения:
```bash
cp .env.example .env
```

3. Настройте переменные окружения в `.env`

4. Запустите приложение:
```bash
npm start
```

### Docker Compose

1. Запустите все сервисы:
```bash
docker-compose up -d
```

Сервис будет доступен на `http://localhost:3000`

## Переменные окружения

| Переменная | Описание | По умолчанию |
|------------|----------|--------------|
| `PORT` | Порт приложения | `3000` |
| `BASIC_AUTH_USER` | Имя пользователя для Basic Auth (опционально) | - |
| `BASIC_AUTH_PASSWORD` | Пароль для Basic Auth (опционально) | - |
| `DB_HOST` | Хост PostgreSQL | `localhost` |
| `DB_PORT` | Порт PostgreSQL | `5432` |
| `DB_NAME` | Имя базы данных | `postgres` |
| `DB_USER` | Пользователь БД | `postgres` |
| `DB_PASSWORD` | Пароль БД | `postgres` |

**Примечание:** Если `BASIC_AUTH_USER` и `BASIC_AUTH_PASSWORD` не установлены, авторизация отключена.

## Структура базы данных

Сервис работает с следующими таблицами:

- `nodes` - информация об узлах
- `users` - информация о пользователях
- `nodes_user_usage_history` - история использования трафика

## Разработка

### Запуск в dev режиме

```bash
npm start
```

### Сборка Docker образа

```bash
docker build -t remna-traffic-usage .
```

## CI/CD

Проект использует GitHub Actions для автоматической сборки Docker образа при push в ветку `master`.

## Лицензия

MIT

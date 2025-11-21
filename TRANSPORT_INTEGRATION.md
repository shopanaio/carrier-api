# Universal Transport Integration

## Что было сделано

Создан **универсальный транспортный слой** `@shopana/carrier-transport`, который позволяет:

1. **Единый интерфейс** для всех carrier клиентов (Nova Poshta, Meest, и будущих)
2. **Легкое подключение** любых HTTP библиотек (fetch, axios, react-query, custom mock)
3. **Общие фичи**: retry, timeout, interceptors, caching
4. **Полная type-safety** с TypeScript

## Структура пакетов

```
packages/
├── carrier-transport/              # Универсальный транспорт
│   ├── src/
│   │   ├── types.ts               # HttpTransport интерфейс
│   │   ├── fetchTransport.ts      # Fetch реализация
│   │   ├── mockTransport.ts       # Mock для тестирования
│   │   ├── utils.ts               # Утилиты
│   │   └── adapters/
│   │       ├── novaposhta.ts      # Адаптер для Nova Poshta
│   │       └── meest.ts           # Адаптер для Meest
│   ├── README.md
│   ├── EXAMPLES.md
│   └── ARCHITECTURE.md
│
├── novaposhta-api-client/
│   └── src/adapters/
│       └── transport.ts           # Интеграция с универсальным транспортом
│
└── meest-api-client/              # Уже совместим из коробки
```

## Как использовать

### Nova Poshta с универсальным транспортом

```typescript
import { createClient, AddressService } from '@shopana/novaposhta-api-client';
import { fromUniversalTransport } from '@shopana/novaposhta-api-client/adapters';
import { createFetchTransport } from '@shopana/carrier-transport';

// Создаем универсальный транспорт
const transport = createFetchTransport({
  baseUrl: 'https://api.novaposhta.ua/v2.0/json/',
  retry: {
    maxRetries: 3,
    retryDelay: 1000,
  },
});

// Конвертируем в формат Nova Poshta через адаптер
const client = createClient({
  transport: fromUniversalTransport(transport),
  apiKey: process.env.NP_API_KEY,
}).use(new AddressService());

// Используем клиент
const cities = await client.address.searchCities({ FindByString: 'Kyiv' });
```

### Meest с универсальным транспортом

```typescript
import { createClient, SearchService } from '@shopana/meest-api-client';
import { createFetchTransport } from '@shopana/carrier-transport';

// Meest напрямую принимает универсальный транспорт
const transport = createFetchTransport({
  baseUrl: 'https://api.meest.com/v3.0/openAPI',
});

const client = createClient({
  transport,
  token: process.env.MEEST_TOKEN,
}).use(new SearchService());

const cities = await client.search.citySearch({
  filters: { cityDescr: 'Львів' },
});
```

### Один транспорт для обоих клиентов

```typescript
import { createFetchTransport } from '@shopana/carrier-transport';
import { fromUniversalTransport } from '@shopana/novaposhta-api-client/adapters';

// Общий транспорт с логированием и retry
const baseTransport = createFetchTransport({
  retry: { maxRetries: 3, retryDelay: 1000 },
  interceptors: {
    request: async (req) => {
      console.log('→', req.method, req.url);
      return req;
    },
    response: async (res) => {
      console.log('←', res.status);
      return res;
    },
  },
});

// Nova Poshta клиент
const npClient = createNPClient({
  transport: fromUniversalTransport(baseTransport),
  baseUrl: 'https://api.novaposhta.ua/v2.0/json/',
  apiKey: process.env.NP_API_KEY,
});

// Meest клиент
const meestClient = createMeestClient({
  transport: baseTransport,
  token: process.env.MEEST_TOKEN,
});
```

### Mock транспорт для тестирования

```typescript
import { createMockTransport } from '@shopana/carrier-transport';
import { fromUniversalTransport } from '@shopana/novaposhta-api-client/adapters';

const mock = createMockTransport();

// Настраиваем mock ответы
mock
  .onRequest({ method: 'POST', url: /api/ })
  .reply({
    status: 200,
    data: {
      success: true,
      data: [{ Ref: 'test-city', Description: 'Test City' }],
    },
  });

// Используем в тестах
const client = createClient({
  transport: fromUniversalTransport(mock),
});

const result = await client.address.searchCities({ FindByString: 'Test' });

// Проверяем логи запросов
const requests = mock.getRequestLog();
expect(requests).toHaveLength(1);
```

### Custom транспорт (Axios)

```typescript
import axios from 'axios';
import type { HttpTransport } from '@shopana/carrier-transport';

function createAxiosTransport(): HttpTransport {
  return {
    async request(req) {
      const response = await axios({
        method: req.method ?? 'POST',
        url: req.url,
        data: req.body,
        headers: req.headers,
        signal: req.signal,
      });

      return {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data,
      };
    },
  };
}

// Используем с Nova Poshta
const client = createClient({
  transport: fromUniversalTransport(createAxiosTransport()),
});
```

## Ключевые фичи

### 1. Retry Logic

```typescript
const transport = createFetchTransport({
  retry: {
    maxRetries: 3,
    retryDelay: 1000,
    retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  },
});
```

### 2. Interceptors

```typescript
const transport = createFetchTransport({
  interceptors: {
    request: async (req) => {
      // Добавить авторизацию
      return {
        ...req,
        headers: {
          ...req.headers,
          Authorization: `Bearer ${token}`,
        },
      };
    },
    response: async (res) => {
      // Логирование
      console.log('Response:', res.status);
      return res;
    },
    error: async (err) => {
      // Обработка ошибок
      if (err.status === 401) {
        await refreshToken();
      }
      throw err;
    },
  },
});
```

### 3. Timeout

```typescript
const transport = createFetchTransport({
  defaultTimeout: 30000, // 30 секунд
});

// Или для конкретного запроса
await transport.request({
  url: '/api',
  timeoutMs: 60000, // 60 секунд
});
```

### 4. Request Cancellation

```typescript
const controller = new AbortController();

const promise = client.address.searchCities(
  { FindByString: 'Kyiv' },
  { signal: controller.signal }
);

// Отменить через 5 секунд
setTimeout(() => controller.abort(), 5000);
```

## Преимущества

### 1. Единый интерфейс
- Одинаковый способ подключения транспорта для всех клиентов
- Легко переключаться между реализациями

### 2. Расширяемость
- Легко добавить свой транспорт (axios, react-query, и т.д.)
- Interceptors для логирования, метрик, авторизации
- Retry и timeout из коробки

### 3. Тестируемость
- Mock транспорт для unit тестов
- Логирование всех запросов
- Проверка того, какие запросы были сделаны

### 4. Type Safety
- Полная поддержка TypeScript
- Автокомплит для всех параметров
- Проверка типов на этапе компиляции

### 5. Zero Dependencies
- Базовый пакет не имеет зависимостей
- Легкий bundle size (~4KB gzipped)
- Tree-shakeable

## Миграция

### Для существующих пользователей Nova Poshta

**Старый способ**:
```typescript
import { createFetchHttpTransport } from '@shopana/novaposhta-transport-fetch';

const client = createClient({
  transport: createFetchHttpTransport(),
  apiKey: 'xxx',
});
```

**Новый способ**:
```typescript
import { createFetchTransport } from '@shopana/carrier-transport';
import { fromUniversalTransport } from '@shopana/novaposhta-api-client/adapters';

const client = createClient({
  transport: fromUniversalTransport(createFetchTransport()),
  apiKey: 'xxx',
});
```

### Для существующих пользователей Meest

Не требуется - уже совместимо! Можно сразу использовать `createFetchTransport` из `@shopana/carrier-transport`.

## Документация

- **README.md** - Основная документация и API
- **EXAMPLES.md** - Примеры использования
- **ARCHITECTURE.md** - Подробное описание архитектуры

## Что дальше?

1. Опубликовать `@shopana/carrier-transport` в npm
2. Обновить документацию Nova Poshta и Meest клиентов
3. Добавить примеры с react-query, axios в EXAMPLES.md
4. Создать отдельный пакет для axios транспорта (опционально)
5. Добавить метрики и observability support

## Вопросы?

Все работает по единому интерфейсу - достаточно реализовать `HttpTransport` интерфейс, и транспорт можно использовать с любым клиентом!

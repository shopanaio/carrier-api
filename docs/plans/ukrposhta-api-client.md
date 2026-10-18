# План реализации: @shopana/ukrposhta-api-client

Ветка: `feat/ukrposhta-api-client` (slot-3). Источники: план «Планы Carrier API» (приоритет Украина, U1, раздел 3 детального плана), шаблон `packages/demo-post-api-client`, платформа `carrier-core` / `carrier-contracts` / `carrier-testing` (коммит a6ef49e в `claude/project-thread-jlpzsv`). Нова Пошта и Meest в этом PR не трогаются. MCP вне скоупа. e2e против живых API не запускаем без явной команды.

## 0. Исходные условия

- Платформа уже собрана в work-worktree (core, contracts, testing, demo-post как эталон). В нашу ветку она попадает merge'ем `claude/project-thread-jlpzsv`, пакеты платформы мы не правим. Если не хватает возможности ядра, фиксируем в списке «замечания к core» и отправляем в work-сессию.
- Пакет один: `packages/ukrposhta-api-client`, subpath exports `.`, `./public`, `./contract`, `./adapter`, `./simulator` (как у demo-post).
- Граница public/contract проходит по кредам: `/public` = один bearer (трекинг, классификатор), `/contract` = bearer eCom + токен контрагента.

## 1. Раскладка пакета

```
packages/ukrposhta-api-client/
  src/public/        config.ts, services/{trackingService,classifierService}.ts, types/, index.ts
  src/contract/      config.ts, errors.ts (каталог UPE*), generated/ (openapi-typescript), types/, services/*, index.ts
  src/adapter/       index.ts, statusMap.ts
  src/simulator/     contract.ts, index.ts (test-only)
  contracts/         ukrposhta-ecom.openapi.json (снапшот Swagger), overrides.json, tracking и classifier контракты
  __tests__/         unit, сценарные, conformance против симулятора
  README.md, package.json, rollup/jest/tsconfig как у demo-post
```

## 2. Конфигурация и авторизация

| Сервис | Prod | Sandbox | Auth |
|---|---|---|---|
| eCom | `https://www.ukrposhta.ua/ecom/0.0.1` | `https://dev.ukrposhta.ua/ecom/0.0.1` | Bearer eCom + `?token=` |
| Forms (наклейки, 103а) | `.../forms/ecom/0.0.1` | `dev.ukrposhta.ua/forms/ecom/0.0.1` | то же |
| Tracking | `.../status-tracking/0.0.1` | уточнить | Bearer tracking |
| Classifier | `.../address-classifier-ws` | уточнить | Bearer eCom, `Accept: application/json` |

- `createUkrposhtaContractClient({ transport, environment, ecomBearer, counterpartyToken, ... })` строит auth через `composeAuth(bearer(...), when(r => r.meta?.counterpartyToken, queryParam('token', ...)))`. Флаг `meta.counterpartyToken` задаётся в описании операции (у `/addresses`, `/dictionaries/tariffs`, `/domestic/delivery-price` токена нет).
- Для forms-эндпоинтов отдельный `HttpClient` с другим baseUrl, общий транспорт и auth.
- `createUkrposhtaPublicClient({ transport, environment, trackingBearer?, classifierBearer? })`: каждый сервис монтируется со своим bearer; тип конфига не даёт вызвать метод без нужного токена.
- Redaction: оба bearer и `token` в URL маскируются через `redactRequest`/logger ядра.
- Retry: ядро (429/5xx/сеть, POST без повтора). Идемпотентные POST трекинга (`/statuses`, `/statuses/last`, `/with-not-found`) помечаем `idempotent: true`.

## 3. Публичный клиент

**TrackingService (`tracking`)**: `getStatuses`, `getLastStatus`, `getStatusesBatch`, `getStatusesBatchWithNotFound`, `getLastStatusesBatch`, `getLastStatusesBatchWithNotFound`, `getLastStatusByPhone`, `getRoute` (таблица эндпоинтов в основном плане, раздел 3.1). Справочник кодов приложения B в `types/trackingEvents.ts`: код → статус жизненного цикла плюс международные коды UPU.

**ClassifierService (`classifier`)**: области, районы, города, улицы, дома, индексы, отделения по индексу и городу. Только GET. Точные имена операций снимаем из актуального PDF/Swagger классификатора (ссылка из 2024 года отдавала 404): шаг 1.

## 4. Договорной клиент

Сервисы (namespace → разделы доки): `addresses`, `clients`, `shipments`, `pricing`, `labels`, `shipmentGroups`, `deliveryNotifications`, `documentBack`, `courier`, `management`, `transfers`, `barcodes`. Список эндпоинтов — в детальном плане, раздел 3.2.

- Типы: `openapi-typescript` из Swagger (`GET /ecom/0.0.1/doc`) в `src/contract/generated/`, скрипт `yarn gen`, снапшот в `contracts/`. Расхождения с PDF в `contracts/overrides.json`. Поверх ручные enum'ы (`ShipmentType`, `DeliveryType` W2W/W2D/D2W/D2D, `LifecycleStatus`, `PaymentMethod`, размеры бланков).
- Бинарные ответы (`responseType: 'binary'`): `{ contentType, data: Uint8Array }`.
- Ошибки: каталог UPE* из приложения J в `errors.ts` → `CarrierError` (Validation UPE01xxx, NotFound UPE02xxx, Status UPE03xxx, ...), `retryable: false`, кроме 5xx. `mapError` передаётся в `createHttpClient`.
- Хелперы: `iterateGroupShipments()` поверх `size/page`.
- JSDoc с ограничениями: удаление отправки только до регистрации, многоместные (≥30 кг отдельным сценарием), статусные ограничения `courier` и `management`.

## 5. Симулятор и контракты (carrier-testing)

- Контракты: eCom (из Swagger через `contractFromOpenApi`), tracking, classifier (вручную `defineContract`, если нет спецификации).
- `createUkrposhtaSimulator({ clock, state })`: проверка двух bearer и token, `invalidRequest` → `UPE01002`; создание адреса/клиента/отправки с выдачей штрихкода `05…` (`ids.sequence`); `Lifecycle` (запрет удаления после REGISTERED); группы и форма 103а; цена по упрощённой таблице тарифов; PDF-наклейка через `minimalPdf`; трекинг по кодам приложения B; `combineSimulators(ecom, forms, tracking, classifier)` с общим `SimStore`.

## 6. Адаптер (carrier-contracts)

Capabilities: Rates (`pricing`), Shipments (адрес + клиент по externalId, затем отправка), Labels (PDF A4/A5/100×100), Tracking (batch), Cancel (сначала lifecycle, затем DELETE), Locations (классификатор), Manifest (группа + 103а), Pickup (`courier`), Returns (`management`/`documentBack`), AddressValidation (`availability-checking` + классификатор). Объявляем capability только после реализации методов. `statusMap.ts` из приложения B (21700 → available_for_pickup, 31100 → exception, 41010/35500 → returned, 41000/48000 → delivered, ...), сырой код сохраняется. `trackingPolicy`: batch, polling разрешён. Прогон `runAdapterConformance`.

## 7. Тесты

Unit на каждый сервис (метод, путь, query, заголовки, token только где нужно), ошибки UPE*, маппинг статусов, redaction; сценарий «адрес → клиент → отправка → наклейка → группа → 103а → трекинг до DELIVERED»; conformance. Покрытие ≥ 80%. Smoke-тесты в `e2e/__tests__/ukrposhta/` пишем, но не запускаем.

## 8. Порядок работ (коммиты внутри ветки; PR ниже по решению пользователя)

1. **Каркас.** Merge платформы, пакет по шаблону demo-post, package.json/exports, changeset, добавление в root build-скрипты и CI. Поиск актуальных Swagger/PDF (tracking, classifier, ecom).
2. **Публичный клиент.** Конфиг, tracking, classifier, типы, справочник кодов, unit-тесты.
3. **Договорное ядро.** Снапшот Swagger, генерация, `addresses`, `clients`, `shipments`, `pricing`, `labels`, каталог UPE*, тесты.
4. **Симулятор** для 2–3 (параллельно по мере сервисов).
5. **Договорное остальное.** `shipmentGroups` + 103а, `courier`, `management`, `deliveryNotifications`, `documentBack`, `transfers`, `barcodes`.
6. **Адаптер** и conformance.
7. **README** (как получить доступ, два bearer, лимиты), smoke-тесты в e2e, финальные `type-check`/`build`/`test`.
8. Отдельным PR позже: международные отправки (PDF от 24.06.2025).

## 9. Риски и открытые вопросы

- Нужны актуальные документы: Swagger eCom доступен только с живого сервера (`dev.ukrposhta.ua/ecom/0.0.1/doc`); если сеть недоступна, строим контракт по PDF и памяти, помечаем как требующий сверки.
- Sandbox для трекинга и классификатора не подтверждён.
- Креды (sandbox-пара Укрпошты) нужны только для smoke-тестов.
- Замечания к core фиксируются в этом файле в разделе «Замечания к core» по ходу работы.

## Замечания к core

(пока пусто)

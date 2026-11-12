# Architecture review

## 1. Initial review — аналіз до рефакторингу

| Principle | Evidence (file:line) | Practical risk | Fix |
|---|---|---|---|
| Information hiding | `src/checkout/CheckoutController.ts:3,22-28` | Checkout напряму використовує StripePayload. Зміна платіжного провайдера вимагатиме змін у Checkout. | Приховати формат Stripe всередині Payments. |
| Low coupling | `src/orders/OrderService.ts:4,29-30` | Orders залежить від внутрішнього StripeClient. Інтеграція другого провайдера ускладнена. | Використовувати публічний контракт Payments. |
| High cohesion | `src/orders/mapPaymentStatus.ts:3-6`, `src/reports/mapPaymentStatus.ts:3-6`, `src/notifications/mapPaymentStatus.ts:3-6` | Мапінг статусів дублюється у трьох модулях. Нові статуси можуть оброблятися по-різному. | Перенести нормалізацію в Payments. |
| Dependency direction | `src/payments/internal/StripeClient.ts:2,20` | Payments викликає внутрішню функцію Orders, утворюючи циклічну залежність. | Payments лише повертає результат, а Orders оновлює замовлення. |
| Ownership | `src/orders/OrderService.ts:15-25` | Orders змінює залишки напряму. Якщо другого товару немає, перший може бути вже списаний. | Створити InventoryService.reserve(). |
| Explicit contracts | `src/inventory/StockRepository.ts:8-10` | Доступне оновлення залишків без перевірки. Можливий від'ємний баланс товарів. | Перенести перевірки в Inventory. |
| Local reasoning | `src/shared/calculateTotal.ts:11-21` | Функція читає глобальні налаштування, змінює cart lines і веде журнал. | Передавати налаштування аргументами й прибрати побічні ефекти. |
| Design for change | `tests/checkout.functional.test.ts:15-54` | Три базові тести не перевіряють processing, другого провайдера й архітектурні обмеження. | Додати unit, functional та architecture tests. |

## 2. Change impact prediction

**Requirement:** Додати другий навчальний payment provider і статус processing без зміни публічного Checkout API та поведінки існуючих сценаріїв paid і failed.

**Expected files:**

- `src/payments/` — нормалізація статусів, публічний API і другий адаптер.
- `src/orders/OrderService.ts` — використання публічного контракту Payments та Inventory.
- `src/checkout/CheckoutController.ts` — усунення залежності від Stripe та перенесення audit logging.
- `src/inventory/` — реалізація безпечного резервування.
- `src/shared/calculateTotal.ts` — чистий детермінований розрахунок.
- `src/reports/` і `src/notifications/` — усунення дублювання мапінгу.
- `tests/` — нові функціональні й архітектурні тести.
- `DECISIONS.md` — пояснення прийнятих рішень.

**Modules that should not change:**

- `src/database.ts` — структура сховища залишається незмінною.
- `src/config.ts` — значення налаштувань залишаються.
- `src/demo.ts` — публічний спосіб виклику Checkout не змінюється.
- `tests/checkout.functional.test.ts` — базові тести повинні проходити без редагування.

Публічні поля CheckoutRequest і структура відповіді для paid та failed повинні залишитися незмінними.

## 3. Actual impact

**Actual files changed:** Заповнюється після завершення рефакторингу.

**Difference from prediction and explanation:** Заповнюється після реалізації та перевірки тестів.
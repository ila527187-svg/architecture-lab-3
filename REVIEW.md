## Actual impact

**Actual files changed:**

Payments:
- Створено PaymentService.ts і публічний index.ts.
- Додано TrainingPaymentClient.ts.
- Оновлено StripeClient.ts.
- Додано normalizePaymentStatus.ts і тести статусів.

Orders:
- Оновлено OrderService.ts.
- Видалено mapPaymentStatus.ts.
- Видалено internal/orderMutations.ts.

Inventory:
- Створено InventoryService.ts та index.ts.
- Видалено StockRepository.ts.

Checkout:
- Оновлено CheckoutController.ts без зміни публічного API.

Shared:
- Перероблено calculateTotal.ts у чисту функцію.

Reports і Notifications:
- Видалено дубльовані mapPaymentStatus.ts.

Tests:
- Додано тести платежів, Inventory, calculateTotal
  та архітектурних обмежень.

Documentation:
- Оновлено DECISIONS.md і REVIEW.md.

**Difference from prediction and explanation:**

Прогноз загалом підтвердився. Основні зміни відбулися
в Payments, Orders, Inventory, Checkout та Shared.

Замість використання внутрішніх клієнтів створено
публічні контракти PaymentService та InventoryService.

Дубльовані функції Reports і Notifications видалено,
оскільки вони більше не потрібні.

Початкові database.ts, config.ts, demo.ts і
checkout.functional.test.ts не змінювалися.

Для контролю архітектури додано автоматичні тести,
що перевіряють заборонені залежності.

У реалізації з синхронним in-memory storage Inventory
гарантує відсутність часткового списання. Для реальної
бази даних знадобилися б транзакції та контроль
конкурентного доступу.

**Verification:**

Початкові сценарії paid і failed збережено.
Додано processing і другого навчального провайдера.

Очікуваний результат npm test: 23 пройдені тести,
0 помилок. Результат потрібно підтвердити локальним запуском.
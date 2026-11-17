---
id: fintech-standards
description: Currency, idempotency, transactions, and ledger writes
tags: ["backend", "database", "webhooks"]
file_patterns: ["src/services/billing/**/*.ts", "src/api/webhooks/**/*.ts", "apps/*/src/server/services/billing/**/*.ts", "apps/*/src/app/api/webhooks/**/*.ts", "packages/db/**/*.ts"]
global: false
---

# FinTech standards

## Currency

Never use a JavaScript `number` for money. Store minor units as integers, or use `numeric`. Do application math with `BigInt` or a decimal library. JSON money is an integer minor-unit or a decimal string, never a JSON number.

```ts
// Bad
const total = 10.1 + 10.2;

// Good
const totalMinor = 1010n + 1020n;
```

## Idempotency and webhooks

Every POST, PUT, or PATCH that mutates financial state requires an `Idempotency-Key`. Store the key with a hash of the body. The same key and a different body returns 409. A replay returns the stored response.

Webhook delivery is at-least-once. Deduplicate on a unique event id. A check-then-insert races.

## Transactions and ledger

Multi-table writes use `db.transaction(async (tx) => { ... })`. Pass `tx` into helpers. Do not use the global `db` inside the transaction.

Ledger rows are append-only. Correct a posted entry with a new row.

Balance changes are one conditional update. Check the affected row count.

```sql
-- Good
UPDATE balances
SET amount = amount - :x
WHERE id = :id AND amount >= :x;
```

Do not read a balance, subtract in application code, and write the result back without a row lock or this predicate.

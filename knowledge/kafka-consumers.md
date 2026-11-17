---
id: kafka-consumers
description: Idempotent consumers that commit after the database transaction
tags: ["kafka", "concurrency"]
file_patterns: ["**/*consumer*.ts", "**/*consumer*.py", "**/kafka/**/*.ts", "**/kafka/**/*.py"]
global: false
---

# Kafka consumers

Commit the offset after the database transaction commits. A crash between the write and the commit must redeliver, so the handler is idempotent on the event id.

Do not commit the offset and then perform the side effect.

Send poison messages to a dead-letter topic after a bounded number of attempts. The partition key is the aggregate id (account, order), so updates for one aggregate stay ordered.

```text
# Bad
commit(offset)
await db.insert(event)

# Good
await db.transaction(async (tx) => apply(tx, event))
commit(offset)
```

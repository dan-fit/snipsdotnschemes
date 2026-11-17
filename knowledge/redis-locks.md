---
id: redis-locks
description: Redis locks with tokens, TTL, and fencing
tags: ["redis", "concurrency"]
file_patterns: ["**/*lock*.ts", "**/*lock*.py", "**/*redis*.ts", "**/*redis*.py"]
global: false
---

# Redis locks

Acquire with `SET key token NX PX <ttl>`. The TTL covers the critical section. A lock without a TTL is a bug.

Release with a compare-and-delete Lua script so one worker cannot delete another worker's lock.

Store a fencing token on the write. A late worker with an older token must not overwrite a newer one.

```text
# Bad
SET lock 1
DEL lock

# Good
SET lock <token> NX PX 5000
-- release only if GET lock == <token>
```

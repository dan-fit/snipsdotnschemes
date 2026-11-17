---
id: websockets-latency
description: Authenticated sockets, backpressure, and hot-path timeouts
tags: ["realtime", "latency"]
file_patterns: ["**/*socket*.ts", "**/*socket*.py", "**/*ws*.ts", "**/*ws*.py", "**/realtime/**/*.ts", "**/realtime/**/*.py"]
global: false
---

# WebSockets and latency

Authenticate the upgrade. Cap the message size. Send heartbeats. Apply backpressure when the client is slow.

Include a sequence number so the client can see a gap. When more than one instance runs, fan out through Redis or Kafka. Do not keep the only subscriber list in process memory.

Every downstream call on the hot path has a timeout. Know the p99 budget for the hop before adding a synchronous call.

```text
# Bad
socket.on("order", () => db.query("select * from orders"))

# Good
socket.on("order", () => withTimeout(loadOrder(id), 50))
```

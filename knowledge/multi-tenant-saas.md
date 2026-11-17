---
id: multi-tenant-saas
description: Org-scoped queries and separated web, worker, and agent processes
tags: ["saas", "tenancy"]
file_patterns: ["apps/*/src/**/*.ts", "apps/*/src/**/*.tsx", "services/**/*.py", "packages/db/**/*.ts"]
global: false
---

# Multi-tenant SaaS

The web app, the worker, and the agent are separate processes. The agent decides. The worker executes. Tables are declared only in the schema package.

Every query is scoped by the session org. Worker credentials and browser profiles are stored per org and are not shared.

Inbound webhooks and email events are at-least-once. Deduplicate them with a unique event id.

```ts
// Bad
return db.select().from(tickets);

// Good
return db.select().from(tickets).where(eq(tickets.orgId, session.orgId));
```

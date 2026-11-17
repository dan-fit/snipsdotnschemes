---
id: drizzle-migrations
description: Committed Drizzle migrations and isolated test databases
tags: ["database", "drizzle"]
file_patterns: ["packages/db/**/*.ts", "drizzle.config.ts", "**/drizzle/**/*.ts"]
global: false
---

# Drizzle migrations

Do not run `drizzle-kit push` against a shared or production database. Generate SQL, commit it, and migrate from those files. A hotfix is a new migration. Do not edit a migration that has already been applied.

Drop a column in two steps: stop reading and writing it, deploy, then drop it in a later migration.

Tests use a different `DATABASE_URL`, or a transaction that rolls back. They do not share the app's dev database.

```bash
# Bad
drizzle-kit push

# Good
drizzle-kit generate
drizzle-kit migrate
```

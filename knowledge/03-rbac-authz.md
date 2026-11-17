---
id: rbac-authz
description: Deny-by-default authorization inside the transaction
tags: ["security", "auth"]
file_patterns: ["src/server/api/**/*.ts", "apps/*/src/server/api/**/*.ts", "src/server/services/**/*.ts", "apps/*/src/server/services/**/*.ts"]
global: false
---

# Authorization

Deny by default. Hiding a button is not authorization.

Check the permission in the procedure or service, then again inside the transaction that mutates. A role can change between the check and the write.

`org_id` comes from the session. Ignore an org id supplied by the client.

Impersonation is explicit, time-bounded, and written to an audit row.

```ts
// Bad
if (input.orgId === session.orgId) return db.update(rows).set(input);

// Good
await db.transaction(async (tx) => {
  await assertCan(tx, session, "invoice:write");
  await tx.update(rows).set(patch).where(eq(rows.orgId, session.orgId));
});
```

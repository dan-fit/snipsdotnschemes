---
id: supabase-rls
description: Row level security for the exposed Supabase API
tags: ["database", "supabase", "security"]
file_patterns: ["supabase/migrations/**/*.sql", "supabase/**/*.sql"]
global: false
---

# Supabase RLS

Enable row level security on every table exposed through the Supabase API. Policies key off `auth.uid()` and a membership row. Do not trust an org id passed only from the client.

The service-role key stays on the server. It bypasses RLS.

A Drizzle connection that uses a bypass role is not protected by these policies. If the app uses that connection, enforce the org predicate in the query. Do not treat RLS as the control.

```sql
-- Bad
create policy "open" on invoices for select using (true);

-- Good
create policy "org member reads" on invoices
  for select using (org_id in (select org_id from memberships where user_id = auth.uid()));
```

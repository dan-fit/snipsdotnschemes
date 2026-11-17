---
id: django-orm-strict
description: Atomic Django writes without query loops or string SQL
tags: ["python", "django", "database"]
file_patterns: ["**/models.py", "**/views.py", "**/services.py", "**/migrations/**/*.py"]
global: false
---

# Django ORM

Wrap multi-row writes in `transaction.atomic`. Do not query inside a loop. Use `select_related` or `prefetch_related`.

Do not build SQL by formatting strings. Pass parameters.

Commit migration files. Do not edit a migration that has already been applied. Ship a new migration instead.

```python
# Bad
for org in Org.objects.all():
    Invoice.objects.filter(org=org).update(status="due")

# Good
with transaction.atomic():
    Invoice.objects.filter(status="open").update(status="due")
```

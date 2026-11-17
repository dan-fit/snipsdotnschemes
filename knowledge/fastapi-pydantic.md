---
id: fastapi-pydantic
description: Pydantic v2, async I/O, and router-level HTTP errors
tags: ["python", "fastapi"]
file_patterns: ["services/**/*.py", "app/**/*.py", "src/**/*.py"]
global: false
---

# FastAPI and Pydantic

## Models

Use Pydantic v2: `model_validate`, `model_dump`, `ConfigDict`, and `Field()`. Boundary models set `extra="forbid"`.

```python
# Bad
class Payment(BaseModel):
    class Config:
        orm_mode = True
    amount: float

# Good
class Payment(BaseModel):
    model_config = ConfigDict(extra="forbid")
    amount_minor: int = Field(ge=0)
```

## Async and dependencies

Use `async def` for routes that await I/O. Keep CPU-bound work synchronous so it does not block the event loop.

Inject the database session and HTTP clients with `Depends()`. `get_db` yields the session and closes it. Handlers do not construct a global session.

## Errors

Do not swallow `Exception`. Log the stack, then re-raise or map the error. Map domain errors to HTTP status codes at the router. The service layer does not import `HTTPException`.

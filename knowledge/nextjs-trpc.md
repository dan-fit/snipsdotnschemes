---
id: nextjs-trpc
description: Server Components, Zod tRPC inputs, and URL state
tags: ["frontend", "trpc", "react"]
file_patterns: ["src/app/**/*.{ts,tsx}", "apps/*/src/app/**/*.{ts,tsx}", "src/components/**/*.{ts,tsx}", "apps/*/src/components/**/*.{ts,tsx}", "src/server/api/**/*.ts", "apps/*/src/server/api/**/*.ts"]
global: false
---

# Next.js and tRPC

## Server and client

Default to React Server Components. Add `'use client'` only on a leaf file that uses hooks or browser APIs.

Do not pass secrets or large server payloads into client components as props. Server-only modules start with `import "server-only"`. Values that use the `NEXT_PUBLIC_` prefix ship in the bundle. Secrets never use that prefix.

## Data

Define every tRPC input with Zod. In a Server Component, call the server caller. In a Client Component, use `useQuery` or `useMutation` and render `isLoading` and `isError`.

An optimistic update rolls back in `onError`.

## State

Keep filters and pagination in the URL. Do not put that state in React context or Zustand.

```tsx
// Bad
"use client";
export function Balance({ secret, rows }: { secret: string; rows: Row[] }) {
  return <pre>{secret}</pre>;
}

// Good
export function Balance({ id }: { id: string }) {
  return <BalanceClient id={id} />;
}
```

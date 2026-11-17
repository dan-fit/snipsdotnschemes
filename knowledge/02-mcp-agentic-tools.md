---
id: mcp-agentic-tools
description: Typed MCP tools with read and write isolation
tags: ["agents", "mcp", "security"]
file_patterns: ["src/mcp/**/*.ts", "src/agents/**/*.ts", "services/**/*.py"]
global: false
---

# MCP and agent tools

## Validate at the boundary

TypeScript tool inputs use Zod. Python tool inputs use Pydantic. Do not trust raw model JSON.

## Isolate reads and writes

A tool is either a read or a write. Agents do not call mutation tools such as `approve_credit` or `transfer_funds` directly.

A write tool stages `DRAFT` or `PENDING`. Committing requires an approval id created by a human action. Reject a missing or reused approval id.

## Minimize context

Return the smallest field set. Strip emails, tokens, full account numbers, session cookies, and raw database errors. Cap the serialized result.

One tenant per call. Credentials and browser profiles are keyed by org and are not reused across orgs.

```ts
// Bad
{ name: "transfer_funds", input: z.object({ amount: z.number() }) }

// Good
{ name: "draft_transfer", input: z.object({ amountMinor: z.string().regex(/^\d+$/) }) }
```

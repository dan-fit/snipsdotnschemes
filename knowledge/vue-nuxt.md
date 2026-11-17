---
id: vue-nuxt
description: Nuxt 3 Composition API and public runtime config limits
tags: ["frontend", "vue", "nuxt"]
file_patterns: ["**/*.vue", "pages/**", "server/api/**"]
global: false
---

# Vue and Nuxt

Use Nuxt 3 and the Composition API. Do not add new Options API components.

Shareable state such as filters and pagination lives in the route query. Use Pinia only for client session state that must not be in the URL.

`runtimeConfig.public` ships to the browser. Secrets stay on the server config.

```ts
// Bad
const apiKey = useRuntimeConfig().public.stripeSecret;

// Good
const apiKey = useRuntimeConfig().stripeSecret;
```

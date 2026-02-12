# tpl Tagged Template Injection (VS Code)

Adds syntax highlighting inside tagged template literals:

- `tpl.css\`...\`` -> CSS
- `tpl.json\`...\`` -> JSON
- `tpl.vue\`...\`` -> Vue (depends on Vue extension grammar scope)
- `tpl.ts\`...\`` -> TypeScript

Interpolation `${ ... }` is highlighted as TypeScript.

## Dev

1. Open this folder in VS Code
2. Press `F5` (Run Extension)
3. In the Extension Development Host, open a `.ts` file and try:

```ts
const a = tpl.css`
:root { --x: 1; }
`

const b = tpl.json`
{ "a": 1 }
`

const c = tpl.vue`
<template><div>{{ msg }}</div></template>
<script setup lang="ts">
const msg = 'hi'
</script>
<style scoped>
.a { color: red; }
</style>
`

const d = tpl.ts`
export const x: number = 1
`

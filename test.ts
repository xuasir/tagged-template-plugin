

const tpl = {
  scss: (strings: TemplateStringsArray, ...values: any[]) => strings.join(''),
  dts: (strings: TemplateStringsArray, ...values: any[]) => strings.join(''),
  ts: (strings: TemplateStringsArray, ...values: any[]) => strings.join(''),
  js: (strings: TemplateStringsArray, ...values: any[]) => strings.join(''),
  jsx: (strings: TemplateStringsArray, ...values: any[]) => strings.join(''),
  vue: (strings: TemplateStringsArray, ...values: any[]) => strings.join(''),
  json: (strings: TemplateStringsArray, ...values: any[]) => strings.join(''),
  css: (strings: TemplateStringsArray, ...values: any[]) => strings.join(''),
  text: (strings: TemplateStringsArray, ...values: any[]) => strings.join(''),
}

const a = tpl.scss`
$color: red;
.a { color: $color; }
`

const b = tpl.ts`
export interface Foo { a: number }
`

const d = tpl.js`
export const x = 1
`

const e = tpl.jsx`
export const X = () => <div>{1 + 2}</div>
`

const f = tpl.vue`
<template>
  <!-- 全局错误 -->
  <C2GlobalError v-if="error" :error="error" />
  <div class="c2-root-wrapper" v-else>
    <!-- 主应用 -->
    <VonaApp />
    <!-- 全局加载 -->
    <C2GlobalLoading :loading="globalLoading" />
  </div>
</template>

<script setup lang="ts">
const vonaApp = useVonaApp()
const { globalLoading } = useGlobalLoading()

// 定义状态
const error = ref<Error | null>(null)

// 应用启动钩子
vonaApp.apply({
  key: 'onAppSetup',
  type: 'event'
})

onErrorCaptured((err) => {
  error.value = err
  console.error(err)
  return false
})
</script>

<style lang="css" scoped>
.c2-root-wrapper {
  width: 100%;
  height: 100%;
}
</style>
`
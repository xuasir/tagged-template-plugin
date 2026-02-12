

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


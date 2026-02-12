# 为 `tpl` Tagged Template 增加语法报错（全量语言，接近完整语言服务）

## Summary
当前扩展只有 `TextMate grammar injection`（`syntaxes/tpl-injection.tmLanguage.json`），只能高亮，不能产出 Diagnostics。  
方案是保留现有高亮不变，新增扩展运行时代码，在编辑时抽取 `tpl.*\`...\`` 内容，按语言做解析/校验，并把错误映射回宿主 `ts/js` 文件中的真实位置。

## 目标与验收标准
1. 在 `tpl.css/scss/json/vue/ts/dts/tsx/js/jsx` 内输入非法语法时，宿主文件出现红线报错。
2. 输入后 300ms 内更新报错（防抖实时）。
3. 删除错误后 Diagnostics 立即消失。
4. 关闭文件或移除模板块后，旧报错不残留。
5. 对 `${...}` 插值引起的伪错误进行抑制，不误报。

## 代码与结构变更（决策完成）
1. `package.json`
2. `src/extension.ts`
3. `src/diagnostics/engine.ts`
4. `src/diagnostics/extractor.ts`
5. `src/diagnostics/mapping.ts`
6. `src/diagnostics/validators/css.ts`
7. `src/diagnostics/validators/json.ts`
8. `src/diagnostics/validators/tsjs.ts`
9. `src/diagnostics/validators/vue.ts`
10. `src/types.ts`
11. `tsconfig.json`

## `package.json` 具体变更
1. 增加 `"main": "./out/extension.js"`。
2. 增加 `"activationEvents"`：`onLanguage:typescript`、`onLanguage:typescriptreact`、`onLanguage:javascript`、`onLanguage:javascriptreact`。
3. 增加脚本：`build`、`watch`、`test`、`prepackage`（先 build 再 vsce）。
4. 增加依赖：`vscode-css-languageservice`、`vscode-json-languageservice`、`typescript`、`@vue/compiler-sfc`、`vscode-html-languageservice`。
5. 增加开发依赖：`typescript`、`@types/vscode`、`vitest`（或同类单测框架）。
6. 增加 `contributes.configuration`：
7. `tplTemplateInjection.diagnostics.enabled`（bool，默认 `true`）
8. `tplTemplateInjection.diagnostics.debounceMs`（number，默认 `300`）
9. `tplTemplateInjection.diagnostics.maxTemplateLength`（number，默认 `20000`）
10. `tplTemplateInjection.diagnostics.vue.enabled`（bool，默认 `true`）
11. `tplTemplateInjection.diagnostics.tsjs.semantic`（bool，默认 `true`）

## 诊断引擎设计
1. `activate()` 中创建单一 `DiagnosticCollection('tpl-template-injection')`。
2. 监听 `workspace.onDidChangeTextDocument`、`workspace.onDidOpenTextDocument`、`workspace.onDidCloseTextDocument`、`workspace.onDidChangeConfiguration`。
3. 仅处理语言：`typescript/typescriptreact/javascript/javascriptreact`。
4. 每个文档使用防抖队列（默认 300ms）。
5. 每次重算时先清空该文档旧诊断，再写入新结果。

## 提取与映射（核心）
1. 使用字符扫描器提取所有 `tpl.<tag>\`...\`` 区块，不用纯正则，避免转义和反引号误判。
2. 为每个区块生成 `EmbeddedRegion`：
3. `tag`、`languageId`、`hostRange`、`rawContent`、`interpolationSpans`、`offsetMap`。
4. `offsetMap` 记录“虚拟文本 offset -> 宿主文本 offset”，用于精确回写报错位置。
5. 对 `${...}` 做“占位符归一化”：
6. CSS/SCSS 使用 `__TPL_EXPR_n__`（必要时包裹注释）；
7. JSON 依据上下文替换为 `null` 或字符串片段，且所有落在占位符上的错误都过滤；
8. TS/JS/TSX/JSX 替换为合法表达式占位符（如 `(__TPL_EXPR_n__)`）。
9. 若模板异常（未闭合等），直接在宿主处产出“模板结构错误”诊断，短路该块语言校验。

## 各语言校验器策略
1. CSS/SCSS：`vscode-css-languageservice` 做 parse + validation，收集语法与基础语义。
2. JSON：`vscode-json-languageservice` 做 parse + validation；对占位符重叠报错过滤。
3. TS/JS/TSX/JSX：`typescript` LanguageService。
4. `semantic=true` 时执行 `getSyntacticDiagnostics + getSemanticDiagnostics`。
5. 对占位符相关、外层上下文缺失导致的噪声错误做白名单过滤（如占位符标识符未定义）。
6. Vue：`@vue/compiler-sfc` 先做 SFC parse。
7. `template` 段使用 `vscode-html-languageservice` 做结构错误；
8. `script/script setup` 段复用 TS/JS 校验器；
9. `style` 段复用 CSS/SCSS 校验器；
10. 将子段错误统一映射回原 `tpl.vue` 区块坐标。

## 对外接口/类型变化
1. 新增内部类型 `EmbeddedRegion`、`MappedDiagnostic`、`Validator`（`src/types.ts`）。
2. 新增用户设置项（见上），属于扩展公开配置接口。
3. 不改变现有 `tmLanguage` 注入与高亮行为（兼容已有用户）。

## 测试方案
1. 单元测试：`extractor`。
2. 用例覆盖：多块模板、转义反引号、嵌套 `${}`、错误闭合、跨行内容。
3. 单元测试：`mapping`。
4. 验证虚拟 offset 映射到宿主行列准确性，包含首行偏移和多字节字符。
5. 单元测试：各 validator。
6. JSON/CSS/TS/JS/Vue 各给“应报错/不应报错”样例。
7. 集成测试：在 `test.ts` 放置故意错误，断言 `DiagnosticCollection` 返回数量与位置。
8. 性能测试：单文件 50+ 模板块，确保防抖后不卡顿（目标单次重算 < 80ms，视机器可调）。

## 失败模式与处理
1. 依赖语言服务抛异常时，不中断全局；仅跳过当前块并记录 `console.warn`。
2. 文档过大或模板过长时，按 `maxTemplateLength` 跳过并给 info 级提示（可配置关闭）。
3. 映射失败时回退到块起始位置，保证至少可见报错来源。

## Assumptions & Defaults
1. 维持 `engines.vscode` 现有版本范围，不降级兼容更旧 API。
2. 首版默认开启所有语言诊断与 TS/JS semantic。
3. 对 `${...}` 相关噪声错误优先“少误报”，允许少量漏报。
4. Vue 目标是“接近完整”而非完全复刻 Volar 全能力；重点覆盖 SFC 结构、脚本、样式与模板结构错误。

# OpenSpec: 06 持久化与国际化规范

## 1. 持久化存储 (LocalStorage Schema)
- **全局前缀:** `sv_v6_`。
- **存储对象:**
  - `mode`: String (VisualizerMode enum)
  - `settings`: Object (Sensitivity, Speed, Glow, Trails, etc.)
  - `theme`: String Array (Color Palette)
  - `fingerprints`: Array (FingerprintEntry list)
- **版本隔离:** 当规范发生重大变更时，通过升级前缀强制重置用户配置。

## 2. 国际化框架 (i18n)
- **多语言字典:** `TRANSLATIONS` 对象以 `Language` 为键进行嵌套存储。
- **动态 Hint 系统:** 所有操作按钮对应 `hints` 子字典，由 `Controls.tsx` 中的浮动提示组件调用。
- **区域感知:** 应用启动时读取 `navigator.language` 自动匹配 `Region` 偏好（CN, JP, KR 等）。

## 3. 字体规范
- **英文/西欧:** 优先使用 `Inter`, `system-ui`。
- **东亚:** 自动适配思源黑体或系统默认无衬线字体。
- **代码/数值:** 统一使用 `monospace` 确保对齐。
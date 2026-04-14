# Changelog

## 1.2.0

### Added 新增

- Added status suffix rules for files and folders, including a default `_[done]` rule.
- Added trailing status badge display mode.
- Added file and folder context-menu actions for setting or clearing status suffixes.
- Added dedicated style slots for leading and trailing status badges.

- 新增了文件和文件夹的状态后缀规则，内置默认 `_[done]` 规则。
- 新增了名称末尾状态 Badge 显示模式。
- 新增了通过文件和文件夹右键菜单设置或清除状态后缀的能力。
- 新增了前置状态 Badge 和尾部状态 Badge 的独立样式槽位。

### Changed 变更

- Changed badge priority so status suffix badges are the highest-priority leading badge.
- When trailing status badge is enabled, the leading badge slot falls back to prefix / conditional / hidden / missing-prefix badges.
- Simplified status rule editing by deriving write-back suffixes from the regex instead of exposing a separate write-back field.
- Moved rule delete actions to the rule header beside the drag handle.
- Updated README and release docs for the new status suffix workflow and `pnpm` commands.

- 调整了 Badge 优先级，状态后缀 Badge 现在是前置 Badge 中最高优先级。
- 开启尾部状态 Badge 后，前置位置会回退给前缀 / 条件 / 隐藏项 / 无前缀 Badge。
- 简化了状态规则编辑方式，不再单独暴露写回后缀，而是根据正则自动推导。
- 将规则删除按钮移动到了规则头部，并放在拖拽把手旁边。
- 更新了 README 和发布文档，补充状态后缀用法并统一为 `pnpm` 命令。

## 1.1.0

### Added 新增

- Added conditional badges for files and folders based on matching rules.
- Added default special-file badges for `README.md`, `AGENTS.md`, `CLAUDE.md`, `TODO.md`, and `PLAN.md`.
- Added icon picker support for badge rules.
- Added custom SVG support for badge rules.
- Added per-rule badge color overrides for conditional badges.
- Added drag-and-drop ordering for conditional badge rules.

- 新增了基于匹配规则的文件和文件夹条件 Badge。
- 新增了 `README.md`、`AGENTS.md`、`CLAUDE.md`、`TODO.md`、`PLAN.md` 等特殊文件的默认 Badge 规则。
- 新增了条件 Badge 的图标选择器。
- 新增了条件 Badge 的自定义 SVG 支持。
- 新增了条件 Badge 的单条规则颜色覆盖。
- 新增了条件 Badge 规则的拖拽排序。

### Changed 变更

- Reworked badge priority so only one badge is shown per item.
- Improved settings UI structure and rule editing flow.
- Refined icon picker layout and interactions.
- Refactored settings code into smaller modules for easier maintenance.

- 调整了 Badge 优先级逻辑，同一条目只显示一个 Badge。
- 优化了设置页结构和规则编辑流程。
- 优化了图标选择器的布局和交互。
- 重构了设置相关代码，拆分为更小、更易维护的模块。

### Fixed 修复

- Fixed hidden file syncing so nested content inside hidden folders can be shown and hidden again correctly.

- 修复了隐藏文件同步问题，现在可以正确显示隐藏文件夹下级内容，并在关闭时再次隐藏。

## 1.0.1

### Changed 变更

- Improved prefix pattern configuration to support multiple rules.
- Upgraded the prefix pattern input to a textarea with preset examples.

- 改进了前缀规则配置，支持多条规则。
- 将前缀规则输入升级为带常用示例的多行输入框。

## 1.0.0

### Added 新增

- Initial public release.
- Added prefix display modes for original name, badge, and hidden-prefix views.
- Added numeric mixed sorting for files and folders in the file explorer.
- Added badge styling controls for prefix, missing-prefix, and hidden-item badges.
- Added command palette actions for prefix display switching.

- 首个公开版本。
- 新增了显示原名、Badge、隐藏前缀等前缀显示模式。
- 新增了文件树中的文件和文件夹数字混合排序。
- 新增了前缀、无前缀、隐藏项等 Badge 的样式配置。
- 新增了前缀显示切换的命令面板操作。

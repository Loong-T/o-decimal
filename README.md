# O Decimal

[English](#english) | [中文](#中文)

## English

### What it does

`O Decimal` is an Obsidian plugin for people who organize files with numeric prefixes such as `01_Project`, `02_Reading`, or `03_Archive`.

It improves the **file explorer only**:

- prefixes can be shown more cleanly
- files and folders can be sorted together by prefix
- badges can be added for special files such as `README.md` or hidden items
- status suffixes such as `_[done]` can be hidden and shown as badges

It does **not** rename files, change links, or modify note content.

---

### Main features

#### 1. Prefix display modes

Choose how prefixes appear in the file explorer:

- `Original`
- `Badge`
- `Hidden`

Example for `03_Project Alpha.md`:

- Original: `03_Project Alpha`
- Badge: `[03] Project Alpha`
- Hidden: `Project Alpha`

When you rename a file from the explorer, the real filename is shown automatically.

#### 2. Mixed sorting by prefix

Files and folders can be sorted together by prefix instead of being split into separate groups.

Example:

1. `01_Inbox/`
2. `02_Project.md`
3. `03_Resources/`
4. `10_Reading.md`

#### 3. Custom prefix rules

You can define your own prefix-matching rules.

- one rule per line
- checked from top to bottom
- if a rule has a capture group, the first captured part is shown in the badge
- if all rules are invalid, built-in defaults are used

Default rules:

```text
^(\d+)_
^((?:\d+-\d+))_
```

These cover names such as:

- `03_Project`
- `00-09_Project`
- `02-389_Project`

#### 4. Conditional badges

You can show a badge when a file or folder matches a rule.

Examples:

- `README.md`
- `AGENTS.md`
- `CLAUDE.md`
- `TODO.md`
- `PLAN.md`

Each rule can define:

- a display name
- what it matches
- an icon or custom SVG
- optional badge text
- optional tooltip
- optional custom colors

Rules are checked from top to bottom, and only one badge is shown per item.

Badge priority:

1. Prefix badge
2. First matching conditional badge
3. Hidden-item badge
4. Missing-prefix badge

#### 5. Hidden files

You can optionally show hidden files and folders such as `.obsidian` or `.gitignore` in the file explorer.

In large vaults, switching this may take a moment.

#### 6. Status suffix badges

You can define status suffix rules for files and folders.

Examples:

- `Task_[done].md`
- `Archive_[done].tar.gz`
- `Project_[done]`

Each rule can define:

- a display name
- target type: files, folders, or both
- a suffix regex matched before the first `.`
- an icon or custom SVG
- optional badge text
- optional tooltip
- optional custom colors
- whether the rule appears in the file context menu

Status suffix badges have the highest priority among leading badges.

If you enable the trailing status badge option:

- the status badge moves to the end of the title
- the leading badge slot becomes available to prefix / conditional / hidden / missing-prefix badges again

You can also set or clear a status directly from the file or folder context menu.

#### 7. Badge styling

You can customize badge appearance, including:

- radius
- background color
- text color
- opacity

Different badge types can be styled separately.

#### 8. Command palette shortcuts

Commands are included for quickly switching:

- prefix display mode
- missing-prefix badge

---

### Installation

#### Option 1: Manual install / local development

```bash
cd <Your Vault>/.obsidian/plugins
git clone https://github.com/Loong-T/o-decimal.git nerd-is-in-o-decimal
cd nerd-is-in-o-decimal
pnpm install
pnpm build
```

Then open **Settings → Community plugins**, refresh the plugin list, and enable `O Decimal`.

#### Option 2: Install with BRAT

If you use [obsidian42-brat](https://github.com/TfTHacker/obsidian42-brat), add this repository:

[https://github.com/Loong-T/o-decimal](https://github.com/Loong-T/o-decimal)

Typical steps:

1. Install and enable `BRAT`
2. Open BRAT settings
3. Select `Add Beta plugin`
4. Paste the repository URL
5. Install and enable the plugin

---

### How to use it

Open:

- **Settings → O Decimal**

You can configure:

- prefix display
- prefix rules
- mixed sorting
- conditional badges
- status suffix badges
- hidden file visibility
- badge styles

#### More prefix rule examples

```text
^(\d+)_
^((?:\d+-\d+))_
^\[(\d+)\]\s*
^(\d+)\.\s*
^((?:\d+\.)+\d+)\s*
```

Examples:

- `03_Project`
- `00-09_Project`
- `[23] Project`
- `03. Project`
- `02.389 Project`

---

### Development

This project uses:

- TypeScript
- esbuild
- pnpm

Common commands:

```bash
pnpm install
pnpm dev
pnpm build
pnpm lint
```

---

### Notes

- This plugin only affects the file explorer
- It does not rename files
- It does not change links, frontmatter, or note content

## 中文

### 作用

`O Decimal` 是一个面向 Obsidian 文件树的插件，适合使用数字前缀命名的人，比如：

- `01_Project`
- `02_Reading`
- `03_Archive`

它只增强 **文件树**：

- 让前缀显示更清爽
- 让文件和文件夹按前缀一起排序
- 为特殊文件或隐藏项显示 Badge
- 支持把 `_[done]` 这类状态后缀隐藏并显示成 Badge

它 **不会** 修改真实文件名、链接或笔记内容。

---

### 主要功能

#### 1. 前缀显示模式

可以选择前缀在文件树里的显示方式：

- `显示原名`
- `Badge`
- `隐藏前缀`

例如文件名是 `03_Project Alpha.md`：

- 显示原名：`03_Project Alpha`
- Badge：`[03] Project Alpha`
- 隐藏前缀：`Project Alpha`

从文件树里重命名时，会自动显示真实文件名。

#### 2. 按前缀混合排序

可以让同级文件和文件夹一起按前缀排序，而不是被默认分组拆开。

例如：

1. `01_Inbox/`
2. `02_Project.md`
3. `03_Resources/`
4. `10_Reading.md`

#### 3. 自定义前缀规则

你可以自己定义“什么样的前缀会被识别”。

- 每行一条规则
- 从上到下依次检查
- 如果规则里有捕获组，会把第一组匹配到的内容显示在 Badge 里
- 如果所有规则都无效，会改用内置默认规则

默认规则：

```text
^(\d+)_
^((?:\d+-\d+))_
```

它们可以覆盖：

- `03_Project`
- `00-09_Project`
- `02-389_Project`

#### 4. 条件 Badge

当文件或文件夹匹配规则时，可以显示 Badge。

例如：

- `README.md`
- `AGENTS.md`
- `CLAUDE.md`
- `TODO.md`
- `PLAN.md`

每条规则可以设置：

- 规则名称
- 匹配条件
- 图标或自定义 SVG
- 可选文字
- 可选提示
- 可选颜色

规则会从上到下检查，同一个条目只显示一个 Badge。

优先级：

1. 前缀 Badge
2. 第一条命中的条件 Badge
3. 隐藏项 Badge
4. 无前缀 Badge

#### 5. 显示隐藏文件

可以选择在文件树中显示隐藏文件和隐藏文件夹，例如：

- `.obsidian`
- `.gitignore`

在大型 vault 中切换时，可能需要一点时间。

#### 6. 状态后缀 Badge

可以为文件和文件夹定义状态后缀规则。

例如：

- `Task_[done].md`
- `Archive_[done].tar.gz`
- `Project_[done]`

每条规则可以设置：

- 规则名称
- 作用对象：文件、文件夹或两者
- 匹配第一个 `.` 之前部分的后缀正则
- 图标或自定义 SVG
- 可选文字
- 可选提示
- 可选颜色
- 是否出现在右键菜单

状态后缀 Badge 在前置 Badge 中优先级最高。

如果开启“名称末尾状态 Badge”：

- 状态 Badge 会显示到名称后面
- 前置位置会重新让给前缀 / 条件 / 隐藏项 / 无前缀 Badge

也可以直接通过文件或文件夹右键菜单设置或清除状态。

#### 7. Badge 样式

可以分别调整 Badge 的外观，例如：

- 圆角
- 背景颜色
- 文字颜色
- 透明度

不同类型的 Badge 可以分别设置。

#### 8. 命令面板快捷切换

插件提供了命令，方便快速切换：

- 前缀显示模式
- 无前缀 Badge

---

### 安装

#### 方式 1：手动安装 / 本地开发

```bash
cd <你的 Vault>/.obsidian/plugins
git clone https://github.com/Loong-T/o-decimal.git nerd-is-in-o-decimal
cd nerd-is-in-o-decimal
pnpm install
pnpm build
```

然后打开 **设置 → 第三方插件**，刷新插件列表并启用 `O Decimal`。

#### 方式 2：使用 BRAT

如果你使用 [obsidian42-brat](https://github.com/TfTHacker/obsidian42-brat)，可以直接添加这个仓库：

[https://github.com/Loong-T/o-decimal](https://github.com/Loong-T/o-decimal)

大致步骤：

1. 安装并启用 `BRAT`
2. 打开 BRAT 设置
3. 选择 `Add Beta plugin`
4. 粘贴仓库地址
5. 安装并启用插件

---

### 使用方法

打开：

- **设置 → O Decimal**

你可以配置：

- 前缀显示
- 前缀规则
- 混合排序
- 条件 Badge
- 状态后缀 Badge
- 是否显示隐藏文件
- Badge 样式

#### 更多前缀规则示例

```text
^(\d+)_
^((?:\d+-\d+))_
^\[(\d+)\]\s*
^(\d+)\.\s*
^((?:\d+\.)+\d+)\s*
```

示例：

- `03_Project`
- `00-09_Project`
- `[23] Project`
- `03. Project`
- `02.389 Project`

---

### 开发

本项目使用：

- TypeScript
- esbuild
- pnpm

常用命令：

```bash
npm install
npm run dev
npm run build
npm run lint
```

---

### 说明

- 本插件只影响文件树
- 不会修改真实文件名
- 不会修改链接、frontmatter 或笔记内容

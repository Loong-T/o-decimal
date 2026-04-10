# O Decimal

[English](#english) | [中文](#中文)

## 中文

### 简介

`O Decimal` 是一个面向 Obsidian 文件树的轻量增强插件，主要解决“数字前缀命名法”在文件树里的两个问题：

- 显示太吵，像 `01_项目`、`02_资料` 这样的前缀会影响阅读
- 排序不直观，文件和文件夹会被默认类型分组打散

这个插件只增强 **文件树显示** 和 **文件树排序**，不会修改真实文件名，也不会影响链接目标。

---

### 当前功能

#### 1. 前缀显示模式

支持 3 种显示模式：

- `显示原名`
- `Badge`
- `隐藏前缀`

例如真实文件名为 `03_Project Alpha.md`：

- 显示原名：`03_Project Alpha`
- Badge：`[03] Project Alpha`
- 隐藏前缀：`Project Alpha`

进入文件树重命名时，会自动恢复真实文件名，避免把伪装后的显示文本当成文件名。

#### 2. 数字前缀混合排序

可以让同级文件和文件夹一起按前缀排序，而不是默认“文件夹优先、文件在后”。

例如：

1. `01_Inbox/`
2. `02_Project.md`
3. `03_Resources/`
4. `10_Reading.md`

#### 3. 自定义前缀正则

可以自定义“什么样的前缀会被识别”。

- 默认规则：
  - `^(\d+)_`
  - `^((?:\d+-\d+))_`
- 支持在设置中按“每行一条规则”填写多个正则
- 输入框聚焦时会出现常用示例补全
- 规则会从上到下依次匹配
- 如果正则里有第一组括号，括号匹配到的内容会显示在 Badge 中

#### 4. 无前缀 / 隐藏项 Badge

支持为特殊条目添加额外 Badge：

- 无前缀条目：warning Badge
- 隐藏项：hidden Badge

并支持分别配置：

- 是否显示
- Badge 文本
- 颜色、透明度、圆角等样式

当隐藏项和无前缀条件同时满足时，优先显示隐藏项 Badge。

#### 5. 显示隐藏文件

可选在文件树中显示隐藏文件和隐藏文件夹（如 `.gitignore`、`.obsidian/`）。

注意：

- 这个功能使用的是较重的同步方式
- 在大型仓库中切换时可能会有卡顿

#### 6. 命令面板快速切换

已提供命令面板命令，可快速切换：

- 前缀显示模式
- 无前缀警告 Badge

---

### 安装方式

#### 方式 1：本地开发 / 手动安装

1. 将仓库 clone 到你的 vault 插件目录：

```bash
cd <你的 Vault>/.obsidian/plugins
git clone https://github.com/Loong-T/o-decimal.git nerd-is-in-o-decimal
cd nerd-is-in-o-decimal
pnpm install
pnpm build
```

2. 回到 Obsidian，打开：

- `设置 -> 第三方插件`

3. 刷新插件列表并启用 `O Decimal`

#### 方式 2：使用 BRAT 按仓库地址加载

如果你在使用 [obsidian42-brat](https://github.com/TfTHacker/obsidian42-brat)，可以直接通过仓库地址安装本插件。

仓库地址：

- [https://github.com/Loong-T/o-decimal](https://github.com/Loong-T/o-decimal)

大致步骤：

1. 安装并启用 `BRAT`
2. 打开 BRAT 的设置页
3. 选择 `Add Beta plugin`
4. 输入仓库地址：`https://github.com/Loong-T/o-decimal`
5. 安装并启用插件

---

### 如何使用

#### 基础使用

安装后，打开：

- `设置 -> O Decimal`

你可以配置：

- 前缀显示模式
- 前缀识别正则
- 是否启用数字混合排序
- 是否显示无前缀警告 Badge
- 是否显示隐藏文件
- 各类 Badge 的样式

#### 前缀正则示例

插件内置了常见示例补全，也支持把多条规则写成多行，例如：

```text
^(\d+)_
^((?:\d+-\d+))_
```

上面这组默认规则会同时覆盖：

- `03_Project`
- `00-09_Project`
- `02-389_Project`

其他常见示例包括：

- `^(\d+)_`
  - 例：`03_Project`
- `^((?:\d+-\d+))_`
  - 例：`00-09_Project`
- `^\[(\d+)\]\s*`
  - 例：`[23] Project`
- `^(\d+)\.\s*`
  - 例：`03. Project`
- `^((?:\d+\.)+\d+)\s*`
  - 例：`02.389 Project`

#### 命令面板

可在命令面板中搜索：

- `前缀显示`
- `无前缀警告 Badge`

可快速切换常用显示状态。

---

### 开发

本项目使用：

- TypeScript
- esbuild
- `pnpm`

常用命令：

```bash
pnpm install
pnpm dev
pnpm build
pnpm lint
```

---

### 说明

- 本插件只作用于 **文件树**
- 不会修改真实文件名
- 不会修改链接、frontmatter 或文件内容
- 重点是让数字前缀命名法在文件树里更好看、更好用

---

## English

### Overview

`O Decimal` is a lightweight Obsidian plugin that improves the file explorer for users who organize files with numeric prefixes.

It focuses on two problems:

- prefixed names such as `01_Project` are visually noisy
- default explorer sorting splits folders and files into separate groups

This plugin only changes **file explorer display** and **file explorer sorting**. It does not rename files or change links.

---

### Current features

#### 1. Prefix display modes

Three display modes are available:

- `Original`
- `Badge`
- `Hidden`

For a real filename like `03_Project Alpha.md`:

- Original: `03_Project Alpha`
- Badge: `[03] Project Alpha`
- Hidden: `Project Alpha`

When renaming from the file explorer, the plugin restores the real filename automatically.

#### 2. Numeric mixed sorting

Files and folders can be sorted together by prefix value, instead of Obsidian's default folder-first grouping.

Example:

1. `01_Inbox/`
2. `02_Project.md`
3. `03_Resources/`
4. `10_Reading.md`

#### 3. Custom prefix regex

You can define your own prefix-matching rules.

- Default rules:
  - `^(\d+)_`
  - `^((?:\d+-\d+))_`
- Editable in settings with one regex per line
- Built-in preset suggestions appear when the input is focused
- Rules are tried from top to bottom
- If the regex contains a first capture group, that captured text is shown inside the badge

#### 4. Missing-prefix and hidden-item badges

The plugin can show extra badges for:

- items without a recognized prefix
- hidden items

Each badge type can be configured independently:

- show / hide
- badge text
- color, opacity, radius, and other style settings

If an item is both hidden and missing a prefix, the hidden badge takes priority.

#### 5. Show hidden files

The plugin can optionally reveal hidden files and folders in the file explorer, such as `.gitignore` or `.obsidian/`.

Note:

- this feature currently uses a heavier sync approach
- toggling it may lag in large vaults

#### 6. Command palette shortcuts

Commands are available for quickly toggling:

- prefix display mode
- missing-prefix warning badge

---

### Installation

#### Option 1: Local development / manual install

Clone the repository into your vault plugin folder:

```bash
cd <Your Vault>/.obsidian/plugins
git clone https://github.com/Loong-T/o-decimal.git nerd-is-in-o-decimal
cd nerd-is-in-o-decimal
pnpm install
pnpm build
```

Then open Obsidian:

- `Settings -> Community plugins`

Refresh plugins and enable `O Decimal`.

#### Option 2: Install with BRAT

If you use [obsidian42-brat](https://github.com/TfTHacker/obsidian42-brat), you can load this plugin directly from its repository.

Repository:

- [https://github.com/Loong-T/o-decimal](https://github.com/Loong-T/o-decimal)

Typical steps:

1. Install and enable `BRAT`
2. Open BRAT settings
3. Choose `Add Beta plugin`
4. Paste `https://github.com/Loong-T/o-decimal`
5. Install and enable the plugin

---

### Usage

Open:

- `Settings -> O Decimal`

You can configure:

- prefix display mode
- prefix regex
- numeric mixed sorting
- missing-prefix warning badge
- hidden file visibility
- badge appearance

#### Prefix regex examples

Built-in preset examples include multi-line rules like:

```text
^(\d+)_
^((?:\d+-\d+))_
```

Those default rules cover:

- `03_Project`
- `00-09_Project`
- `02-389_Project`

Other common examples include:

- `^(\d+)_`
  - Example: `03_Project`
- `^((?:\d+-\d+))_`
  - Example: `00-09_Project`
- `^\[(\d+)\]\s*`
  - Example: `[23] Project`
- `^(\d+)\.\s*`
  - Example: `03. Project`
- `^((?:\d+\.)+\d+)\s*`
  - Example: `02.389 Project`

#### Command palette

Search for:

- `Prefix display`
- `Warning badge`

to quickly switch common states.

---

### Development

This project uses:

- TypeScript
- esbuild
- `pnpm`

Common commands:

```bash
pnpm install
pnpm dev
pnpm build
pnpm lint
```

---

### Notes

- This plugin only targets the **file explorer**
- It does not rename real files
- It does not change links, frontmatter, or file contents
- Its goal is to make numeric-prefix naming cleaner and more practical in Obsidian

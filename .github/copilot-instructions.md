# Git Commit Message Rules

Generate ONE single commit message for all changes.

## Required Format

Single line header + optional multi-line body:

<type>(subproject):
<body>

---

## Header Rules

1. Header must appear ONLY ONCE.
2. Format:

type(subproject):

3. type must be one of:

feat | fix | docs | style | refactor | perf | test | chore

---

## Subproject Rules

1. Detect modified files under:

src/pages/

2. Extract the first-level directory name after `src/pages/`.

Examples:
- src/pages/main/a.vue → main
- src/pages/download/b.js → download

3. If multiple subprojects are modified:
- merge them
- remove duplicates
- join using commas

Example:

(main,download,test)

---

## Body Rules

### When only ONE logical change exists
Write ONE short Chinese sentence.

Example:

优化下载页面交互逻辑

---

### When MULTIPLE changes exist

You MUST:

- use numbered list
- each item describes one logical change
- keep sentences concise
- Chinese only

Format:

1. xxx
2. xxx
3. xxx

---

## VERY IMPORTANT RULES

- NEVER generate multiple commit headers
- NEVER repeat `type(subproject)`
- ALWAYS merge all changes into ONE commit message
- Body should be concise
- Do not include file paths
- Do not include explanations
- Do not use emojis

---

## Example (Multiple Changes)

feat(main,download,test):
1. 删除main页面的注释
2. download添加下载项编辑功能
3. test新增成功提示信息

---

Generate ONLY the commit message.
Strictly follow the format.
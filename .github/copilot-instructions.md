# Git Commit Message Rules

When generating git commit messages, you MUST follow the format below:

<type>(subproject): <body>
<email>

## Format Requirements

1. Commit message must contain exactly TWO lines.

2. Format:

type(subproject): body
email

3. type must be one of:
feat | fix | docs | style | refactor | perf | test | chore

4. subproject rules:
- Detect modified files under `src/pages/`
- Extract the first-level directory name after `src/pages/`
- If multiple subprojects are modified, join them using commas
- Example:
  - src/pages/editor/a.js → editor
  - src/pages/map/b.js → map
  - result → (editor,map)

5. body rules:
- MUST be written in Chinese
- Describe the actual code change clearly
- Use concise sentence
- DO NOT include file paths
- DO NOT include emojis
- DO NOT wrap lines

6. email rules:
- Use the git user email from repository config
- Always place email on the second line

## Example

feat(editor): 新增视频粘贴自动转换为video标签
dev@example.com

fix(editor,map): 修复组件销毁后内存未释放问题
dev@example.com

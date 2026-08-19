import re

with open('task.md', 'r') as f:
    content = f.read()

content = content.replace("- `[ ]` Install `@tauri-apps/plugin-shell`", "- `[x]` Install `@tauri-apps/plugin-shell`")
content = content.replace("- `[ ]` Update `src-tauri/capabilities/default.json` with shell permissions", "- `[x]` Update `src-tauri/capabilities/default.json` with shell permissions")
content = content.replace("- `[ ]` Add 'Run' button in `EditorModal`", "- `[x]` Add 'Run' button in `EditorModal`")
content = content.replace("- `[ ]` Implement code execution logic", "- `[x]` Implement code execution logic")
content = content.replace("- `[ ]` Implement temp file cleanup after execution", "- `[x]` Implement temp file cleanup after execution")
content = content.replace("- `[ ]` Add terminal output panel in `EditorModal`", "- `[x]` Add terminal output panel in `EditorModal`")

content = content.replace("- `[ ]` Add `snippet_history` table migration", "- `[x]` Add `snippet_history` table migration")
content = content.replace("- `[ ]` Update `saveSnippet` logic", "- `[x]` Update `saveSnippet` logic")
content = content.replace("- `[ ]` Add cleanup logic to maintain max 5 entries", "- `[x]` Add cleanup logic to maintain max 5 entries")
content = content.replace("- `[ ]` Create `HistoryModal`", "- `[x]` Create `HistoryModal`")
content = content.replace("- `[ ]` Implement restore version logic", "- `[x]` Implement restore version logic")

with open('task.md', 'w') as f:
    f.write(content)

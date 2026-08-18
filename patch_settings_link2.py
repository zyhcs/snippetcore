import re

with open('src/components/SettingsModal.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "const { open } = await import('@tauri-apps/plugin-opener'); await open",
    "const { openUrl } = await import('@tauri-apps/plugin-opener'); await openUrl"
)

with open('src/components/SettingsModal.tsx', 'w') as f:
    f.write(content)

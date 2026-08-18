import re

with open('src/components/SettingsModal.tsx', 'r') as f:
    content = f.read()

old_link = """<a href="https://github.com/settings/tokens/new" target="_blank" style={{ color: 'var(--theme-color)', textDecoration: 'none', fontWeight: 500 }}>"""

new_link = """<a href="#" onClick={async (e) => { e.preventDefault(); const { open } = await import('@tauri-apps/plugin-opener'); await open('https://github.com/settings/tokens/new?scopes=repo&description=SnippetCore+Sync'); }} style={{ color: 'var(--theme-color)', textDecoration: 'none', fontWeight: 500, cursor: 'pointer' }}>"""

content = content.replace(old_link, new_link)

with open('src/components/SettingsModal.tsx', 'w') as f:
    f.write(content)

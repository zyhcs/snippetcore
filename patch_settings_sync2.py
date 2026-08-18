import re

with open('src/components/SettingsModal.tsx', 'r') as f:
    content = f.read()

# Instead of exact replacement, let's use regex for all the sync buttons

content = re.sub(
    r'disabled=\{!localSettings\.githubToken \|\| isSyncing\}',
    r'disabled={isSyncing}',
    content
)

content = re.sub(
    r'onClick=\{async \(\) => \{\n(\s*)setIsSyncing\(true\);',
    r"onClick={async () => {\n\1if (!localSettings.githubToken?.trim()) {\n\1    showToast(locale === 'zh' ? '请填写 GitHub Token' : 'Please provide GitHub Token', 'error');\n\1    return;\n\1}\n\1setIsSyncing(true);",
    content
)

with open('src/components/SettingsModal.tsx', 'w') as f:
    f.write(content)

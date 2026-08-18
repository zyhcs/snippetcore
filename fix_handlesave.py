import re

with open('src/components/SettingsModal.tsx', 'r') as f:
    content = f.read()

old_handleSave = """    const handleSave = () => {
        if (localSettings.syncProvider === 'github') {
            if (!localSettings.githubToken?.trim()) {
                showToast(locale === 'zh' ? '请填写 GitHub Token' : 'Please provide GitHub Token', 'error');
                return;
            }
            if (!localSettings.githubRepoName?.trim() || !localSettings.githubRepoName.includes('/')) {
                showToast(locale === 'zh' ? '请填写正确的仓库格式，如 username/repo' : 'Invalid repo format. Use username/repo', 'error');
                return;
            }
        }
        onSave(localSettings);
    };"""

new_handleSave = """    const handleSave = () => {
        // Validation removed from global save. 
        // We only validate when explicitly testing/syncing in the Sync tab.
        onSave(localSettings);
    };"""

content = content.replace(old_handleSave, new_handleSave)

with open('src/components/SettingsModal.tsx', 'w') as f:
    f.write(content)

import re

with open('src/components/SettingsModal.tsx', 'r') as f:
    content = f.read()

# Replace the onClick handler for the sync button
old_sync = """                                            <button 
                                                className="btn-primary" 
                                                disabled={!localSettings.githubToken || isSyncing}
                                                onClick={async () => {
                                                setIsSyncing(true);"""

new_sync = """                                            <button 
                                                className="btn-primary" 
                                                disabled={isSyncing}
                                                onClick={async () => {
                                                if (!localSettings.githubToken?.trim()) {
                                                    showToast(locale === 'zh' ? '请填写 GitHub Token' : 'Please provide GitHub Token', 'error');
                                                    return;
                                                }
                                                setIsSyncing(true);"""

content = content.replace(old_sync, new_sync)

with open('src/components/SettingsModal.tsx', 'w') as f:
    f.write(content)

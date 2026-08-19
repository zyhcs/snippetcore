import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Replace the onAction handler
old_on_action = """            onAction={(action, snippet) => {
                setContextMenu(null);
                if (action === 'settings') {
                    setSettingsTab('appearance');
                    setIsSettingsOpen(true);
                } else if (action === 'share' && snippet) {
                    handleShareSnippet(snippet);
                } else if (action === 'delete' && snippet) {
                    handleDeleteSnippet(snippet.id);
                } else if (action === 'edit' && snippet) {
                    handleEditSnippet(snippet);
                } else if (action === 'copy' && snippet) {
                    handleCopySnippet(snippet.code_content);
                }
            }}"""

new_on_action = """            onAction={async (action, snippet) => {
                setContextMenu(null);
                if (action === 'settings') {
                    setSettingsTab('appearance');
                    setIsSettingsOpen(true);
                } else if (action === 'share' && snippet) {
                    handleShareSnippet(snippet);
                } else if (action === 'duplicate' && snippet) {
                    try {
                        await addSnippet({
                            title: snippet.title + (appSettings.locale === 'zh' ? ' (副本)' : ' (Copy)'),
                            code_content: snippet.code_content,
                            language: snippet.language,
                            tags: snippet.tags,
                            is_favorite: snippet.is_favorite
                        });
                        showToast(appSettings.locale === 'zh' ? '复制卡片成功' : 'Duplicated successfully', 'success');
                        loadSnippets();
                        if (appSettings.syncOnSave) {
                            if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
                            syncTimeoutRef.current = window.setTimeout(() => {
                                executeBackgroundSync('push');
                            }, 5000);
                        }
                    } catch (e) {
                        showToast(String(e), 'error');
                    }
                } else if (action === 'sync-push' || action === 'sync-pull') {
                    if (!appSettings.githubToken || appSettings.syncProvider !== 'github') {
                        showToast(appSettings.locale === 'zh' ? '请先在设置中配置并开启 GitHub 同步' : 'Please configure GitHub Sync in Settings', 'error');
                        setSettingsTab('sync');
                        setIsSettingsOpen(true);
                    } else {
                        executeBackgroundSync(action === 'sync-push' ? 'push' : 'pull');
                    }
                }
            }}"""

if old_on_action in content:
    content = content.replace(old_on_action, new_on_action)
else:
    print("Failed to replace onAction")

with open('src/App.tsx', 'w') as f:
    f.write(content)

import re

with open('src/components/SettingsModal.tsx', 'r') as f:
    content = f.read()

old_repo_label = """                                    <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>{t('repoNameLabel', locale) || 'Repository Name'}</label>"""

new_repo_label = """                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block' }}>{t('repoNameLabel', locale) || 'Repository Name'}</label>
                                        <button 
                                            className="text-primary hover:underline flex items-center gap-1"
                                            style={{ fontSize: '0.8rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                            onClick={async (e) => {
                                                e.preventDefault();
                                                if (!localSettings.githubToken) {
                                                    showToast(locale === 'zh' ? '请先填写 GitHub Token' : 'Please provide GitHub Token first', 'error');
                                                    return;
                                                }
                                                try {
                                                    const res = await fetch('https://api.github.com/user', {
                                                        headers: { 'Authorization': `token ${localSettings.githubToken}` }
                                                    });
                                                    if (!res.ok) throw new Error('Invalid token');
                                                    const user = await res.json();
                                                    const repo = localSettings.githubRepoName || 'snippetcore-sync';
                                                    
                                                    const { openUrl } = await import('@tauri-apps/plugin-opener');
                                                    await openUrl(`https://github.com/${user.login}/${repo}`);
                                                } catch (err) {
                                                    showToast(locale === 'zh' ? '无法获取用户信息，请检查 Token' : 'Failed to get user info, check Token', 'error');
                                                }
                                            }}
                                        >
                                            <i className="ri-external-link-line"></i> {locale === 'zh' ? '在 GitHub 中打开' : 'Open in GitHub'}
                                        </button>
                                    </div>"""

if old_repo_label in content:
    content = content.replace(old_repo_label, new_repo_label)
else:
    print("Could not find old_repo_label")

with open('src/components/SettingsModal.tsx', 'w') as f:
    f.write(content)

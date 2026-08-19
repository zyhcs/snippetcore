import re

with open('src/components/ContextMenu.tsx', 'r') as f:
    content = f.read()

# Replace snippet items
old_snippet_items = """                    <button className="context-menu-item" onClick={() => onAction('share', snippet)}>
                        <i className="ri-share-forward-line"></i> {t('share', locale)}
                    </button>
                    <button className="context-menu-item" onClick={() => onAction('copy', snippet)}>
                        <i className="ri-file-copy-line"></i> {t('copyCode', locale)}
                    </button>
                    <button className="context-menu-item" onClick={() => onAction('edit', snippet)}>
                        <i className="ri-edit-line"></i> {t('edit', locale) || '编辑片段'}
                    </button>
                    <button className="context-menu-item" style={{ color: '#ef4444' }} onClick={() => onAction('delete', snippet)}>
                        <i className="ri-delete-bin-line"></i> {t('deleteSnippet', locale)}
                    </button>"""

new_snippet_items = """                    <button className="context-menu-item" onClick={() => onAction('share', snippet)}>
                        <i className="ri-share-forward-line"></i> {t('share', locale) || '分享'}
                    </button>
                    <button className="context-menu-item" onClick={() => onAction('duplicate', snippet)}>
                        <i className="ri-file-copy-2-line"></i> {locale === 'zh' ? '复制卡片' : 'Duplicate'}
                    </button>"""

content = content.replace(old_snippet_items, new_snippet_items)

# Add sync-push and sync-pull below the settings button
old_global_items = """            <button className="context-menu-item" onClick={() => onAction('settings')}>
                <i className="ri-settings-3-line"></i> {t('settings', locale)}
            </button>"""

new_global_items = """            <button className="context-menu-item" onClick={() => onAction('sync-push')}>
                <i className="ri-upload-cloud-2-line"></i> {locale === 'zh' ? '同步到云端' : 'Sync to Cloud'}
            </button>
            <button className="context-menu-item" onClick={() => onAction('sync-pull')}>
                <i className="ri-download-cloud-2-line"></i> {locale === 'zh' ? '从云端同步' : 'Pull from Cloud'}
            </button>
            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '4px 0' }} />
            <button className="context-menu-item" onClick={() => onAction('settings')}>
                <i className="ri-settings-3-line"></i> {t('settings', locale)}
            </button>"""

content = content.replace(old_global_items, new_global_items)

with open('src/components/ContextMenu.tsx', 'w') as f:
    f.write(content)

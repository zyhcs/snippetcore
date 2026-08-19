import re

with open('src/components/SettingsModal.tsx', 'r') as f:
    content = f.read()

# 1. Update Checkbox styling
content = content.replace(
    "style={{ accentColor: 'var(--theme-color)', width: '18px', height: '18px', cursor: 'pointer' }}",
    "className=\"custom-checkbox\""
)

# 2. Rename Force Pull button text
content = content.replace(
    "{locale === 'zh' ? '强制从云端拉取' : 'Force Pull'}",
    "{locale === 'zh' ? '从云端同步到本地' : 'Sync to Local'}"
)
content = content.replace(
    "<i className=\"ri-download-cloud-2-line\"></i> {locale === 'zh' ? '从云端同步到本地' : 'Sync to Local'}",
    "{isSyncing ? <i className=\"ri-loader-4-line ri-spin\"></i> : <i className=\"ri-download-cloud-2-line\"></i>} {locale === 'zh' ? '从云端同步到本地' : 'Sync to Local'}"
)

# 3. Rename Sync Now button text
content = content.replace(
    "{t('syncNow', locale) || 'Sync Now'}",
    "{locale === 'zh' ? '同步到云端' : 'Sync to Cloud'}"
)

# 4. Remove Force Push button
force_push_pattern = r'<button\s+className="btn-secondary"\s+style=\{\{\s*flex:\s*1,\s*backgroundColor:\s*\'var\(--card-bg\)\',\s*border:\s*\'1px solid var\(--border-color\)\',\s*color:\s*\'var\(--text-primary\)\',\s*padding:\s*\'10px 24px\',\s*borderRadius:\s*\'8px\',\s*cursor:\s*\'pointer\',\s*fontWeight:\s*500,\s*display:\s*\'flex\',\s*alignItems:\s*\'center\',\s*justifyContent:\s*\'center\',\s*gap:\s*\'8px\',\s*transition:\s*\'all 0\.2s\'\s*\}\}\s+disabled=\{isSyncing\}\s+onClick=\{async \(\) => \{.*?\}\}\s*>\s*\{isSyncing \? <i className="ri-loader-4-line ri-spin"></i> : <i className="ri-upload-2-line"></i>\}\s*\{locale === \'zh\' \? \'强制推送\' : \'Force Push\'\}\s*</button>'

# Note: The pattern above might be too strict. 
# Let's just find the exact block and replace it.

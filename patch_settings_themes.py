import re

with open('src/components/SettingsModal.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    """<div className="radio-card" onClick={() => setLocalSettings({...localSettings, themePreset: 'default'})}>""",
    """<div className="radio-card" title={locale === 'zh' ? '默认的深色极客风主题，对比度适中' : 'Default dark geek theme'} onClick={() => setLocalSettings({...localSettings, themePreset: 'default'})}>"""
)

content = content.replace(
    """<div className="radio-card" onClick={() => setLocalSettings({...localSettings, themePreset: 'classic'})}>""",
    """<div className="radio-card" title={locale === 'zh' ? '支持自定义高亮色覆盖的经典深色主题' : 'Classic dark theme with custom highlight color'} onClick={() => setLocalSettings({...localSettings, themePreset: 'classic'})}>"""
)

with open('src/components/SettingsModal.tsx', 'w') as f:
    f.write(content)

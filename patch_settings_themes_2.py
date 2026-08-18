import re

with open('src/components/SettingsModal.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    """<div 
                                                key={theme.id}
                                                onClick={() => setLocalSettings({...localSettings, themePreset: theme.id})}""",
    """<div 
                                                key={theme.id}
                                                title={theme.id === 'classic' ? (locale === 'zh' ? '支持自定义高亮色覆盖的经典主题' : 'Classic theme with customizable highlight color') : (locale === 'zh' ? '预设深色主题' : 'Preset dark theme')}
                                                onClick={() => setLocalSettings({...localSettings, themePreset: theme.id})}"""
)

with open('src/components/SettingsModal.tsx', 'w') as f:
    f.write(content)

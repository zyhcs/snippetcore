import re

with open('src/components/SettingsModal.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    """<input 
                                            type="text" 
                                            value={localSettings[shortcutKey] as string} 
                                            readOnly
                                            onKeyDown={(e) => {""",
    """<input 
                                            type="text" 
                                            placeholder={locale === 'zh' ? '点击此处后按下快捷键...' : 'Click here and press keys...'}
                                            title={locale === 'zh' ? '点击输入框并直接按下键盘组合键（如 Command+Shift+L）' : 'Click and press keys (e.g. Command+Shift+L)'}
                                            value={localSettings[shortcutKey] as string} 
                                            readOnly
                                            onKeyDown={(e) => {"""
)

with open('src/components/SettingsModal.tsx', 'w') as f:
    f.write(content)

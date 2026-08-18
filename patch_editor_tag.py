import re

with open('src/components/EditorModal.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    """onChange={e => setNewTag(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && addTag()}""",
    """onChange={e => setNewTag(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && addTag()}
                                title={locale === 'zh' ? '输入标签名称后按回车添加' : 'Press Enter to add tag'}"""
)

with open('src/components/EditorModal.tsx', 'w') as f:
    f.write(content)

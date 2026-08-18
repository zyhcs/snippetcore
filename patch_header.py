import re

with open('src/components/Header.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    """<button className="btn-primary" onClick={onNewSnippet}>""",
    """<button className="btn-primary" onClick={onNewSnippet} title={locale === 'zh' ? '创建新的代码片段' : 'Create new snippet'}>"""
)

with open('src/components/Header.tsx', 'w') as f:
    f.write(content)

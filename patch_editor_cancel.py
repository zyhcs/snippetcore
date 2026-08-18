import re

with open('src/components/EditorModal.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    """<button className="btn-secondary" onClick={onClose}>{t('cancel', locale)}</button>""",
    """<button className="btn-secondary" onClick={onClose} title={locale === 'zh' ? '放弃修改并关闭' : 'Discard changes and close'}>{t('cancel', locale)}</button>"""
)

with open('src/components/EditorModal.tsx', 'w') as f:
    f.write(content)

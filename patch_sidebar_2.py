import re

with open('src/components/Sidebar.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    """className={`nav-item ${activeTab === 'all' && filterType === 'all' ? 'active' : ''}`}""",
    """className={`nav-item ${activeTab === 'all' && filterType === 'all' ? 'active' : ''}`} title={locale === 'zh' ? '所有代码片段' : 'All snippets'}"""
)

content = content.replace(
    """className={`nav-item ${filterType === 'favorites' ? 'active' : ''}`}""",
    """className={`nav-item ${filterType === 'favorites' ? 'active' : ''}`} title={locale === 'zh' ? '收藏的代码片段' : 'Favorite snippets'}"""
)

with open('src/components/Sidebar.tsx', 'w') as f:
    f.write(content)

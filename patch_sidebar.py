import re

with open('src/components/Sidebar.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    """<div className={`nav-item ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>""",
    """<div className={`nav-item ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')} title={locale === 'zh' ? '查看所有代码片段' : 'View all snippets'}>"""
)

content = content.replace(
    """<div className={`nav-item ${activeTab === 'favorites' ? 'active' : ''}`} onClick={() => setActiveTab('favorites')}>""",
    """<div className={`nav-item ${activeTab === 'favorites' ? 'active' : ''}`} onClick={() => setActiveTab('favorites')} title={locale === 'zh' ? '查看我收藏的片段' : 'View favorite snippets'}>"""
)

content = content.replace(
    """<div className={`nav-item ${activeTab === 'recents' ? 'active' : ''}`} onClick={() => setActiveTab('recents')}>""",
    """<div className={`nav-item ${activeTab === 'recents' ? 'active' : ''}`} onClick={() => setActiveTab('recents')} title={locale === 'zh' ? '查看最近浏览或修改的片段' : 'View recent snippets'}>"""
)

with open('src/components/Sidebar.tsx', 'w') as f:
    f.write(content)

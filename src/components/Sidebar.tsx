import React, { useMemo } from 'react';
import { Snippet, AppSettings } from '../types';
import { t } from '../i18n';

interface SidebarProps {
    snippets: Snippet[];
    filterType: 'all' | 'favorites';
    setFilterType: (type: 'all' | 'favorites') => void;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    onOpenSettings: (initialTab?: 'appearance' | 'languages' | 'sidebar') => void;
    settings: AppSettings;
}

const Sidebar: React.FC<SidebarProps> = ({ snippets, filterType, setFilterType, activeTab, setActiveTab, onOpenSettings, settings }) => {
    const locale = settings.locale;
    const totalCount = snippets.length;
    const favoriteCount = snippets.filter(s => s.is_favorite).length;
    const pinnedLanguages = settings.pinnedLanguages || [];
    const pinnedTags = settings.pinnedTags || [];
    
    const { langCounts, tagCounts, tags } = useMemo(() => {
        const langCounts: Record<string, number> = {};
        const tagCounts: Record<string, number> = {};
        
        snippets.forEach(s => {
            if (s.language) {
                langCounts[s.language] = (langCounts[s.language] || 0) + 1;
            }
            try {
                const parsed = JSON.parse(s.tags || '[]');
                const tagsArr = Array.isArray(parsed) ? parsed : (typeof parsed === 'string' ? JSON.parse(parsed) : []);
                if (Array.isArray(tagsArr)) {
                    tagsArr.forEach((t: string) => {
                        if (t) tagCounts[t] = (tagCounts[t] || 0) + 1;
                    });
                }
            } catch {}
        });
        const tags = Object.keys(tagCounts).sort();
        return { langCounts, tagCounts, tags };
    }, [snippets]);
    return (
        <aside className="sidebar">
            <div className="logo">
                <i className="ri-code-box-fill"></i>
                <span>SnippetCore</span>
            </div>
            
            <div className="nav-section">
                <div className="nav-title">{t('library', locale)}</div>
                <a 
                    href="#"
                    className={`nav-item ${activeTab === 'all' && filterType === 'all' ? 'active' : ''}`} 
                    onClick={(e) => { e.preventDefault(); setActiveTab('all'); setFilterType('all'); }}
                >
                    <i className="ri-layout-grid-line"></i>
                    <span>{t('all', locale)}</span>
                    <span className="badge">{totalCount}</span>
                </a>
                <a 
                    href="#"
                    className={`nav-item ${filterType === 'favorites' ? 'active' : ''}`}
                    onClick={(e) => { e.preventDefault(); setFilterType('favorites'); }}
                >
                    <i className="ri-star-line"></i>
                    <span>{t('favorites', locale)}</span>
                    <span className="badge">{favoriteCount}</span>
                </a>
            </div>

            <div className="nav-section">
                <div className="nav-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {t('languages', locale)}
                    <i 
                        className="ri-settings-4-line" 
                        style={{ cursor: 'pointer', opacity: 0.6 }} 
                        onClick={() => onOpenSettings('sidebar')}
                        title={t('manage', locale)}
                    ></i>
                </div>
                {pinnedLanguages.length === 0 ? (
                    <div style={{ padding: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center', background: 'rgba(0,0,0,0.1)', borderRadius: '6px' }}>
                        {t('noPinnedItems', locale)}
                    </div>
                ) : (
                    <div className="tags-cloud">
                        <button 
                            className={`lang-tag ${activeTab === 'all' ? 'active' : ''}`}
                            onClick={() => setActiveTab('all')}
                            style={{ '--tag-color': '#94a3b8' } as React.CSSProperties}
                        >
                            {t('all', locale)} <span className="tag-count">{totalCount}</span>
                        </button>
                        {pinnedLanguages.map((tab, idx) => {
                            const colors = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e'];
                        const color = colors[idx % colors.length];
                        const count = langCounts[tab] || 0;
                        return (
                            <button 
                                key={tab}
                                className={`lang-tag ${activeTab === tab ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab)}
                                style={{ '--tag-color': color } as React.CSSProperties}
                            >
                                {tab} {count > 0 && <span className="tag-count">{count}</span>}
                            </button>
                        );
                        })}
                    </div>
                )}
            </div>

            <div className="nav-section">
                <div className="nav-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {t('tags', locale)}
                    <i 
                        className="ri-settings-4-line" 
                        style={{ cursor: 'pointer', opacity: 0.6 }} 
                        onClick={() => onOpenSettings('sidebar')}
                        title={t('manage', locale)}
                    ></i>
                </div>
                {pinnedTags.length === 0 ? (
                    <div style={{ padding: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center', background: 'rgba(0,0,0,0.1)', borderRadius: '6px' }}>
                        {t('noPinnedItems', locale)}
                    </div>
                ) : (
                    <div className="tags-cloud">
                        {pinnedTags.filter(t => tags.includes(t)).map((tag) => (
                            <button 
                                key={tag}
                                className={`lang-tag ${activeTab === tag ? 'active' : ''}`}
                                onClick={() => setActiveTab(tag)}
                                style={{ '--tag-color': '#64748b' } as React.CSSProperties}
                            >
                                <i className="ri-hashtag"></i> {tag} <span className="tag-count">{tagCounts[tag]}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div style={{ flex: 1 }}></div>

            <div className="sidebar-footer" style={{ borderTop: '1px solid var(--border-color)', padding: '16px', display: 'flex', alignItems: 'center' }}>
                <button 
                    className="btn-icon" 
                    onClick={() => onOpenSettings()} 
                    title={t('settings', locale)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                    <i className="ri-settings-3-line"></i>
                    <span>{t('settings', locale)}</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;

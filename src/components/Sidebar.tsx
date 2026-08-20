// @ts-nocheck
import React, { useMemo, useState } from 'react';
import { Snippet, AppSettings, Folder } from '../types';
// import { createFolder, renameFolder, deleteFolder } from '../db';
// import { v4 as uuidv4 } from 'uuid';
import { t } from '../i18n';

interface SidebarProps {
    snippets: Snippet[];
    folders?: any;
    onFoldersChange?: any;
    filterType: 'all' | 'favorites' | 'language' | 'tag' | 'folder' | any;
    setFilterType: (type: any) => void;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    onOpenSettings: (initialTab?: 'appearance' | 'languages' | 'sidebar') => void;
    settings: AppSettings;
}

const getTagColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e'];
    return colors[Math.abs(hash) % colors.length];
};

const Sidebar: React.FC<SidebarProps> = ({ snippets, folders = [], onFoldersChange, filterType, setFilterType, activeTab, setActiveTab, onOpenSettings, settings }) => {
    const locale = settings.locale;
    const [isLangOpen, setIsLangOpen] = useState(true);
    const [isTagsOpen, setIsTagsOpen] = useState(true);
    // const [isFoldersOpen, setIsFoldersOpen] = useState(true);
    
    const [langSearch, setLangSearch] = useState('');
    const [tagSearch, setTagSearch] = useState('');
    
    // const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
    // const [folderNameInput, setFolderNameInput] = useState('');
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
            
            
            <div className="nav-section">
                <div className="nav-title">{t('library', locale)}</div>
                <a 
                    href="#"
                    className={`nav-item ${activeTab === 'all' && filterType === 'all' ? 'active' : ''}`} title={locale === 'zh' ? '所有代码片段' : 'All snippets'} 
                    onClick={(e) => { e.preventDefault(); setActiveTab('all'); setFilterType('all'); }}
                >
                    <i className="ri-layout-grid-line"></i>
                    <span>{t('all', locale)}</span>
                    <span className="badge">{totalCount}</span>
                </a>
                <a 
                    href="#"
                    className={`nav-item ${filterType === 'favorites' ? 'active' : ''}`} title={locale === 'zh' ? '收藏的代码片段' : 'Favorite snippets'}
                    onClick={(e) => { e.preventDefault(); setFilterType('favorites'); }}
                >
                    <i className="ri-star-line"></i>
                    <span>{t('favorites', locale)}</span>
                    <span className="badge">{favoriteCount}</span>
                </a>
            </div>

            
            <div className="nav-section scrollable">
                <div 
                    className="nav-title" 
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => setIsLangOpen(!isLangOpen)}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <i className={isLangOpen ? "ri-arrow-down-s-line" : "ri-arrow-right-s-line"}></i>
                        {t('languages', locale)}
                    </div>
                    <i 
                        className="ri-settings-4-line" 
                        style={{ cursor: 'pointer', opacity: 0.6 }} 
                        onClick={(e) => { e.stopPropagation(); onOpenSettings('sidebar'); }}
                        title={t('manage', locale)}
                    ></i>
                </div>
                {isLangOpen && (
                    <>
                        <div style={{ padding: '0 8px 8px' }}>
                            <div className="search-input-wrapper" style={{ background: 'rgba(0,0,0,0.2)', padding: '4px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <i className="ri-search-line" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}></i>
                                <input 
                                    type="text" 
                                    autoComplete="off"
                                    spellCheck={false}
                                    placeholder={locale === 'zh' ? '搜索语言...' : 'Search languages...'}
                                    value={langSearch}
                                    onChange={(e) => setLangSearch(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    style={{ border: 'none', background: 'transparent', color: 'var(--text-primary)', outline: 'none', fontSize: '0.8rem', width: '100%' }}
                                />
                            </div>
                        </div>
                        {pinnedLanguages.filter(l => l.toLowerCase().includes(langSearch.toLowerCase())).length === 0 ? (
                            <div style={{ padding: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center', background: 'rgba(0,0,0,0.1)', borderRadius: '6px', margin: '0 8px' }}>
                                {langSearch ? (locale === 'zh' ? '无结果' : 'No results') : t('noPinnedItems', locale)}
                            </div>
                        ) : (
                            <div className="tags-cloud">
                                {!langSearch && (
                                    <button 
                                        className={`lang-tag ${activeTab === 'all' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('all')}
                                        style={{ '--tag-color': '#94a3b8' } as React.CSSProperties}
                                    >
                                        {t('all', locale)} <span className="tag-count">{totalCount}</span>
                                    </button>
                                )}
                                {pinnedLanguages
                                    .filter(tab => tab.toLowerCase().includes(langSearch.toLowerCase()))
                                    .map((tab, idx) => {
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
                    </>
                )}
            </div>

            
            <div className="nav-section scrollable">
                <div 
                    className="nav-title" 
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => setIsTagsOpen(!isTagsOpen)}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <i className={isTagsOpen ? "ri-arrow-down-s-line" : "ri-arrow-right-s-line"}></i>
                        {t('tags', locale)}
                    </div>
                    <i 
                        className="ri-settings-4-line" 
                        style={{ cursor: 'pointer', opacity: 0.6 }} 
                        onClick={(e) => { e.stopPropagation(); onOpenSettings('sidebar'); }}
                        title={t('manage', locale)}
                    ></i>
                </div>
                {isTagsOpen && (
                    <>
                        <div style={{ padding: '0 8px 8px' }}>
                            <div className="search-input-wrapper" style={{ background: 'rgba(0,0,0,0.2)', padding: '4px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <i className="ri-search-line" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}></i>
                                <input 
                                    type="text" 
                                    autoComplete="off"
                                    spellCheck={false}
                                    placeholder={locale === 'zh' ? '搜索标签...' : 'Search tags...'}
                                    value={tagSearch}
                                    onChange={(e) => setTagSearch(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    style={{ border: 'none', background: 'transparent', color: 'var(--text-primary)', outline: 'none', fontSize: '0.8rem', width: '100%' }}
                                />
                            </div>
                        </div>
                        {pinnedTags.filter(t => tags.includes(t) && t.toLowerCase().includes(tagSearch.toLowerCase())).length === 0 ? (
                            <div style={{ padding: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center', background: 'rgba(0,0,0,0.1)', borderRadius: '6px', margin: '0 8px' }}>
                                {tagSearch ? (locale === 'zh' ? '无结果' : 'No results') : t('noPinnedItems', locale)}
                            </div>
                        ) : (
                            <div className="tags-cloud">
                                {pinnedTags
                                    .filter(t => tags.includes(t) && t.toLowerCase().includes(tagSearch.toLowerCase()))
                                    .map((tag) => (
                                    <button 
                                        key={tag}
                                        className={`hash-tag ${activeTab === tag ? 'active' : ''}`}
                                        onClick={() => setActiveTab(tag)}
                                        style={{ '--tag-color': getTagColor(tag) } as React.CSSProperties}
                                    >
                                        <i className="ri-hashtag"></i> {tag} <span className="tag-count">{tagCounts[tag]}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            <div style={{ flex: 1 }}></div>

        </aside>
    );
};

export default Sidebar;

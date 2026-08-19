import React, { useState, useEffect } from 'react';
import { Snippet } from '../types';
import CodeMirror from '@uiw/react-codemirror';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { Extension } from '@codemirror/state';
import { LANGUAGE_REGISTRY } from '../utils/languages';

interface SnippetCardProps {
    snippet: Snippet;
    onClick: () => void;
    onDelete: (e: React.MouseEvent) => void;
    onToggleFavorite: (e: React.MouseEvent) => void;
    onCopy: (e: React.MouseEvent) => void;
    onContextMenu?: (e: React.MouseEvent, snippet: Snippet) => void;
    locale?: Locale;
}

const getLanguageIcon = (lang: string) => {
    switch (lang.toLowerCase()) {
        case 'javascript': return <i className="ri-javascript-line" style={{ color: '#f7df1e' }}></i>;
        case 'python': return <i className="ri-file-code-line" style={{ color: '#3b82f6' }}></i>;
        case 'markdown': return <i className="ri-markdown-line" style={{ color: '#f43f5e' }}></i>;
        case 'css': return <i className="ri-css3-line" style={{ color: '#3b82f6' }}></i>;
        case 'html': return <i className="ri-html5-line" style={{ color: '#e34f26' }}></i>;
        case 'multi-file': return <i className="ri-stack-line" style={{ color: '#8b5cf6' }}></i>;
        default: return <i className="ri-file-text-line" style={{ color: '#06b6d4' }}></i>;
    }
};

import { Locale, t } from '../i18n';


export const getTagColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e'];
    return colors[Math.abs(hash) % colors.length];
};

const SnippetCard: React.FC<SnippetCardProps> = ({ snippet, onClick, onDelete, onToggleFavorite, onCopy, onContextMenu, locale = 'zh' }) => {
    const [langExt, setLangExt] = useState<Extension[]>([]);
    useEffect(() => {
        let isMounted = true;
        const langDef = LANGUAGE_REGISTRY.find(l => l.id === snippet.language);
        if (langDef && langDef.load) {
            langDef.load().then(ext => {
                if (isMounted && ext) setLangExt([ext]);
            }).catch(() => {});
        }
        return () => { isMounted = false; };
    }, [snippet.language]);
    let tags: string[] = [];
    try {
        const parsed = JSON.parse(snippet.tags || '[]');
        tags = Array.isArray(parsed) ? parsed : (typeof parsed === 'string' ? JSON.parse(parsed) : []);
        if (!Array.isArray(tags)) tags = [];
    } catch {
        tags = [];
    }

    return (
        <div 
            className="snippet-card" 
            onClick={onClick}
            onContextMenu={onContextMenu ? (e) => onContextMenu(e, snippet) : undefined}
        >
            <div className="card-header">
                <div className="card-title">
                    {getLanguageIcon(snippet.language)}
                    {snippet.title || 'Untitled'}
                    {!!snippet.is_favorite && <i className="ri-star-fill" style={{ color: '#eab308', fontSize: '1rem', marginLeft: '4px' }}></i>}
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                    <button className="btn-icon" onClick={onToggleFavorite} title={t('favorite', locale)}>
                        <i className={snippet.is_favorite ? "ri-star-fill" : "ri-star-line"} style={{ color: snippet.is_favorite ? '#eab308' : undefined }}></i>
                    </button>
                    <button className="btn-icon" onClick={onCopy} title={t('copyCode', locale)}>
                        <i className="ri-file-copy-line"></i>
                    </button>
                    <button className="btn-icon" onClick={onDelete} title={t('deleteSnippet', locale)}>
                        <i className="ri-delete-bin-line" style={{ color: '#ef4444' }}></i>
                    </button>
                    <button className="btn-icon" onClick={(e) => { e.stopPropagation(); onClick(); }} title={t('edit', locale) || '编辑片段'}>
                        <i className="ri-edit-line"></i>
                    </button>
                </div>
            </div>
            <div className="card-code" style={{ padding: 0, overflow: 'hidden' }}>
                <CodeMirror
                    value={snippet.code_content}
                    theme={vscodeDark}
                    editable={false}
                    extensions={langExt}
                    basicSetup={{
                        lineNumbers: false,
                        foldGutter: false,
                        highlightActiveLine: false
                    }}
                    style={{ fontSize: '0.8rem' }}
                />
            </div>
            <div className="card-tags">
                <span className="hash-tag" style={{ '--tag-color': getTagColor(snippet.language || 'Text'), cursor: 'default' } as React.CSSProperties}>
                    {snippet.language || 'Text'}
                </span>
                {tags.map((tag: string, index: number) => (
                    <span key={index} className="hash-tag" style={{ '--tag-color': getTagColor(tag), cursor: 'default' } as React.CSSProperties}>
                        <i className="ri-hashtag"></i> {tag}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default SnippetCard;

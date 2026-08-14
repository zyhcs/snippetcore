import React from 'react';
import { Snippet } from '../types';
import CodeMirror from '@uiw/react-codemirror';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { getLanguageExtension } from './EditorModal';

interface SnippetCardProps {
    snippet: Snippet;
    onClick: () => void;
    onDelete: (e: React.MouseEvent) => void;
    onToggleFavorite: (e: React.MouseEvent) => void;
    onCopy: (e: React.MouseEvent) => void;
    onShare?: (e: React.MouseEvent) => void;
    locale?: Locale;
}

const getLanguageIcon = (lang: string) => {
    switch (lang.toLowerCase()) {
        case 'javascript': return <i className="ri-javascript-line" style={{ color: '#f7df1e' }}></i>;
        case 'python': return <i className="ri-file-code-line" style={{ color: '#3b82f6' }}></i>;
        case 'markdown': return <i className="ri-markdown-line" style={{ color: '#f43f5e' }}></i>;
        case 'css': return <i className="ri-css3-line" style={{ color: '#3b82f6' }}></i>;
        case 'html': return <i className="ri-html5-line" style={{ color: '#e34f26' }}></i>;
        default: return <i className="ri-file-text-line" style={{ color: '#06b6d4' }}></i>;
    }
};

import { Locale, t } from '../i18n';

const SnippetCard: React.FC<SnippetCardProps> = ({ snippet, onClick, onDelete, onToggleFavorite, onCopy, onShare, locale = 'zh' }) => {
    let tags: string[] = [];
    try {
        const parsed = JSON.parse(snippet.tags || '[]');
        tags = Array.isArray(parsed) ? parsed : (typeof parsed === 'string' ? JSON.parse(parsed) : []);
        if (!Array.isArray(tags)) tags = [];
    } catch {
        tags = [];
    }

    return (
        <div className="snippet-card" onClick={onClick}>
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
                    {onShare && (
                        <button className="btn-icon" onClick={onShare} title={t('share', locale)}>
                            <i className="ri-share-forward-line"></i>
                        </button>
                    )}
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
                    extensions={[
                        getLanguageExtension(snippet.language)
                    ]}
                    basicSetup={{
                        lineNumbers: false,
                        foldGutter: false,
                        highlightActiveLine: false
                    }}
                    style={{ fontSize: '0.8rem' }}
                />
            </div>
            <div className="card-tags">
                <span className="tag tag-purple">{snippet.language || 'Text'}</span>
                {tags.map((tag: string, index: number) => (
                    <span key={index} className="tag">{tag}</span>
                ))}
            </div>
        </div>
    );
};

export default SnippetCard;

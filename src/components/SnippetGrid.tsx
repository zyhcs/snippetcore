import React from 'react';
import { Snippet } from '../types';
import SnippetCard from './SnippetCard';
import { Locale, t } from '../i18n';

interface SnippetGridProps {
    snippets: Snippet[];
    onEditSnippet: (snippet: Snippet) => void;
    onDeleteSnippet: (id: string) => void;
    onToggleFavorite: (snippet: Snippet) => void;
    onCopySnippet: (code: string) => void;
    onShareSnippet?: (snippet: Snippet) => void;
    locale?: Locale;
}

const SnippetGrid: React.FC<SnippetGridProps> = ({ snippets, onEditSnippet, onDeleteSnippet, onToggleFavorite, onCopySnippet, onShareSnippet, locale = 'zh' }) => {
    return (
        <div className="snippet-grid">
            {snippets.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '40px', gridColumn: '1 / -1' }}>
                    <i className="ri-inbox-line" style={{ fontSize: '3rem', opacity: 0.5 }}></i>
                    <p style={{ marginTop: '16px' }}>{t('searchEmpty', locale)}</p>
                </div>
            ) : (
                snippets.map(snippet => (
                    <SnippetCard 
                        key={snippet.id} 
                        snippet={snippet} 
                        onClick={() => onEditSnippet(snippet)} 
                        onDelete={(e) => { e.stopPropagation(); onDeleteSnippet(snippet.id); }}
                        onToggleFavorite={(e) => { e.stopPropagation(); onToggleFavorite(snippet); }}
                        onCopy={(e) => { e.stopPropagation(); onCopySnippet(snippet.code_content); }}
                        onShare={onShareSnippet ? (e) => { e.stopPropagation(); onShareSnippet(snippet); } : undefined}
                    />
                ))
            )}
        </div>
    );
};

export default SnippetGrid;

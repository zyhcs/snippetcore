import React, { useRef, useEffect } from 'react';
import { Locale, t } from '../i18n';

interface HeaderProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    onNewSnippet: () => void;
    locale?: Locale;
}

const Header: React.FC<HeaderProps> = ({ searchQuery, setSearchQuery, onNewSnippet, locale = 'zh' }) => {
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleFocusSearch = () => {
            if (searchInputRef.current) {
                searchInputRef.current.focus();
                searchInputRef.current.select();
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            // Cmd+K or Ctrl+K to focus search
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                handleFocusSearch();
            }
        };

        window.addEventListener('focus-search', handleFocusSearch);
        window.addEventListener('keydown', handleKeyDown);
        
        return () => {
            window.removeEventListener('focus-search', handleFocusSearch);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return (
        <header className="top-bar">
            <div className="search-container">
                <div className="search-input-wrapper">
                    <input 
                        ref={searchInputRef}
                        type="text"  
                        placeholder={t('searchPlaceholder', locale)}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    
                    <button className="btn-primary" onClick={onNewSnippet} title={locale === 'zh' ? '创建新的代码片段' : 'Create new snippet'}>
                        <i className="ri-add-line"></i> {t('newSnippet', locale)}
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;

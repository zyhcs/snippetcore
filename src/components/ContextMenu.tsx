import React, { useEffect, useRef } from 'react';
import { Snippet } from '../types';
import { t, Locale } from '../i18n';

interface ContextMenuProps {
    x: number;
    y: number;
    type: 'global' | 'snippet';
    snippet?: Snippet;
    locale: Locale;
    onClose: () => void;
    onAction: (action: string, snippet?: Snippet) => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, type, snippet, locale, onClose, onAction }) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [onClose]);

    // Ensure menu stays within viewport
    let top = y;
    let left = x;
    
    // Quick approximation
    if (window.innerHeight - y < 150) top = y - 150;
    if (window.innerWidth - x < 200) left = x - 200;

    return (
        <div 
            ref={menuRef}
            style={{
                position: 'fixed',
                top: `${top}px`,
                left: `${left}px`,
                background: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                padding: '4px',
                zIndex: 9999,
                minWidth: '160px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                fontSize: '0.9rem',
                color: 'var(--text-primary)'
            }}
            onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
        >
            {type === 'snippet' && snippet && (
                <>
                    <button className="context-menu-item" onClick={() => onAction('share', snippet)}>
                        <i className="ri-share-forward-line"></i> {t('share', locale) || '分享'}
                    </button>
                    <button className="context-menu-item" onClick={() => onAction('duplicate', snippet)}>
                        <i className="ri-file-copy-2-line"></i> {locale === 'zh' ? '复制卡片' : 'Duplicate'}
                    </button>
                    <button className="context-menu-item" onClick={() => onAction('export', snippet)}>
                        <i className="ri-download-2-line"></i> {locale === 'zh' ? '导出为文件' : 'Export to File'}
                    </button>
                    <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '4px 0' }} />
                </>
            )}
            <button className="context-menu-item" onClick={() => onAction('sync-push')}>
                <i className="ri-upload-cloud-2-line"></i> {locale === 'zh' ? '同步到云端' : 'Sync to Cloud'}
            </button>
            <button className="context-menu-item" onClick={() => onAction('sync-pull')}>
                <i className="ri-download-cloud-2-line"></i> {locale === 'zh' ? '从云端同步' : 'Pull from Cloud'}
            </button>
            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '4px 0' }} />
            <button className="context-menu-item" onClick={() => onAction('settings')}>
                <i className="ri-settings-3-line"></i> {t('settings', locale)}
            </button>
        </div>
    );
};

export default ContextMenu;

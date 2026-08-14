import React from 'react';

import { Locale, t } from '../i18n';

interface ConfirmModalProps {
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    locale?: Locale;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ title, message, onConfirm, onCancel, locale = 'zh' }) => {
    return (
        <div className="modal-overlay active" style={{ zIndex: 2000 }} onClick={onCancel}>
            <div className="modal-content confirm-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', display: 'flex', flexDirection: 'column' }}>
                <div className="modal-header" style={{ padding: '20px', paddingBottom: '16px' }}>
                    <h2 style={{ fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                        <i className="ri-error-warning-line" style={{ color: '#ef4444' }}></i>
                        {title}
                    </h2>
                    <button className="btn-icon" onClick={onCancel}>
                        <i className="ri-close-line"></i>
                    </button>
                </div>
                
                <div className="modal-body" style={{ padding: '0 20px 24px 20px', color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                    {message}
                </div>
                
                <div className="modal-footer" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border-color)', background: 'var(--hover-bg)' }}>
                    <button className="btn-secondary" onClick={onCancel}>{t('cancel', locale)}</button>
                    <button className="btn-primary" style={{ background: '#ef4444', color: '#fff' }} onClick={onConfirm}>{t('confirmDelete', locale)}</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;

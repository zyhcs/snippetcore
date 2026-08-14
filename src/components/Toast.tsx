import React, { useState, useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export function ToastContainer() {
    const [toasts, setToasts] = useState<{ id: number, message: string, type: ToastType }[]>([]);

    useEffect(() => {
        const handleToast = (e: any) => {
            const id = Date.now();
            setToasts(prev => [...prev, { id, message: e.detail.message, type: e.detail.type }]);
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, 3000);
        };
        window.addEventListener('show-toast', handleToast);
        return () => window.removeEventListener('show-toast', handleToast);
    }, []);

    if (toasts.length === 0) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            zIndex: 9999,
            pointerEvents: 'none'
        }}>
            {toasts.map(t => (
                <div key={t.id} style={{
                    background: 'var(--card-bg, #1a1d24)',
                    color: 'var(--text-primary)',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
                    border: '1px solid var(--border-color)',
                    borderLeft: t.type === 'error' ? '4px solid var(--danger-color, #ef4444)' : '4px solid var(--theme-color)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    animation: 'toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1), toastFadeOut 0.3s ease 2.7s forwards'
                }}>
                    {t.type === 'success' && <i className="ri-checkbox-circle-fill" style={{ fontSize: '1.2rem', color: 'var(--theme-color)' }}></i>}
                    {t.type === 'error' && <i className="ri-error-warning-fill" style={{ fontSize: '1.2rem', color: 'var(--danger-color, #ef4444)' }}></i>}
                    {t.type === 'info' && <i className="ri-information-fill" style={{ fontSize: '1.2rem', color: 'var(--theme-color)' }}></i>}
                    {t.message}
                </div>
            ))}
        </div>
    );
}

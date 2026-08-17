import React, { useRef, useState } from 'react';
import { Snippet, AppSettings } from '../types';
import { t } from '../i18n';
import * as htmlToImage from 'html-to-image';
import { PrismAsync as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ShareModalProps {
    snippet: Snippet;
    settings: AppSettings;
    onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ snippet, settings, onClose }) => {
    const locale = settings.locale || 'zh';
    const exportRef = useRef<HTMLDivElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleDownload = async () => {
        if (!exportRef.current) return;
        setIsGenerating(true);

        try {
            await new Promise(r => setTimeout(r, 600));

            const dataUrl = await htmlToImage.toPng(exportRef.current, { 
                pixelRatio: 2, 
                backgroundColor: 'transparent',
                style: { margin: '0' }
            });

            try {
                const { save } = await import('@tauri-apps/plugin-dialog');
                const { writeFile } = await import('@tauri-apps/plugin-fs');
                
                const base64Data = dataUrl.split(',')[1];
                const binaryString = window.atob(base64Data);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }

                const filePath = await save({
                    filters: [{
                        name: 'Image',
                        extensions: ['png']
                    }],
                    defaultPath: `snippet-${snippet.title || 'untitled'}.png`
                });

                if (filePath) {
                    await writeFile(filePath, bytes);
                }
            } catch (err) {
                console.warn('Tauri save failed, falling back to web download', err);
                const link = document.createElement('a');
                link.download = `snippet-${snippet.title || 'untitled'}.png`;
                link.href = dataUrl;
                link.click();
            }
        } catch (error) {
            console.error('Failed to generate image:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const SnippetContent = ({ forExport = false }) => (
        <div 
            style={{ 
                background: 'linear-gradient(135deg, #1f1c2c 0%, #928DAB 100%)', 
                padding: '40px', 
                borderRadius: '16px',
                width: forExport ? 'max-content' : '100%',
                minWidth: forExport ? '800px' : '100%',
                boxSizing: 'border-box'
            }}
        >
            <div style={{ width: '100%', background: '#1e1e1e', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f56' }}></div>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffbd2e' }}></div>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#27c93f' }}></div>
                    </div>
                    <div style={{ marginLeft: '12px', color: '#888', fontSize: '0.85rem', fontFamily: 'monospace' }}>
                        {snippet.title || 'untitled'}
                    </div>
                </div>
                <div style={{ padding: '0 20px', paddingBottom: '20px', width: forExport ? 'max-content' : '100%', minWidth: '100%', boxSizing: 'border-box' }}>
                    <SyntaxHighlighter
                        language={snippet.language?.toLowerCase() || 'javascript'}
                        style={vscDarkPlus}
                        PreTag="div"
                        customStyle={{ 
                            background: 'transparent', 
                            fontSize: '14px', 
                            fontFamily: '"JetBrains Mono", "Fira Code", "Menlo", monospace',
                            margin: 0,
                            padding: '20px 20px 20px 0',
                            overflow: forExport ? 'visible' : 'auto',
                            width: forExport ? 'max-content' : '100%',
                            minWidth: '100%'
                        }}
                    >
                        {snippet.code_content}
                    </SyntaxHighlighter>
                </div>
            </div>
        </div>
    );

    return (
        <div className="modal-overlay active" onClick={onClose} style={{ zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ width: '800px', maxWidth: '95vw', padding: '20px', background: '#2a2a2a', borderRadius: '16px', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
                
                {/* Visible Preview Area (Scrollable within modal, nice UX) */}
                <div style={{ flex: 1, overflow: 'auto', borderRadius: '16px', marginBottom: '20px', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)' }}>
                    <SnippetContent forExport={false} />
                </div>

                {/* Fixed Action Buttons at the Bottom */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexShrink: 0 }}>
                    <button className="btn btn-secondary" onClick={onClose} disabled={isGenerating}>
                        {t('cancel', locale)}
                    </button>
                    <button className="btn btn-primary" onClick={handleDownload} disabled={isGenerating}>
                        {isGenerating ? t('generatingImage', locale) || 'Generating...' : t('downloadImage', locale)}
                    </button>
                </div>
            </div>

            {/* Hidden Export Container (Full unconstrained width/height for capturing) */}
            <div style={{ position: 'fixed', top: '-10000px', left: '-10000px' }}>
                <div ref={exportRef}>
                    <SnippetContent forExport={true} />
                </div>
            </div>
        </div>
    );
};

export default ShareModal;

import React, { useRef, useState, useEffect } from 'react';
import { Snippet, AppSettings } from '../types';
import { t } from '../i18n';
import CodeMirror from '@uiw/react-codemirror';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { EditorView } from '@codemirror/view';
import * as htmlToImage from 'html-to-image';
import { Extension } from '@codemirror/state';
import { LANGUAGE_REGISTRY } from '../utils/languages';
import { showToast } from '../utils/toast';

interface ShareModalProps {
    snippet: Snippet;
    settings: AppSettings;
    onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ snippet, settings, onClose }) => {
    const locale = settings.locale || 'zh';
    const previewRef = useRef<HTMLDivElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);
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

    const handleDownload = async () => {
        if (!previewRef.current) return;
        setIsGenerating(true);
        try {
            // Give CodeMirror a little time to finish rendering completely before capturing
            await new Promise(r => setTimeout(r, 100));
            const dataUrl = await htmlToImage.toPng(previewRef.current, { 
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
            showToast(t('generateImageError', locale) || 'Failed to generate image', 'error');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="modal-overlay active" onClick={onClose} style={{ zIndex: 1000, overflowY: 'auto', padding: '20px' }}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px', backgroundColor: 'var(--card-bg)', margin: 'auto' }}>
                <div className="modal-header">
                    <h2>{t('shareSnippet', locale) || 'Share Snippet'}</h2>
                    <button className="btn-icon" onClick={onClose} title={t('close', locale)}>
                        <i className="ri-close-line"></i>
                    </button>
                </div>

                <div style={{ overflowX: 'auto', padding: '20px 0', display: 'flex', justifyContent: 'center' }}>
                    <div 
                        ref={previewRef} 
                        style={{ 
                            padding: '40px', 
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                            display: 'inline-block',
                            minWidth: '600px',
                            maxWidth: '100%',
                            boxSizing: 'border-box'
                        }}
                    >
                        <div 
                            style={{ 
                                backgroundColor: '#1e1e1e', 
                                borderRadius: '8px', 
                                overflow: 'hidden', 
                                boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                                width: '100%'
                            }}
                        >
                            <div style={{ display: 'flex', gap: '8px', padding: '14px 16px', background: '#2d2d2d', alignItems: 'center' }}>
                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f56' }}></div>
                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffbd2e' }}></div>
                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#27c93f' }}></div>
                                <div style={{ marginLeft: '12px', color: '#888', fontSize: '0.85rem', fontFamily: 'monospace' }}>
                                    {snippet.title || 'untitled'}
                                </div>
                            </div>
                            <div style={{ padding: '20px', paddingBottom: '30px' }}>
                                <CodeMirror
                                    value={snippet.code_content}
                                    theme={vscodeDark}
                                    extensions={[
                                        ...(langExt.length ? langExt : []),
                                        EditorView.lineWrapping,
                                    ]}
                                    editable={false}
                                    basicSetup={{
                                        lineNumbers: false,
                                        foldGutter: false,
                                        highlightActiveLine: false,
                                        highlightActiveLineGutter: false,
                                    }}
                                    style={{ fontSize: '14px', fontFamily: '"JetBrains Mono", "Fira Code", "Menlo", monospace' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                    <button className="btn-secondary" onClick={onClose}>{t('cancel', locale)}</button>
                    <button className="btn-primary" onClick={handleDownload} disabled={isGenerating}>
                        {isGenerating ? (
                            <><i className="ri-loader-4-line ri-spin"></i> {t('generatingImage', locale) || 'Generating...'}</>
                        ) : (
                            <><i className="ri-download-2-line"></i> {t('downloadImage', locale) || 'Download Image'}</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;

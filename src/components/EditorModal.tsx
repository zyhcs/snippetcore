import React, { useState, useEffect } from 'react';
import { Snippet, SnippetFormData, AppSettings } from '../types';
import CodeMirror from '@uiw/react-codemirror';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { Extension } from '@codemirror/state';
import { LANGUAGE_REGISTRY } from '../utils/languages';

import MarkdownViewer from './MarkdownViewer';
import HtmlViewer from './HtmlViewer';
import HistoryModal from './HistoryModal';
import { urlExtension } from '../utils/urlExtension';
import { t } from '../i18n';
import { showToast } from '../utils/toast';

interface EditorModalProps {
    snippet: Snippet | null;
    onClose: () => void;
    onSave: (data: SnippetFormData) => void;
    onDelete?: () => void;
    settings: AppSettings;
}



const EditorModal: React.FC<EditorModalProps> = ({ snippet, onClose, onSave, onDelete, settings }) => {
    const [title, setTitle] = useState('');
    const [codeContent, setCodeContent] = useState('');
    const [language, setLanguage] = useState('JavaScript');
    const [tags, setTags] = useState<string[]>([]);
    const [newTag, setNewTag] = useState('');
    const [isFavorite, setIsFavorite] = useState(false);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [runOutput, setRunOutput] = useState('');
    const [showTerminal, setShowTerminal] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [languageExtension, setLanguageExtension] = useState<Extension[]>([]);

    useEffect(() => {
        let isMounted = true;
        const loadExt = async () => {
            const langDef = LANGUAGE_REGISTRY.find(l => l.id === language);
            if (langDef && langDef.load) {
                try {
                    const ext = await langDef.load();
                    if (isMounted && ext) {
                        setLanguageExtension([ext]);
                    } else if (isMounted) {
                        setLanguageExtension([]);
                    }
                } catch (e) {
                    console.error("Failed to load language extension", e);
                    if (isMounted) setLanguageExtension([]);
                }
            } else {
                if (isMounted) setLanguageExtension([]);
            }
        };
        loadExt();
        return () => { isMounted = false; };
    }, [language]);
    const locale = settings.locale || 'zh';

    useEffect(() => {
        if (snippet) {
            setTitle(snippet.title);
            setCodeContent(snippet.code_content);
            setLanguage(snippet.language);
            try {
                const parsed = JSON.parse(snippet.tags || '[]');
                const tagsArr = Array.isArray(parsed) ? parsed : (typeof parsed === 'string' ? JSON.parse(parsed) : []);
                setTags(Array.isArray(tagsArr) ? tagsArr : []);
            } catch {
                setTags([]);
            }
            setIsFavorite(!!snippet.is_favorite);
        } else {
            setTitle('');
            setCodeContent('');
            setLanguage(settings.defaultLanguage);
            setTags([]);
            setIsFavorite(false);
        }
    }, [snippet]);

    
    const supportedRunners: Record<string, { cmd: string, ext: string }> = {
        'Python': { cmd: navigator.userAgent.includes('Win') ? 'run-python' : 'run-python3', ext: 'py' },
        'JavaScript': { cmd: 'run-node', ext: 'js' },
        'Shell': { cmd: 'run-sh', ext: 'sh' },
        'TypeScript': { cmd: 'run-node', ext: 'js' }, // Note: basic JS execution only unless ts-node is installed, but we map it here just in case.
    };

    const handleRun = async () => {
        const runner = supportedRunners[language];
        if (!runner) return;
        setIsRunning(true);
        setShowTerminal(true);
        setRunOutput('> Running script...\n');
        try {
            const { Command } = await import('@tauri-apps/plugin-shell');
            const { writeTextFile, remove } = await import('@tauri-apps/plugin-fs');
            const { tempDir, join } = await import('@tauri-apps/api/path');
            
            const tDir = await tempDir();
            const tmpFile = await join(tDir, `snippetcore_run_${Date.now()}.${runner.ext}`);
            
            // If typescript, we cannot run it directly with node unless we transpile, 
            // but for simple things we just save as js.
            await writeTextFile(tmpFile, codeContent);
            
            const command = Command.create(runner.cmd, [tmpFile]);
            
            command.on('close', async data => {
                setIsRunning(false);
                setRunOutput(prev => prev + `\n[Process exited with code ${data.code}]`);
                await remove(tmpFile).catch(console.error);
            });
            
            command.on('error', async error => {
                setRunOutput(prev => prev + `\n[Error: ${error}]`);
                setIsRunning(false);
                await remove(tmpFile).catch(console.error);
            });
            
            command.stdout.on('data', line => {
                setRunOutput(prev => prev + line + '\n');
            });
            
            command.stderr.on('data', line => {
                setRunOutput(prev => prev + line + '\n');
            });
            
            await command.spawn();
        } catch (err) {
            setRunOutput(`Failed to execute: ${err}`);
            setIsRunning(false);
        }
    };

    const handleSave = () => {
        if (!codeContent.trim()) {
            showToast(locale === 'zh' ? '代码内容不能为空' : 'Code content cannot be empty', 'error');
            return;
        }
        if (!title.trim()) {
            showToast(locale === 'zh' ? '未命名片段已自动保存' : 'Saved as Untitled Snippet', 'info');
        } else {
            showToast(locale === 'zh' ? '片段保存成功' : 'Snippet saved successfully', 'success');
        }
        onSave({
            title: title.trim() || 'Untitled Snippet',
            code_content: codeContent,
            language,
            tags,
            is_favorite: isFavorite
        });
    };

    const addTag = () => {
        if (newTag.trim() && !tags.includes(newTag.trim())) {
            setTags([...tags, newTag.trim()]);
            setNewTag('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(t => t !== tagToRemove));
    };

    return (
        <div className="modal-overlay active" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <input 
                        type="text" 
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder={t('snippetTitlePlaceholder', locale)}
                        style={{ 
                            background: 'transparent', border: 'none', color: 'var(--text-primary)', 
                            fontSize: '1.2rem', fontWeight: 600, outline: 'none', flex: 1, minWidth: '0', marginRight: '16px'
                        }}
                    />
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexShrink: 0 }}>
                        {snippet?.id && (
                            <button 
                                onClick={() => setShowHistory(true)}
                                style={{
                                    padding: '6px 10px',
                                    background: 'transparent',
                                    color: 'var(--text-secondary)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '4px',
                                    fontSize: '0.85rem'
                                }}
                            >
                                <i className="ri-history-line"></i> {locale === 'zh' ? '历史' : 'History'}
                            </button>
                        )}
                        <select 
                            className="custom-select" 
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            style={{ padding: '6px 32px 6px 12px', fontSize: '0.85rem' }}
                        >
                            {[...LANGUAGE_REGISTRY.filter(l => l.isBuiltIn).map(l => l.id), ...(settings.installedLanguages || [])].map(lang => (
                                <option key={lang} value={lang}>{lang}</option>
                            ))}
                        </select>
                        
                        {supportedRunners[language] && (
                            <button 
                                onClick={handleRun}
                                disabled={isRunning}
                                style={{
                                    padding: '6px 12px',
                                    background: isRunning ? 'var(--bg-secondary)' : '#10b981',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: isRunning ? 'wait' : 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    fontSize: '0.85rem', fontWeight: 500,
                                    boxShadow: '0 2px 4px rgba(16,185,129,0.2)'
                                }}
                            >
                                {isRunning ? <i className="ri-loader-4-line ri-spin"></i> : <i className="ri-play-fill"></i>}
                                {isRunning ? (locale === 'zh' ? '运行中...' : 'Running') : (locale === 'zh' ? '运行' : 'Run')}
                            </button>
                        )}
                        
                        {['Markdown', 'HTML', 'SVG', 'Mermaid', 'ECharts'].includes(language) && (
                            <>
                                <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                                    <button 
                                        onClick={() => setIsPreviewMode(false)}
                                        style={{ 
                                            padding: '4px 10px', 
                                            background: isPreviewMode ? 'transparent' : 'rgba(255,255,255,0.1)',
                                            color: isPreviewMode ? 'var(--text-secondary)' : 'var(--text-primary)',
                                            border: 'none', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px'
                                        }}
                                    >
                                        <i className="ri-code-line"></i> {t('editMode', locale)}
                                    </button>
                                    <button 
                                        onClick={() => setIsPreviewMode(true)}
                                        style={{ 
                                            padding: '4px 10px', 
                                            background: isPreviewMode ? 'rgba(255,255,255,0.1)' : 'transparent',
                                            color: isPreviewMode ? 'var(--text-primary)' : 'var(--text-secondary)',
                                            border: 'none', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px'
                                        }}
                                    >
                                        <i className="ri-eye-line"></i> {t('previewMode', locale)}
                                    </button>
                                </div>
                            </>
                        )}

                        <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', margin: '0 4px' }}></div>
                        <button className="btn-icon" title={t('copyCode', locale)} onClick={() => navigator.clipboard.writeText(codeContent)}>
                            <i className="ri-clipboard-line"></i>
                        </button>
                        {onDelete && (
                            <button className="btn-icon" title={t('deleteSnippet', locale)} onClick={onDelete}>
                                <i className="ri-delete-bin-line" style={{ color: '#ef4444' }}></i>
                            </button>
                        )}
                        <button className="btn-icon" onClick={() => setIsFavorite(!isFavorite)} title={t('favorite', locale)}>
                            <i className={isFavorite ? "ri-star-fill" : "ri-star-line"} style={{ color: isFavorite ? '#eab308' : '' }}></i>
                        </button>
                        <button className="btn-icon" onClick={onClose} title={t('close', locale)}><i className="ri-close-line"></i></button>
                    </div>
                </div>
                
                <div className="modal-editor" style={{ display: 'flex', flexDirection: 'column', padding: 0 }}>
                    {['Markdown', 'HTML', 'SVG', 'Mermaid', 'ECharts'].includes(language) && isPreviewMode ? (
                        <div className="md-scroll-wrapper" style={{ flex: 1, overflowY: 'auto', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                            {language === 'Markdown' ? (
                                <MarkdownViewer content={codeContent} />
                            ) : (
                                <HtmlViewer content={codeContent} language={language} />
                            )}
                        </div>
                    ) : (
                        <CodeMirror
                            value={codeContent}
                            height="100%"
                            theme={vscodeDark}
                            extensions={[...(languageExtension as any[]), ...urlExtension]}
                            onChange={(value) => setCodeContent(value)}
                            style={{ flex: 1, fontSize: '0.9rem', overflow: 'auto' }}
                            basicSetup={{
                                lineNumbers: true,
                                highlightActiveLineGutter: true,
                                foldGutter: true,
                                dropCursor: true,
                                allowMultipleSelections: true,
                                indentOnInput: true,
                                bracketMatching: true,
                                closeBrackets: true,
                                autocompletion: true,
                                rectangularSelection: true,
                                crosshairCursor: true,
                                highlightActiveLine: true,
                                highlightSelectionMatches: true,
                                closeBracketsKeymap: true,
                                defaultKeymap: true,
                                searchKeymap: true,
                                historyKeymap: true,
                                foldKeymap: true,
                                completionKeymap: true,
                                lintKeymap: true,
                            }}
                        />
                    )}
                </div>
                
                {showTerminal && (
                    <div style={{
                        height: '200px',
                        borderTop: '1px solid var(--border-color)',
                        background: '#0d1117',
                        color: '#c9d1d9',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative'
                    }}>
                        <div style={{
                            padding: '4px 12px',
                            background: '#161b22',
                            borderBottom: '1px solid var(--border-color)',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            fontSize: '0.8rem', color: '#8b949e'
                        }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <i className="ri-terminal-box-line"></i> Terminal
                            </span>
                            <button 
                                onClick={() => setShowTerminal(false)}
                                style={{ background: 'transparent', border: 'none', color: '#8b949e', cursor: 'pointer' }}
                            >
                                <i className="ri-close-line"></i>
                            </button>
                        </div>
                        <div style={{
                            padding: '12px',
                            flex: 1,
                            overflowY: 'auto',
                            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                            fontSize: '0.85rem',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-all'
                        }}>
                            {runOutput}
                        </div>
                    </div>
                )}
                <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderTop: '1px solid var(--border-color)', background: 'var(--card-bg)' }}>
                    <div className="modal-tags" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', flex: 1, marginRight: '16px' }}>
                        {tags.map(tag => (
                            <span key={tag} className="tag tag-purple" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '6px' }}>
                                {tag}
                                <i className="ri-close-line" style={{ cursor: 'pointer', opacity: 0.6 }} onClick={() => removeTag(tag)}></i>
                            </span>
                        ))}
                        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', padding: '0 8px', border: '1px solid var(--border-color)' }}>
                            <input 
                                type="text" 
                                placeholder={t('addTag', locale)} 
                                value={newTag}
                                onChange={e => setNewTag(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && addTag()}
                                title={locale === 'zh' ? '输入标签名称后按回车添加' : 'Press Enter to add tag'}
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', padding: '6px 0', fontSize: '0.85rem', width: '100px' }}
                            />
                            {newTag.trim() && (
                                <i className="ri-check-line" style={{ color: 'var(--theme-color)', cursor: 'pointer', marginLeft: '4px' }} onClick={addTag}></i>
                            )}
                        </div>
                    </div>
                    <div className="modal-actions" style={{ display: 'flex', gap: '12px' }}>
                        <button className="btn-secondary" onClick={onClose} title={locale === 'zh' ? '放弃修改并关闭' : 'Discard changes and close'}>{t('cancel', locale)}</button>
                        <button className="btn-primary" onClick={handleSave}>{t('saveSettings', locale).replace('Settings', 'Snippet').replace('设置', '片段')}</button>
                    </div>
                </div>
            </div>
            {showHistory && snippet && (
                <HistoryModal 
                    snippetId={snippet.id}
                    locale={locale}
                    onClose={() => setShowHistory(false)}
                    onRestore={() => {
                        showToast(locale === 'zh' ? '版本已恢复，请刷新列表' : 'Version restored, please refresh', 'success');
                        onClose();
                    }}
                />
            )}
        </div>
    );
};

export default EditorModal;

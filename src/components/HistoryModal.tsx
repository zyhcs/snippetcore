import React, { useEffect, useState } from 'react';
import { getSnippetHistory, restoreSnippetHistory } from '../db';
import { t } from '../i18n';
import CodeMirror from '@uiw/react-codemirror';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import ReactDiffViewer from 'react-diff-viewer-continued';

interface HistoryModalProps {
    snippetId: string;
    currentCodeContent: string;
    onClose: () => void;
    onRestore: () => void;
    locale: any;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ snippetId, onClose, onRestore, locale, currentCodeContent }) => {
    const [historyList, setHistoryList] = useState<any[]>([]);
    const [selectedIndex, setSelectedIndex] = useState<number>(0);
    const [showDiff, setShowDiff] = useState<boolean>(true);

    useEffect(() => {
        getSnippetHistory(snippetId).then(list => {
            setHistoryList(list);
        });
    }, [snippetId]);

    const handleRestore = async () => {
        if (historyList[selectedIndex]) {
            await restoreSnippetHistory(historyList[selectedIndex].id);
            onRestore();
            onClose();
        }
    };

    return (
        <div className="modal-overlay active" onClick={onClose} style={{ zIndex: 1100 }}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ width: '900px', height: '600px', display: 'flex', flexDirection: 'column' }}>
                <div className="modal-header" style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                            <i className="ri-history-line"></i> {locale === 'zh' ? '版本历史' : 'Version History'}
                        </h2>
                        {historyList.length > 0 && (
                            <button 
                                onClick={() => setShowDiff(!showDiff)}
                                style={{ 
                                    background: showDiff ? 'var(--theme-color-20)' : 'transparent',
                                    border: '1px solid var(--theme-color)',
                                    color: showDiff ? 'var(--theme-color)' : 'var(--text-secondary)',
                                    padding: '4px 12px', borderRadius: '16px', cursor: 'pointer', fontSize: '0.85rem' 
                                }}
                            >
                                <i className="ri-git-merge-line"></i> {locale === 'zh' ? '对比当前版本' : 'Compare with Current'}
                            </button>
                        )}
                    </div>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}>
                        <i className="ri-close-line"></i>
                    </button>
                </div>
                
                <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                    <div style={{ width: '250px', borderRight: '1px solid var(--border-color)', overflowY: 'auto', background: 'rgba(0,0,0,0.1)' }}>
                        {historyList.length === 0 ? (
                            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                {locale === 'zh' ? '暂无历史记录' : 'No history found'}
                            </div>
                        ) : (
                            historyList.map((h, i) => (
                                <div 
                                    key={h.id}
                                    onClick={() => setSelectedIndex(i)}
                                    style={{ 
                                        padding: '12px 16px', 
                                        cursor: 'pointer',
                                        borderBottom: '1px solid var(--border-color)',
                                        background: i === selectedIndex ? 'var(--theme-color-10)' : 'transparent',
                                        borderLeft: i === selectedIndex ? '3px solid var(--theme-color)' : '3px solid transparent'
                                    }}
                                >
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: i === selectedIndex ? 600 : 400 }}>{h.title}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                        {new Date(h.updated_at).toLocaleString()}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        {historyList[selectedIndex] && (
                            <div style={{ flex: 1, overflow: 'auto', position: 'relative', background: '#0d1117' }}>
                                {showDiff ? (
                                    <ReactDiffViewer 
                                        oldValue={historyList[selectedIndex].code_content} 
                                        newValue={currentCodeContent} 
                                        splitView={true} 
                                        useDarkTheme={true} 
                                        styles={{
                                            variables: {
                                                dark: {
                                                    diffViewerBackground: '#0d1117',
                                                    diffViewerColor: '#c9d1d9',
                                                    addedBackground: '#1f3a28',
                                                    addedColor: '#c9d1d9',
                                                    removedBackground: '#3d1c20',
                                                    removedColor: '#c9d1d9',
                                                    wordAddedBackground: '#2ea043',
                                                    wordRemovedBackground: '#f85149',
                                                    addedGutterBackground: '#1f3a28',
                                                    removedGutterBackground: '#3d1c20',
                                                    gutterBackground: '#0d1117',
                                                    gutterBackgroundDark: '#0d1117',
                                                    highlightBackground: '#0d1117',
                                                    highlightGutterBackground: '#0d1117',
                                                    codeFoldGutterBackground: '#0d1117',
                                                    codeFoldBackground: '#0d1117',
                                                    emptyLineBackground: '#0d1117',
                                                    gutterColor: '#8b949e',
                                                    addedGutterColor: '#8b949e',
                                                    removedGutterColor: '#8b949e',
                                                    codeFoldContentColor: '#8b949e',
                                                    diffViewerTitleBackground: '#161b22',
                                                    diffViewerTitleColor: '#c9d1d9',
                                                    diffViewerTitleBorderColor: '#30363d',
                                                }
                                            }
                                        }}
                                    />
                                ) : (
                                    <CodeMirror
                                        value={historyList[selectedIndex].code_content}
                                        theme={vscodeDark}
                                        readOnly={true}
                                        height="100%"
                                        style={{ fontSize: '14px' }}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="modal-footer" style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button className="btn-secondary" onClick={onClose}>{t('cancel', locale)}</button>
                    <button 
                        className="btn-primary" 
                        onClick={handleRestore}
                        disabled={historyList.length === 0}
                    >
                        {locale === 'zh' ? '恢复此版本' : 'Restore this version'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HistoryModal;

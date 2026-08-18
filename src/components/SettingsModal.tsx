import React, { useState, useEffect } from 'react';
import { AppSettings, Snippet } from '../types';
import { Locale, t } from '../i18n';
import { PRESET_THEMES } from '../themes';
import { showToast } from '../utils/toast';
import { copyToClipboard } from '../utils/clipboard';
import { LANGUAGE_REGISTRY } from '../utils/languages';

interface SettingsModalProps {
    settings: AppSettings;
    snippets: Snippet[];
    initialTab?: 'appearance' | 'languages' | 'sidebar' | 'sync';
    onClose: () => void;
    onSave: (settings: AppSettings) => void;
    onSnippetsChanged?: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ settings, snippets, initialTab = 'appearance', onClose, onSave }) => {
    const [localSettings, setLocalSettings] = useState<AppSettings>({ ...settings });
    const [activeTab, setActiveTab] = useState<'appearance' | 'languages' | 'sidebar' | 'sync'>(initialTab);
        const [isSyncing, setIsSyncing] = useState(false);
    const [syncStatus, setSyncStatus] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);
    const [showToken, setShowToken] = useState(false);
    const [configPath, setConfigPath] = useState<string>('');
    const locale = localSettings.locale || 'zh';

    useEffect(() => {
        import('../utils/configStore').then(({ getConfigFilePath }) => {
            getConfigFilePath().then(setConfigPath);
        });
    }, []);

    const handleSave = () => {
        onSave(localSettings);
    };

    const handleInstallLanguage = (langId: string) => {
        if (!localSettings.installedLanguages) {
            localSettings.installedLanguages = [];
        }
        if (!localSettings.installedLanguages.includes(langId)) {
            setLocalSettings({
                ...localSettings,
                installedLanguages: [...localSettings.installedLanguages, langId]
            });
        }
    };

    const handleUninstallLanguage = (langId: string) => {
        const newInstalled = (localSettings.installedLanguages || []).filter(l => l !== langId);
        setLocalSettings({
            ...localSettings,
            installedLanguages: newInstalled
        });
        if (localSettings.defaultLanguage === langId) {
            setLocalSettings(prev => ({
                ...prev,
                defaultLanguage: 'JavaScript',
                installedLanguages: newInstalled
            }));
        }
    };

    return (
        <div className="modal-overlay active" onClick={onClose}>
            <div className="modal-content settings-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '900px', width: '90%', display: 'flex', flexDirection: 'column' }}>
                <div className="modal-header">
                    <h2>{t('settings', locale)}</h2>
                    <button className="btn-icon" onClick={onClose}>
                        <i className="ri-close-line"></i>
                    </button>
                </div>

                <div className="settings-body" style={{ display: 'flex', flex: 1, minHeight: '360px' }}>
                    <div className="settings-sidebar" style={{ width: '160px', display: 'flex', flexDirection: 'column', gap: '8px', borderRight: '1px solid var(--border-color)', padding: '24px 16px' }}>
                        <button 
                            className={`nav-item ${activeTab === 'appearance' ? 'active' : ''}`} 
                            style={{ background: activeTab === 'appearance' ? 'var(--hover-bg)' : 'transparent', color: activeTab === 'appearance' ? 'var(--theme-color)' : 'var(--text-secondary)', border: 'none', textAlign: 'left', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                            onClick={() => setActiveTab('appearance')}
                        >
                            <i className="ri-palette-line"></i> {t('appearance', locale)}
                        </button>
                        <button 
                            className={`nav-item ${activeTab === 'languages' ? 'active' : ''}`} 
                            style={{ background: activeTab === 'languages' ? 'var(--hover-bg)' : 'transparent', color: activeTab === 'languages' ? 'var(--theme-color)' : 'var(--text-secondary)', border: 'none', textAlign: 'left', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                            onClick={() => setActiveTab('languages')}
                        >
                            <i className="ri-code-s-slash-line"></i> {t('languageManagement', locale)}
                        </button>
                        <button 
                            className={`nav-item ${activeTab === 'sidebar' ? 'active' : ''}`} 
                            style={{ background: activeTab === 'sidebar' ? 'var(--hover-bg)' : 'transparent', color: activeTab === 'sidebar' ? 'var(--theme-color)' : 'var(--text-secondary)', border: 'none', textAlign: 'left', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                            onClick={() => setActiveTab('sidebar')}
                        >
                            <i className="ri-layout-left-line"></i> {t('sidebarManagement', locale)}
                        </button>
                        <button 
                            className={`nav-item ${activeTab === 'sync' ? 'active' : ''}`} 
                            style={{ background: activeTab === 'sync' ? 'var(--hover-bg)' : 'transparent', color: activeTab === 'sync' ? 'var(--theme-color)' : 'var(--text-secondary)', border: 'none', textAlign: 'left', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                            onClick={() => setActiveTab('sync')}
                        >
                            <i className="ri-cloud-line"></i> {t('dataAndSync', locale) || 'Data & Sync'}
                        </button>
                    </div>

                    <div className="settings-content" style={{ flex: 1, padding: '24px 32px', overflowY: 'auto' }}>
                        {activeTab === 'appearance' && (
                            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                <div>
                                    <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '12px', display: 'block' }}>{t('interfaceLanguage', locale)}</label>
                                    <select 
                                        className="custom-select"
                                        value={localSettings.locale} 
                                        onChange={e => setLocalSettings({...localSettings, locale: e.target.value as Locale})}
                                        style={{ width: '100%' }}
                                    >
                                        <option value="zh">简体中文</option>
                                        <option value="en">English</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '12px', display: 'block' }}>{t('themeColor', locale)} (Theme Preset)</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
                                        {PRESET_THEMES.map(theme => (
                                            <div 
                                                key={theme.id}
                                                onClick={() => setLocalSettings({...localSettings, themePreset: theme.id})}
                                                style={{
                                                    padding: '12px',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    border: `2px solid ${localSettings.themePreset === theme.id ? theme.colors['--theme-color'] : 'var(--border-color)'}`,
                                                    background: theme.colors['--bg-color'],
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '8px',
                                                    transition: 'all 0.2s ease',
                                                    position: 'relative'
                                                }}
                                            >
                                                <div style={{ display: 'flex', gap: '4px' }}>
                                                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: theme.colors['--theme-color'] }}></div>
                                                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: theme.colors['--card-bg'] }}></div>
                                                </div>
                                                <span style={{ fontSize: '0.85rem', color: theme.colors['--text-primary'], fontWeight: 500 }}>{theme.name}</span>
                                                {localSettings.themePreset === theme.id && (
                                                    <i className="ri-check-line" style={{ position: 'absolute', right: '8px', top: '8px', color: theme.colors['--theme-color'] }}></i>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {/* Custom Color Override for Classic Theme */}
                                    {localSettings.themePreset === 'classic' && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '16px', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>自定义高亮色:</span>
                                            <input 
                                                type="color" 
                                                className="custom-color"
                                                value={localSettings.themeColor} 
                                                onChange={e => setLocalSettings({...localSettings, themeColor: e.target.value})}
                                            />
                                            <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>{localSettings.themeColor.toUpperCase()}</span>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                                        {t('fontSize', locale)}
                                        <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{localSettings.fontSize}px</span>
                                    </label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <input 
                                            type="range" 
                                            className="custom-range"
                                            min="12" 
                                            max="24" 
                                            value={localSettings.fontSize} 
                                            onChange={e => setLocalSettings({...localSettings, fontSize: parseInt(e.target.value)})}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '12px', display: 'block' }}>{t('defaultLanguage', locale)}</label>
                                    <select 
                                        className="custom-select"
                                        value={localSettings.defaultLanguage} 
                                        onChange={e => setLocalSettings({...localSettings, defaultLanguage: e.target.value})}
                                        style={{ width: '100%' }}
                                    >
                                        {[...LANGUAGE_REGISTRY.filter(l => l.isBuiltIn).map(l => l.id), ...(localSettings.installedLanguages || [])].map(lang => (
                                            <option key={lang} value={lang}>{lang}</option>
                                        ))}
                                    </select>
                                </div>
                                <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '10px 0' }} />
                                <div>
                                    {(() => {
                                        const isMac = navigator.userAgent.includes('Mac');
                                        const isWin = navigator.userAgent.includes('Win');
                                        const enableKey = isMac ? 'enableGlobalShortcut_mac' : (isWin ? 'enableGlobalShortcut_win' : 'enableGlobalShortcut_linux');
                                        const shortcutKey = isMac ? 'globalShortcutKey_mac' : (isWin ? 'globalShortcutKey_win' : 'globalShortcutKey_linux');
                                        
                                        const isEnabled = localSettings[enableKey] ?? localSettings.enableGlobalShortcut ?? false;
                                        const currentKey = localSettings[shortcutKey] ?? localSettings.globalShortcutKey ?? '';
                                        
                                        return (
                                            <>
                                                <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <input 
                                                        type="checkbox" 
                                                        checked={isEnabled}
                                                        onChange={e => setLocalSettings({...localSettings, [enableKey]: e.target.checked})}
                                                    />
                                                    {t('enableGlobalShortcut', locale)}
                                                </label>
                                                {isEnabled && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px', paddingLeft: '24px' }}>
                                                        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t('globalShortcutKey', locale)}</label>
                                                        <input 
                                                            type="text" 
                                                            value={currentKey}
                                                            onKeyDown={e => {
                                                                e.preventDefault();
                                                                const keys = [];
                                                                if (e.metaKey || e.ctrlKey) keys.push('CommandOrControl');
                                                                if (e.altKey) keys.push('Alt');
                                                                if (e.shiftKey) keys.push('Shift');
                                                                
                                                                const key = e.key;
                                                                if (!['Meta', 'Control', 'Alt', 'Shift'].includes(key)) {
                                                                    let finalKey = key.toUpperCase();
                                                                    if (finalKey === ' ') finalKey = 'Space';
                                                                    keys.push(finalKey);
                                                                    setLocalSettings({...localSettings, [shortcutKey]: keys.join('+')});
                                                                } else if (keys.length > 0) {
                                                                    setLocalSettings({...localSettings, [shortcutKey]: keys.join('+') + '+'});
                                                                }
                                                            }}
                                                            readOnly
                                                            style={{ padding: '6px 12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--theme-color)', borderRadius: '4px', color: 'var(--text-primary)', outline: 'none', flex: 1, fontFamily: 'var(--font-mono)', fontSize: '0.85rem', cursor: 'pointer' }}
                                                            placeholder={t('globalShortcutKey', locale)}
                                                        />
                                                    </div>
                                                )}
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                        )}

                        {activeTab === 'languages' && (
                            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                
                                <div>
                                    <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '12px', display: 'block' }}>内置语言 (Built-in)</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px' }}>
                                        {LANGUAGE_REGISTRY.filter(l => l.isBuiltIn).map(lang => (
                                            <div key={lang.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem' }}>
                                                <span>{lang.name}</span>
                                                <i className="ri-check-line" style={{ color: 'var(--theme-color)' }}></i>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '12px', display: 'block' }}>已安装扩展 (Installed)</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px' }}>
                                        {(localSettings.installedLanguages || []).length === 0 && (
                                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', padding: '8px 0' }}>暂未安装额外语言扩展</div>
                                        )}
                                        {(localSettings.installedLanguages || []).map(langId => {
                                            const lang = LANGUAGE_REGISTRY.find(l => l.id === langId);
                                            if (!lang) return null;
                                            return (
                                                <div key={langId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem', border: '1px solid var(--theme-color)' }}>
                                                    <span>{lang.name}</span>
                                                    <i className="ri-delete-bin-line" style={{ cursor: 'pointer', color: '#ff4444' }} onClick={() => handleUninstallLanguage(langId)} title="卸载"></i>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div>
                                    <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '12px', display: 'block' }}>未安装 (Available)</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px' }}>
                                        {LANGUAGE_REGISTRY.filter(l => !l.isBuiltIn && !(localSettings.installedLanguages || []).includes(l.id)).map(lang => (
                                            <div key={lang.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem', border: '1px solid var(--border-color)' }}>
                                                <span style={{ color: 'var(--text-secondary)' }}>{lang.name}</span>
                                                <i className="ri-download-cloud-2-line" style={{ cursor: 'pointer', color: 'var(--text-primary)' }} onClick={() => handleInstallLanguage(lang.id)} title="点击安装"></i>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        )}

                        {activeTab === 'sidebar' && (
                            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '12px', display: 'block' }}>{t('pinnedLanguages', locale)}</label>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '180px', overflowY: 'auto', padding: '12px', background: 'var(--card-bg)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                        {localSettings.languages.map(lang => {
                                            const isPinned = localSettings.pinnedLanguages?.includes(lang);
                                            return (
                                                <button 
                                                    key={lang} 
                                                    className={`lang-tag ${isPinned ? 'active' : ''}`} 
                                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', background: isPinned ? 'var(--theme-color)' : 'rgba(255,255,255,0.05)', color: isPinned ? '#fff' : 'var(--text-secondary)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.85rem', border: '1px solid transparent' }}
                                                    onClick={() => {
                                                        const newPinned = isPinned 
                                                            ? localSettings.pinnedLanguages.filter(l => l !== lang)
                                                            : [...(localSettings.pinnedLanguages || []), lang];
                                                        setLocalSettings({...localSettings, pinnedLanguages: newPinned});
                                                    }}
                                                >
                                                    {lang}
                                                    <i className={isPinned ? "ri-unpin-line" : "ri-pushpin-line"} style={{ fontSize: '0.9rem' }}></i>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div>
                                    <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '12px', display: 'block' }}>{t('pinnedTags', locale)}</label>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '180px', overflowY: 'auto', padding: '12px', background: 'var(--card-bg)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                        {Array.from(new Set(snippets.flatMap(s => {
                                            try {
                                                const p = JSON.parse(s.tags || '[]');
                                                return Array.isArray(p) ? p : (typeof p === 'string' ? JSON.parse(p) : []);
                                            } catch { return []; }
                                        }))).map(tag => {
                                            const isPinned = localSettings.pinnedTags?.includes(tag);
                                            return (
                                                <button 
                                                    key={tag} 
                                                    className={`lang-tag ${isPinned ? 'active' : ''}`} 
                                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', background: isPinned ? 'var(--theme-color)' : 'rgba(255,255,255,0.05)', color: isPinned ? '#fff' : 'var(--text-secondary)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.85rem', border: '1px solid transparent' }}
                                                    onClick={() => {
                                                        const newPinned = isPinned 
                                                            ? localSettings.pinnedTags.filter(t => t !== tag)
                                                            : [...(localSettings.pinnedTags || []), tag];
                                                        setLocalSettings({...localSettings, pinnedTags: newPinned});
                                                    }}
                                                >
                                                    <i className="ri-hashtag"></i> {tag}
                                                    <i className={isPinned ? "ri-unpin-line" : "ri-pushpin-line"} style={{ fontSize: '0.9rem' }}></i>
                                                </button>
                                            );
                                        })}
                                        {snippets.length === 0 && <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{t('noPinnedItems', locale)}</span>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'sync' && (
                            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                {/* Local Configuration File Panel */}
                                <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px' }}>
                                    <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                                        <i className="ri-folder-settings-line" style={{ color: 'var(--theme-color)', fontSize: '1.2rem' }}></i>
                                        {t('configLocation', locale) || 'Configuration Location'}
                                    </h3>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                                        {t('configLocationDesc', locale) || 'Path to local settings JSON file'}
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <input 
                                            type="text" 
                                            value={configPath} 
                                            readOnly 
                                            style={{ flex: 1, padding: '10px 16px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-secondary)', outline: 'none' }} 
                                        />
                                        <button className="btn-secondary" onClick={async () => {
                                            const { selectConfigFilePath } = await import('../utils/configStore');
                                            const newPath = await selectConfigFilePath();
                                            if (newPath) {
                                                setConfigPath(newPath);
                                                showToast(t('settingsSaved', locale) || 'Configuration path updated', 'success');
                                            }
                                        }}>
                                            {t('changeLocation', locale) || 'Change Location'}
                                        </button>
                                    </div>
                                </div>

                                {/* Local Backup Panel */}
                                <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px' }}>
                                    <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                                        <i className="ri-save-3-line" style={{ color: 'var(--theme-color)', fontSize: '1.2rem' }}></i>
                                        {t('localBackup', locale) || 'Local Backup'}
                                    </h3>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button className="btn-secondary" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }} onClick={async () => {
                                            try {
                                                const { exportData } = await import('../db');
                                                const { save } = await import('@tauri-apps/plugin-dialog');
                                                const { writeTextFile } = await import('@tauri-apps/plugin-fs');
                                                
                                                const jsonString = await exportData(localSettings);
                                                const filePath = await save({
                                                    filters: [{ name: 'JSON', extensions: ['json'] }],
                                                    defaultPath: `snippetcore-backup-${new Date().toISOString().split('T')[0]}.json`
                                                });
                                                
                                                if (filePath) {
                                                    await writeTextFile(filePath, jsonString);
                                                    showToast(t('exportSuccess', locale) || 'Export Success', 'success');
                                                }
                                            } catch (e) {
                                                console.error(e);
                                                showToast("Export Failed: " + String(e), 'error');
                                            }
                                        }}>
                                            <i className="ri-download-cloud-2-line"></i> {t('exportBackup', locale) || 'Export Backup'}
                                        </button>
                                        <button className="btn-secondary" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }} onClick={async () => {
                                            try {
                                                const { importData } = await import('../db');
                                                const { open } = await import('@tauri-apps/plugin-dialog');
                                                const { readTextFile } = await import('@tauri-apps/plugin-fs');
                                                
                                                const file = await open({
                                                    filters: [{ name: 'JSON', extensions: ['json'] }]
                                                });
                                                
                                                if (file && !Array.isArray(file)) {
                                                    const content = await readTextFile(file);
                                                    const importedSettings = await importData(content);
                                                    if (importedSettings) {
                                                        const newSettings = { ...localSettings, ...importedSettings };
                                                        // Prevent overriding sync auth from remote config
                                                        newSettings.githubToken = localSettings.githubToken;
                                                        newSettings.githubRepoName = localSettings.githubRepoName;
                                                        newSettings.syncProvider = localSettings.syncProvider;
                                                        newSettings.lastSyncTime = localSettings.lastSyncTime;
                                                        setLocalSettings(newSettings);
                                                    }
                                                    showToast(t('importSuccess', locale) || 'Import Success (Please restart or refresh app)', 'success');
                                                }
                                            } catch (e) {
                                                console.error(e);
                                                showToast("Import Failed: " + String(e), 'error');
                                            }
                                        }}>
                                            <i className="ri-upload-cloud-2-line"></i> {t('importBackup', locale) || 'Import Backup'}
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Cloud Sync Panel */}
                                <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px' }}>
                                    <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                                        <i className="ri-github-fill" style={{ color: 'var(--theme-color)', fontSize: '1.2rem' }}></i>
                                        {t('cloudSync', locale) || 'Cloud Sync (GitHub Repo)'}
                                        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                                            <button 
                                                style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                title={locale === 'zh' ? '复制同步配置 (方便在新设备上导入)' : 'Copy Sync Config'}
                                                onClick={async () => {
                                                    try {
                                                        const config = { repo: localSettings.githubRepoName, token: localSettings.githubToken };
                                                        const b64 = btoa(encodeURIComponent(JSON.stringify(config)));
                                                        const success = await copyToClipboard(`snippetcore-sync://${b64}`);
                                                        if (success) {
                                                            showToast(locale === 'zh' ? '同步配置已复制！您可以在其他设备的相同位置点击"导入"按钮。' : 'Sync config copied!', 'success');
                                                        } else {
                                                            throw new Error("Fallback clipboard copy failed");
                                                        }
                                                    } catch (err) {
                                                        console.error("Clipboard copy failed:", err);
                                                        showToast(locale === 'zh' ? '复制失败，请检查浏览器/应用权限。' : 'Failed to copy to clipboard.', 'error');
                                                    }
                                                }}
                                            >
                                                <i className="ri-clipboard-line"></i> {locale === 'zh' ? '复制' : 'Copy'}
                                            </button>
                                            <button 
                                                style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                title={locale === 'zh' ? '从剪贴板导入同步配置' : 'Paste Sync Config'}
                                                onClick={async () => {
                                                    try {
                                                        const text = await navigator.clipboard.readText();
                                                        if (text.startsWith('snippetcore-sync://')) {
                                                            const config = JSON.parse(decodeURIComponent(atob(text.replace('snippetcore-sync://', ''))));
                                                            if (config.repo !== undefined && config.token !== undefined) {
                                                                setLocalSettings({
                                                                    ...localSettings,
                                                                    githubRepoName: config.repo,
                                                                    githubToken: config.token,
                                                                    syncProvider: config.token ? 'github' : 'none'
                                                                });
                                                                showToast(locale === 'zh' ? '同步配置导入成功！' : 'Sync config imported successfully!', 'success');
                                                            } else {
                                                                throw new Error();
                                                            }
                                                        } else {
                                                            throw new Error();
                                                        }
                                                    } catch (e) {
                                                        showToast(locale === 'zh' ? '未能在剪贴板中找到有效的同步配置。请先在原设备点击"复制"。' : 'Invalid sync config in clipboard.', 'error');
                                                    }
                                                }}
                                            >
                                                <i className="ri-clipboard-download-line"></i> {locale === 'zh' ? '导入' : 'Paste'}
                                            </button>
                                        </div>
                                    </h3>
                                    
                                    <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>{t('repoNameLabel', locale) || 'Repository Name'}</label>
                                    <input 
                                        type="text" 
                                        placeholder={t('repoNamePlaceholder', locale) || 'e.g. snippetcore-sync'}
                                        value={localSettings.githubRepoName || 'snippetcore-sync'}
                                        onChange={e => {
                                            setLocalSettings({
                                                ...localSettings, 
                                                githubRepoName: e.target.value
                                            })
                                        }}
                                        style={{ width: '100%', padding: '12px 16px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none', marginBottom: '20px', transition: 'border-color 0.2s' }}
                                    />
                                    
                                    <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>GitHub Personal Access Token (PAT)</label>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: '1.5' }}>
                                        {locale === 'zh' 
                                            ? <span>为了将数据同步至私有仓库，您需要提供一个拥有 <strong>repo</strong> 权限的 GitHub Token。<a href="https://github.com/settings/tokens/new" target="_blank" style={{ color: 'var(--theme-color)', textDecoration: 'none', fontWeight: 500 }}>去创建 Token</a></span>
                                            : <span>To sync data to a private repository, you need a GitHub Token with <strong>repo</strong> scope. <a href="https://github.com/settings/tokens/new" target="_blank" style={{ color: 'var(--theme-color)', textDecoration: 'none', fontWeight: 500 }}>Create Token</a></span>}
                                    </div>
                                    <div style={{ position: 'relative', marginBottom: '24px' }}>
                                        <input 
                                            type={showToken ? "text" : "password"} 
                                            placeholder={t('githubTokenPlaceholder', locale) || 'Enter GitHub PAT'}
                                            value={localSettings.githubToken || ''}
                                            onChange={e => {
                                                setLocalSettings({
                                                    ...localSettings, 
                                                    githubToken: e.target.value,
                                                    syncProvider: e.target.value.length > 0 ? 'github' : 'none'
                                                })
                                            }}
                                            style={{ width: '100%', padding: '12px 40px 12px 16px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none', transition: 'border-color 0.2s' }}
                                        />
                                        <button 
                                            onClick={() => setShowToken(!showToken)}
                                            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            title={showToken ? (locale === 'zh' ? '隐藏' : 'Hide') : (locale === 'zh' ? '显示' : 'Show')}
                                        >
                                            <i className={showToken ? "ri-eye-off-line" : "ri-eye-line"}></i>
                                        </button>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px', padding: '16px', background: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                        <div>
                                            <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>{t('syncAutoInterval', locale) || 'Auto Sync Interval'}</label>
                                            <select 
                                                className="custom-select"
                                                value={localSettings.syncAutoInterval || 0}
                                                onChange={e => setLocalSettings({...localSettings, syncAutoInterval: parseInt(e.target.value)})}
                                                style={{ width: '100%', padding: '10px 12px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', outline: 'none' }}
                                            >
                                                <option value={0}>{t('syncAutoDisabled', locale) || 'Disabled'}</option>
                                                <option value={15}>{t('syncAuto15m', locale) || 'Every 15 mins'}</option>
                                                <option value={30}>{t('syncAuto30m', locale) || 'Every 30 mins'}</option>
                                                <option value={60}>{t('syncAuto60m', locale) || 'Every 1 hour'}</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>{t('syncPullStrategy', locale) || 'Pull Strategy'}</label>
                                            <select 
                                                className="custom-select"
                                                value={localSettings.syncPullStrategy || 'all'}
                                                onChange={e => setLocalSettings({...localSettings, syncPullStrategy: e.target.value as any})}
                                                style={{ width: '100%', padding: '10px 12px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', outline: 'none' }}
                                            >
                                                <option value="all">{t('syncPullAll', locale) || 'Pull All (include settings)'}</option>
                                                <option value="snippets_only">{t('syncPullSnippetsOnly', locale) || 'Snippets Only (keep local settings)'}</option>
                                                <option value="settings_only">{t('syncPullSettingsOnly', locale) || 'Settings Only'}</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px', padding: '16px', background: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                                            <input 
                                                type="checkbox" 
                                                checked={localSettings.syncOnStart || false}
                                                onChange={e => setLocalSettings({...localSettings, syncOnStart: e.target.checked})}
                                                style={{ accentColor: 'var(--theme-color)', width: '18px', height: '18px', cursor: 'pointer' }}
                                            />
                                            {t('syncOnStart', locale) || 'Pull on Startup'}
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                                            <input 
                                                type="checkbox" 
                                                checked={localSettings.syncOnSave || false}
                                                onChange={e => setLocalSettings({...localSettings, syncOnSave: e.target.checked})}
                                                style={{ accentColor: 'var(--theme-color)', width: '18px', height: '18px', cursor: 'pointer' }}
                                            />
                                            {t('syncOnSave', locale) || 'Push on Save (Debounced)'}
                                        </label>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                                        {t('lastSync', locale) || 'Last synced: '}{localSettings.lastSyncTime ? new Date(localSettings.lastSyncTime).toLocaleString() : (t('neverSynced', locale) || 'Never')}
                                    </div>
                                    
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button 
                                            className="btn-primary" 
                                            style={{ flex: 1 }}
                                            disabled={!localSettings.githubToken || isSyncing}
                                            onClick={async () => {
                                                setIsSyncing(true);
                                                setSyncStatus({ message: locale === 'zh' ? '正在连接 GitHub...' : 'Connecting to GitHub...', type: 'info' });
                                                try {
                                                    const { syncToRepo, pullFromRepo } = await import('../sync');
                                                    const { exportData, importData } = await import('../db');
                                                    
                                                    // 1. If we have a repo configured, pull from it first and merge
                                                    let finalRepoName = localSettings.githubRepoName || 'snippetcore-sync';
                                                    let remoteSettings = null;
                                                    
                                                    if (finalRepoName) {
                                                        try {
                                                            setSyncStatus({ message: locale === 'zh' ? '正在拉取云端数据...' : 'Pulling remote data...', type: 'info' });
                                                            const remoteJson = await pullFromRepo(localSettings.githubToken, finalRepoName);
                                                            // Import remote changes to local DB applying the pull strategy
                                                            remoteSettings = await importData(remoteJson, localSettings.syncPullStrategy || 'all');
                                                        } catch (e) {
                                                            console.warn("Pull from Repo failed, we will just push local state", e);
                                                        }
                                                    }
                                                    
                                                    let newLocalSettings = { ...localSettings };
                                                    if (remoteSettings && localSettings.syncPullStrategy === 'all') {
                                                        newLocalSettings = { ...newLocalSettings, ...remoteSettings };
                                                        // Prevent overriding sync auth
                                                        newLocalSettings.githubToken = localSettings.githubToken;
                                                        newLocalSettings.githubRepoName = localSettings.githubRepoName;
                                                        newLocalSettings.syncProvider = localSettings.syncProvider;
                                                        newLocalSettings.lastSyncTime = localSettings.lastSyncTime;
                                                        setLocalSettings(newLocalSettings);
                                                    }

                                                    // 2. Export merged local state and push to Repo
                                                    setSyncStatus({ message: locale === 'zh' ? '正在向云端推送数据...' : 'Pushing data to remote...', type: 'info' });
                                                    const mergedJson = await exportData(newLocalSettings);
                                                    finalRepoName = await syncToRepo(localSettings.githubToken, finalRepoName, mergedJson);
                                                    
                                                    // 4. Update settings
                                                    setLocalSettings(prev => ({
                                                        ...prev,
                                                        githubRepoName: finalRepoName,
                                                        lastSyncTime: new Date().toISOString()
                                                    }));
                                                    setSyncStatus({ message: t('syncSuccess', locale) || 'Sync Success', type: 'success' });
                                                } catch (e) {
                                                    console.error(e);
                                                    setSyncStatus({ message: (t('syncFailed', locale) || 'Sync Failed') + ": " + String(e), type: 'error' });
                                                } finally {
                                                    setIsSyncing(false);
                                                }
                                            }}
                                        >
                                            {isSyncing ? <i className="ri-loader-4-line ri-spin"></i> : <i className="ri-upload-cloud-2-line"></i>} 
                                            {t('syncNow', locale) || 'Sync Now'}
                                        </button>

                                        <button 
                                            className="btn-secondary" 
                                            style={{ flex: 1, backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}
                                            disabled={!localSettings.githubToken || isSyncing}
                                            onClick={async () => {
                                                setIsSyncing(true);
                                                setSyncStatus({ message: locale === 'zh' ? '正在强制拉取云端数据...' : 'Force pulling remote data...', type: 'info' });
                                                try {
                                                    const { pullFromRepo } = await import('../sync');
                                                    const { importData } = await import('../db');
                                                    
                                                    let finalRepoName = localSettings.githubRepoName || 'snippetcore-sync';
                                                    if (finalRepoName) {
                                                        const remoteJson = await pullFromRepo(localSettings.githubToken, finalRepoName);
                                                        const remoteSettings = await importData(remoteJson, localSettings.syncPullStrategy || 'all');
                                                        
                                                        if (remoteSettings && localSettings.syncPullStrategy === 'all') {
                                                            let newLocalSettings = { ...localSettings, ...remoteSettings };
                                                            newLocalSettings.githubToken = localSettings.githubToken;
                                                            newLocalSettings.githubRepoName = localSettings.githubRepoName;
                                                            newLocalSettings.syncProvider = localSettings.syncProvider;
                                                            newLocalSettings.lastSyncTime = new Date().toISOString();
                                                            setLocalSettings(newLocalSettings);
                                                        }
                                                        setSyncStatus({ message: locale === 'zh' ? '强制拉取成功！请刷新页面或重新打开以查看最新数据。' : 'Pull success! Refresh or reopen to see latest data.', type: 'success' });
                                                    } else {
                                                        setSyncStatus({ message: locale === 'zh' ? '缺少仓库名称' : 'Missing repo name', type: 'error' });
                                                    }
                                                } catch (e) {
                                                    console.error(e);
                                                    setSyncStatus({ message: (t('syncFailed', locale) || 'Sync Failed') + ": " + String(e), type: 'error' });
                                                } finally {
                                                    setIsSyncing(false);
                                                }
                                            }}
                                        >
                                            {isSyncing ? <i className="ri-loader-4-line ri-spin"></i> : <i className="ri-download-cloud-2-line"></i>} 
                                            {t('pullNow', locale) || 'Force Pull'}
                                        </button>
                                    </div>
                                    {syncStatus && (
                                        <div style={{ 
                                            marginTop: '12px', 
                                            padding: '8px 12px', 
                                            borderRadius: '6px', 
                                            fontSize: '0.85rem',
                                            backgroundColor: syncStatus.type === 'error' ? 'rgba(255, 68, 68, 0.1)' : syncStatus.type === 'success' ? 'rgba(0, 200, 83, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                                            color: syncStatus.type === 'error' ? '#ff4444' : syncStatus.type === 'success' ? '#00c853' : 'var(--text-secondary)'
                                        }}>
                                            <i className={syncStatus.type === 'error' ? 'ri-error-warning-line' : syncStatus.type === 'success' ? 'ri-checkbox-circle-line' : 'ri-information-line'} style={{ marginRight: '6px' }}></i>
                                            {syncStatus.message}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 24px', borderTop: '1px solid var(--border-color)' }}>
                    <div className="modal-actions">
                        <button className="btn-secondary" onClick={onClose}>{t('cancel', locale)}</button>
                        <button className="btn-primary" onClick={handleSave}>{t('saveSettings', locale)}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;

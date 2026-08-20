import { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import 'remixicon/fonts/remixicon.css';
import { Snippet, SnippetFormData, Folder } from './types';
import { getSnippets, addSnippet, updateSnippet, deleteSnippet, toggleFavorite, getFolders } from './db';

// Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import SnippetGrid from './components/SnippetGrid';
import EditorModal from './components/EditorModal';
import SettingsModal from './components/SettingsModal';
import { ToastContainer } from './components/Toast';
import ConfirmModal from './components/ConfirmModal';
import ShareModal from './components/ShareModal';
import ContextMenu from './components/ContextMenu';
import { writeText } from '@tauri-apps/plugin-clipboard-manager';
import { AppSettings } from './types';
import { t } from './i18n';
import { showToast } from './utils/toast';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { readTextFile } from '@tauri-apps/plugin-fs';
import { basename, extname } from '@tauri-apps/api/path';
import { applyTheme } from './themes';
import { readSettingsFromFile, writeSettingsToFile } from './utils/configStore';

const defaultSettings: AppSettings = {
    enableClipboardSniffer: false,
    themeColor: '#06b6d4',
    themePreset: 'classic',
    fontSize: 14,
    defaultLanguage: 'JavaScript',
            languages: ['ABAP', 'C#', 'C++', 'CSS', 'Dart', 'Go', 'HTML', 'Java', 'JavaScript', 'JSON', 'Kotlin', 'Markdown', 'Objective-C', 'PHP', 'Python', 'Ruby', 'Rust', 'Shell', 'SQL', 'Swift', 'Text', 'TypeScript', 'Vue', 'XML', 'YAML'], installedLanguages: [],
    locale: 'zh',
    pinnedLanguages: ['JavaScript', 'HTML', 'CSS', 'Python', 'Go', 'JSON'],
    pinnedTags: [],
    syncProvider: 'none',
    githubToken: '',
    githubRepoName: 'snippetcore-sync',
    lastSyncTime: '',
    syncAutoInterval: 0,
    syncOnStart: false,
    syncOnSave: false,
    syncPullStrategy: 'all',
    enableGlobalShortcut: true,
    globalShortcutKey: 'CommandOrControl+Shift+Space'
};

function App() {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null);
  const [sharingSnippet, setSharingSnippet] = useState<Snippet | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'favorites'>('all');
  
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);
  const [appSettings, setAppSettings] = useState<AppSettings>(defaultSettings);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'appearance' | 'languages' | 'sidebar' | 'sync'>('appearance');
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, type: 'global' | 'snippet', snippet?: Snippet } | null>(null);

  const [confirmDialog, setConfirmDialog] = useState<{ title: string, message: string, onConfirm: () => void } | null>(null);

  const syncTimeoutRef = useRef<number | null>(null);

  // Core background sync executor
  const executeBackgroundSync = useCallback(async (mode: 'pull' | 'push') => {
      if (!appSettings.githubToken || !appSettings.githubRepoName || appSettings.syncProvider !== 'github') return;
      try {
          const { syncToRepo, pullFromRepo } = await import('./sync');
          const { exportData, importData } = await import('./db');
          
          if (mode === 'pull') {
              showToast(t('syncPullAll', appSettings.locale) ? '正在后台拉取同步...' : 'Auto pulling...', 'info');
              const remoteJson = await pullFromRepo(appSettings.githubToken, appSettings.githubRepoName);
              const importedSettings = await importData(remoteJson, appSettings.syncPullStrategy);
              if (importedSettings && appSettings.syncPullStrategy === 'all') {
                  const newSettings = { ...appSettings, ...importedSettings };
                  newSettings.githubToken = appSettings.githubToken;
                  newSettings.githubRepoName = appSettings.githubRepoName;
                  newSettings.syncProvider = appSettings.syncProvider;
                  setAppSettings(newSettings);
              }
              await loadSnippets();
              showToast(t('syncSuccess', appSettings.locale) || 'Sync Success', 'success');
          } else {
              // Push mode
              const mergedJson = await exportData(appSettings);
              await syncToRepo(appSettings.githubToken, appSettings.githubRepoName, mergedJson);
              showToast(t('syncSuccess', appSettings.locale) || 'Sync Success', 'success');
          }
      } catch (e) {
          console.warn("Background sync failed", e);
      }
  }, [appSettings]);

  useEffect(() => {
    loadSnippets();
    const storedSettings = localStorage.getItem('snippetcore_settings');
    let initialSettings = defaultSettings;
    if (storedSettings) {
        try {
            const parsed = JSON.parse(storedSettings);
            initialSettings = { ...defaultSettings, ...parsed };
            setAppSettings(initialSettings);
        } catch {}
    }
    
    // Load config from file
    readSettingsFromFile(initialSettings).then(saved => {
        if (saved) {
            setAppSettings(saved);
        }
        setIsConfigLoaded(true);
    }).catch(() => {
        setIsConfigLoaded(true);
    });

    
    
    // Sync On Start
    if (initialSettings.syncOnStart && initialSettings.githubToken) {
        // Delay slightly to let UI render first
        setTimeout(() => {
            executeBackgroundSync('pull');
        }, 1500);
    }
  }, []);

  // Interval Sync
  useEffect(() => {
      if (appSettings.syncAutoInterval > 0) {
          const ms = appSettings.syncAutoInterval * 60 * 1000;
          const intervalId = setInterval(() => {
              executeBackgroundSync('push'); // Interval sync defaults to push latest state to cloud
          }, ms);
          return () => clearInterval(intervalId);
      }
  }, [appSettings.syncAutoInterval, executeBackgroundSync]);

    // Apply Theme
    useEffect(() => {
        applyTheme(appSettings.themePreset, appSettings.themeColor);
        try { window.__TAURI_INTERNALS__ && getCurrentWindow().setTitle(appSettings.locale === 'zh' ? '碎星' : 'snippet-star'); } catch(e) {}
    }, [appSettings.themeColor, appSettings.themePreset]);

  useEffect(() => {
      document.documentElement.style.fontSize = `${appSettings.fontSize}px`;
  }, [appSettings]);

  // Local settings sync
  useEffect(() => {
      localStorage.setItem('snippetcore_settings', JSON.stringify(appSettings));
      if (!isConfigLoaded) return;
      const timeout = setTimeout(() => {
          writeSettingsToFile(appSettings);
      }, 500);
      return () => clearTimeout(timeout);
  }, [appSettings, isConfigLoaded]);

  // Global Shortcut Registration
  useEffect(() => {
      const setupGlobalShortcut = async () => {
          try {
              if (!window.__TAURI_INTERNALS__) return;
              
              const { register, unregisterAll } = await import('@tauri-apps/plugin-global-shortcut');
              
              await unregisterAll();
              
              const isMac = navigator.userAgent.includes('Mac');
              const isWin = navigator.userAgent.includes('Win');
              
              const currentEnableGlobalShortcut = isMac ? (appSettings.enableGlobalShortcut_mac ?? appSettings.enableGlobalShortcut) : 
                                                (isWin ? (appSettings.enableGlobalShortcut_win ?? appSettings.enableGlobalShortcut) : 
                                                         (appSettings.enableGlobalShortcut_linux ?? appSettings.enableGlobalShortcut));
              
              const currentGlobalShortcutKey = isMac ? (appSettings.globalShortcutKey_mac || appSettings.globalShortcutKey) : 
                                             (isWin ? (appSettings.globalShortcutKey_win || appSettings.globalShortcutKey) : 
                                                      (appSettings.globalShortcutKey_linux || appSettings.globalShortcutKey));
              
              if (currentEnableGlobalShortcut && currentGlobalShortcutKey) {
                  await register(currentGlobalShortcutKey, async (event) => {
                      console.log("Global shortcut pressed!", event);
                      if (event.state === 'Pressed') {
                          const appWindow = getCurrentWindow();
                          const isVisible = await appWindow.isVisible();
                          const isFocused = await appWindow.isFocused();
                          
                          if (isVisible && isFocused) {
                              await appWindow.hide();
                          } else {
                              await appWindow.show();
                              await appWindow.setFocus();
                              // Let the frontend know to focus the search bar
                              window.dispatchEvent(new CustomEvent('focus-search'));
                          }
                      }
                  });
                  console.log("Global shortcut registered successfully:", currentGlobalShortcutKey);
              }
          } catch (err: any) {
              console.error("Failed to setup global shortcut", err);
              const errMsg = err?.message || String(err);
              const key = appSettings.globalShortcutKey || 'Unknown';
              if (errMsg.includes('already registered') || errMsg.includes('occupied') || errMsg.includes('System')) {
                  showToast(appSettings.locale === 'zh' ? `快捷键 [${key}] 被占用或无效！` : `Shortcut [${key}] is occupied or invalid!`, "error");
              } else {
                  showToast(appSettings.locale === 'zh' ? `快捷键注册失败：请检查格式是否正确 (${key})` : `Failed to register shortcut (${key})`, "error");
              }
          }
      };

      setupGlobalShortcut();

      return () => {
          if (window.__TAURI_INTERNALS__) {
              import('@tauri-apps/plugin-global-shortcut').then(({ unregisterAll }) => {
                  unregisterAll().catch(console.error);
              }).catch(console.error);
          }
      };
  }, [appSettings]);

  const loadSnippets = async () => {
    try {
      const data = await getSnippets();
      setSnippets(data);
      try {
          const fData = await getFolders();
          setFolders(fData);
      } catch (e) {}
    } catch (error) {
      console.error("Failed to load snippets", error);
    }
  };

  const handleOpenNewModal = () => {
    setEditingSnippet(null);
    setIsModalOpen(true);
  };

  const handleEditSnippet = (snippet: Snippet) => {
    setEditingSnippet(snippet);
    setIsModalOpen(true);
  };

    useEffect(() => {
    if (filterType === 'folder' as any) {
      setCurrentFolderId(activeTab);
    } else {
      setCurrentFolderId(null);
    }
  }, [filterType, activeTab]);

  const handleSaveSnippet = async (data: SnippetFormData) => {
    if (!editingSnippet?.id && currentFolderId) {
      data.folder_id = currentFolderId;
    }
    try {
      if (editingSnippet && editingSnippet.id) {
        await updateSnippet(editingSnippet.id, data);
        showToast(t('saveSuccess', appSettings.locale), 'success');
      } else {
        await addSnippet(data);
        showToast(t('createSuccess', appSettings.locale), 'success');
      }
      setIsModalOpen(false);
      loadSnippets();
      
      // Debounced Push On Save
      if (appSettings.syncOnSave) {
          if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
          syncTimeoutRef.current = window.setTimeout(() => {
              executeBackgroundSync('push');
          }, 5000);
      }
    } catch (err) {
      console.error("Save failed:", err);
      showToast(t('saveFailed', appSettings.locale) + String(err), 'error');
    }
  };

  const handleDeleteSnippet = (id: string) => {
    setConfirmDialog({
        title: t('deleteConfirmTitle', appSettings.locale),
        message: t('deleteConfirmMsg', appSettings.locale),
        onConfirm: async () => {
            try {
                await deleteSnippet(id);
                await loadSnippets();
                if (editingSnippet?.id === id) {
                    setIsModalOpen(false);
                    setEditingSnippet(null);
                }
                if (sharingSnippet?.id === id) setSharingSnippet(null);
                
                // Debounced Push On Delete
                if (appSettings.syncOnSave) {
                    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
                    syncTimeoutRef.current = window.setTimeout(() => {
                        executeBackgroundSync('push');
                    }, 5000);
                }
                showToast(t('deleteSuccess', appSettings.locale), 'success');
            } catch (err) {
                showToast(t('deleteFailed', appSettings.locale) + String(err), 'error');
            }
            setConfirmDialog(null);
        }
    });
  };

  const handleToggleFavorite = async (snippet: Snippet) => {
    try {
        await toggleFavorite(snippet.id, !snippet.is_favorite);
        await loadSnippets();
        showToast(t(!snippet.is_favorite ? 'addFavorite' : 'removeFavorite', appSettings.locale), 'info');
    } catch (err) {
        showToast(t('actionFailed', appSettings.locale), 'error');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  useEffect(() => {
    if (!window.__TAURI_INTERNALS__) return;
    
    let unlisten: () => void;
    let isCancelled = false;
    
    const setupDragDrop = async () => {
        try {
            const unlistenFn = await getCurrentWindow().onDragDropEvent(async (event) => {
                if (isCancelled) return;
                if (event.payload.type === 'enter' || event.payload.type === 'over') {
                    setIsDragging(true);
                } else if (event.payload.type === 'drop') {
                    setIsDragging(false);
                    console.log('DROP PAYLOAD:', event.payload);
                    const paths = event.payload.paths;
                    if (paths && paths.length > 0) {
                        const filePath = paths[0];
                        try {
                            const contentStr = await readTextFile(filePath);
                            const bName = await basename(filePath);
                            let eName = '';
                            try { eName = await extname(filePath); } catch (e) {}
                            
                            let title = bName;
                            if (eName) {
                                title = bName.substring(0, bName.lastIndexOf('.'));
                            }
                            const ext = eName ? eName.toLowerCase() : '';
                            
                            let language = 'Text';
                            const langMap: Record<string, string> = { 'abap': 'ABAP', 'cs': 'C#', 'cpp': 'C++', 'css': 'CSS', 'dart': 'Dart', 'go': 'Go', 'html': 'HTML', 'java': 'Java', 'js': 'JavaScript', 'json': 'JSON', 'kt': 'Kotlin', 'md': 'Markdown', 'm': 'Objective-C', 'php': 'PHP', 'py': 'Python', 'rb': 'Ruby', 'rs': 'Rust', 'sh': 'Shell', 'sql': 'SQL', 'swift': 'Swift', 'txt': 'Text', 'ts': 'TypeScript', 'vue': 'Vue', 'xml': 'XML', 'yml': 'YAML', 'yaml': 'YAML', 'svg': 'SVG' };
                            if (langMap[ext]) language = langMap[ext];

                            setIsModalOpen(true); setEditingSnippet({
                                id: '',
                                title: title,
                                code_content: contentStr,
                                language: language,
                                tags: '[]',
                                is_favorite: false,
                                updated_at: new Date().toISOString(), created_at: new Date().toISOString()
                            });
                        } catch (err) {
                            showToast(String(err), 'error');
                        }
                    }
                } else if (event.payload.type === 'leave') {
                    setIsDragging(false);
                }
            });
            if (!isCancelled) unlisten = unlistenFn;
        } catch (e) {
            console.error("Failed to setup drag drop", e);
        }
    };
    
    setupDragDrop();
    
    return () => {
        isCancelled = true;
        if (unlisten) unlisten();
    };
  }, [appSettings]);

  const handleDrop = async (e: React.DragEvent) => {
      // Fallback for non-Tauri environment
      e.preventDefault();
      setIsDragging(false);
      // Basic HTML5 implementation omitted here since Tauri will handle it
  };

  const handleCopySnippet = async (code: string) => {
    try {
      await writeText(code);
      showToast(t('copySuccess', appSettings.locale), 'success');
    } catch (e: any) {
      console.error('Failed to copy text', e);
      showToast(`Copy failed: ${e.message || String(e)}`, 'error');
      // Fallback
      navigator.clipboard.writeText(code);
    }
  };

  const handleShareSnippet = (snippet: Snippet) => {
    setSharingSnippet(snippet);
  };

  // 过滤逻辑
  const filteredSnippets = snippets.filter(s => {
    // 侧边栏过滤
    if (filterType === 'favorites' && !s.is_favorite) return false;
    
    // Tab 过滤
    if (activeTab !== 'all') {
        let tags: string[] = [];
        try {
            const parsed = JSON.parse(s.tags || '[]');
            tags = Array.isArray(parsed) ? parsed : (typeof parsed === 'string' ? JSON.parse(parsed) : []);
            if (!Array.isArray(tags)) tags = [];
        } catch {
            tags = [];
        }
        if (s.language !== activeTab && !tags.includes(activeTab)) {
            return false;
        }
    }

    // 搜索过滤
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return s.title.toLowerCase().includes(q) || s.code_content.toLowerCase().includes(q);
    }
    
    return true;
  });

  return (
    <div 
      className="app-container"
      onContextMenu={(e) => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, type: 'global' }); }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{ position: 'relative' }}
    >
      {isDragging && (
          <div style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(4px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '4px dashed var(--theme-color)',
              borderRadius: '12px',
              margin: '8px'
          }}>
              <div style={{ textAlign: 'center', color: '#fff' }}>
                  <i className="ri-file-add-line" style={{ fontSize: '4rem', marginBottom: '16px', display: 'block' }}></i>
                  <h2>{appSettings.locale === 'zh' ? '松开以上传并添加为片段' : 'Drop to add as snippet'}</h2>
              </div>
          </div>
      )}
      <Sidebar 
        snippets={snippets}
        folders={folders}
        onFoldersChange={loadSnippets}
        filterType={filterType}
        setFilterType={setFilterType}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={(tab = 'appearance') => {
            setSettingsTab(tab);
            setIsSettingsOpen(true);
        }}
        settings={appSettings}
      />
      <main className="main-content">
        <Header 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onNewSnippet={handleOpenNewModal}
          locale={appSettings.locale}
        />
        <SnippetGrid 
          snippets={filteredSnippets} 
          onEditSnippet={handleEditSnippet} 
          onDeleteSnippet={handleDeleteSnippet}
          onToggleFavorite={handleToggleFavorite}
          onCopySnippet={handleCopySnippet}
          locale={appSettings.locale}
          onContextMenu={(e, snippet) => {
              e.preventDefault();
              e.stopPropagation();
              setContextMenu({ x: e.clientX, y: e.clientY, type: 'snippet', snippet });
          }}
        />
      </main>

      {isModalOpen && (
        <EditorModal 
          snippet={editingSnippet} 
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveSnippet}
          onDelete={(editingSnippet && editingSnippet.id) ? () => handleDeleteSnippet(editingSnippet.id) : undefined}
          settings={appSettings}
        />
      )}

      {isSettingsOpen && (
          <SettingsModal 
            settings={appSettings} 
            snippets={snippets}
            initialTab={settingsTab}
            onClose={() => setIsSettingsOpen(false)} 
            onSnippetsChanged={loadSnippets}
            onSave={(newSettings) => {
                setAppSettings(newSettings);
                setIsSettingsOpen(false);
                import('./utils/toast').then(({showToast}) => showToast(t('settingsSaved', newSettings.locale) || 'Settings saved', 'success'));
            }} 
          />
      )}

      <ToastContainer />

      {confirmDialog && (
          <ConfirmModal 
            title={confirmDialog.title}
            message={confirmDialog.message}
            onConfirm={confirmDialog.onConfirm}
            onCancel={() => setConfirmDialog(null)}
            locale={appSettings.locale}
          />
      )}

      {sharingSnippet && (
          <ShareModal 
            snippet={sharingSnippet}
            settings={appSettings}
            onClose={() => setSharingSnippet(null)}
          />
      )}

      {contextMenu && (
          <ContextMenu 
            x={contextMenu.x}
            y={contextMenu.y}
            type={contextMenu.type}
            snippet={contextMenu.snippet}
            locale={appSettings.locale}
            onClose={() => setContextMenu(null)}
            onAction={async (action, snippet) => {
                setContextMenu(null);
                if (action === 'settings') {
                    setSettingsTab('appearance');
                    setIsSettingsOpen(true);
                } else if (action === 'share' && snippet) {
                    handleShareSnippet(snippet);
                } else if (action === 'export' && snippet) {
                    try {
                        const { save } = await import('@tauri-apps/plugin-dialog');
                        const { writeTextFile } = await import('@tauri-apps/plugin-fs');
                        
                        const langMap: Record<string, string> = { 'ABAP': 'abap', 'C#': 'cs', 'C++': 'cpp', 'CSS': 'css', 'Dart': 'dart', 'Go': 'go', 'HTML': 'html', 'Java': 'java', 'JavaScript': 'js', 'JSON': 'json', 'Kotlin': 'kt', 'Markdown': 'md', 'Objective-C': 'm', 'PHP': 'php', 'Python': 'py', 'Ruby': 'rb', 'Rust': 'rs', 'Shell': 'sh', 'SQL': 'sql', 'Swift': 'swift', 'Text': 'txt', 'TypeScript': 'ts', 'Vue': 'vue', 'XML': 'xml', 'YAML': 'yml', 'SVG': 'svg' };
                        const ext = langMap[snippet.language] || 'txt';
                        const safeTitle = snippet.title.replace(/[\\/:*?"<>|]/g, '_');
                        
                        const filePath = await save({
                            defaultPath: `${safeTitle}.${ext}`
                        });
                        if (filePath) {
                            await writeTextFile(filePath, snippet.code_content);
                            showToast(appSettings.locale === 'zh' ? '导出成功' : 'Exported successfully', 'success');
                        }
                    } catch (e) {
                        showToast(String(e), 'error');
                    }
                } else if (action === 'duplicate' && snippet) {
                    try {
                        await addSnippet({
                            title: snippet.title + (appSettings.locale === 'zh' ? ' (副本)' : ' (Copy)'),
                            code_content: snippet.code_content,
                            language: snippet.language,
                            tags: snippet.tags ? JSON.parse(snippet.tags) : [],
                            is_favorite: snippet.is_favorite
                        });
                        showToast(appSettings.locale === 'zh' ? '复制卡片成功' : 'Duplicated successfully', 'success');
                        loadSnippets();
                        if (appSettings.syncOnSave) {
                            if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
                            syncTimeoutRef.current = window.setTimeout(() => {
                                executeBackgroundSync('push');
                            }, 5000);
                        }
                    } catch (e) {
                        showToast(String(e), 'error');
                    }
                } else if (action === 'sync-push' || action === 'sync-pull') {
                    if (!appSettings.githubToken || appSettings.syncProvider !== 'github') {
                        showToast(appSettings.locale === 'zh' ? '请先在设置中配置并开启 GitHub 同步' : 'Please configure GitHub Sync in Settings', 'error');
                        setSettingsTab('sync');
                        setIsSettingsOpen(true);
                    } else {
                        executeBackgroundSync(action === 'sync-push' ? 'push' : 'pull');
                    }
                }
            }}
          />
      )}
    </div>
  );
}

export default App;

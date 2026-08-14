import { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import 'remixicon/fonts/remixicon.css';
import { Snippet, SnippetFormData } from './types';
import { getSnippets, addSnippet, updateSnippet, deleteSnippet, toggleFavorite } from './db';

// Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import SnippetGrid from './components/SnippetGrid';
import EditorModal from './components/EditorModal';
import SettingsModal from './components/SettingsModal';
import { ToastContainer } from './components/Toast';
import ConfirmModal from './components/ConfirmModal';
import ShareModal from './components/ShareModal';
import { writeText } from '@tauri-apps/plugin-clipboard-manager';
import { AppSettings } from './types';
import { t } from './i18n';
import { showToast } from './utils/toast';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { applyTheme } from './themes';
import { readSettingsFromFile, writeSettingsToFile } from './utils/configStore';

const defaultSettings: AppSettings = {
    enableClipboardSniffer: false,
    themeColor: '#06b6d4',
    themePreset: 'classic',
    fontSize: 14,
    defaultLanguage: 'JavaScript',
    languages: ['ABAP', 'C#', 'C++', 'CSS', 'Dart', 'Go', 'HTML', 'Java', 'JavaScript', 'JSON', 'Kotlin', 'Markdown', 'Objective-C', 'PHP', 'Python', 'Ruby', 'Rust', 'Shell', 'SQL', 'Swift', 'Text', 'TypeScript', 'Vue', 'XML', 'YAML'],
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
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null);
  const [sharingSnippet, setSharingSnippet] = useState<Snippet | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'favorites'>('all');
  
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);
  const [appSettings, setAppSettings] = useState<AppSettings>(defaultSettings);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'appearance' | 'languages' | 'sidebar'>('appearance');

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
    readSettingsFromFile().then(saved => {
        if (saved) {
            setAppSettings(saved);
        }
        setIsConfigLoaded(true);
    }).catch(() => {
        setIsConfigLoaded(true);
    });

    
    // Load file config asynchronously
    readSettingsFromFile().then(saved => {
        if (saved) setAppSettings(saved);
    }).catch(() => {});
    
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
              
              if (appSettings.enableGlobalShortcut && appSettings.globalShortcutKey) {
                  await register(appSettings.globalShortcutKey, async (event) => {
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
                  console.log("Global shortcut registered successfully:", appSettings.globalShortcutKey);
              }
          } catch (err: any) {
              console.error("Failed to setup global shortcut", err);
              showToast("Shortcut Error: " + (err?.message || String(err)), "error");
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
  }, [appSettings.enableGlobalShortcut, appSettings.globalShortcutKey]);

  const loadSnippets = async () => {
    try {
      const data = await getSnippets();
      setSnippets(data);
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

  const handleSaveSnippet = async (data: SnippetFormData) => {
    try {
      if (editingSnippet) {
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
    <div className="app-container">
      <Sidebar 
        snippets={snippets}
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
          onShareSnippet={handleShareSnippet}
          locale={appSettings.locale}
        />
      </main>

      {isModalOpen && (
        <EditorModal 
          snippet={editingSnippet} 
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveSnippet}
          onDelete={editingSnippet ? () => handleDeleteSnippet(editingSnippet.id) : undefined}
          settings={appSettings}
        />
      )}

      {isSettingsOpen && (
          <SettingsModal 
            settings={appSettings} 
            snippets={snippets}
            initialTab={settingsTab}
            onClose={() => setIsSettingsOpen(false)} 
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
    </div>
  );
}

export default App;

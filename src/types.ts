declare global {
    interface Window {
        __TAURI_INTERNALS__?: any;
    }
}

export interface Snippet {
    id: string;
    title: string;
    code_content: string;
    language: string;
    tags: string; // JSON array string
    is_favorite: boolean;
    created_at: string;
    updated_at: string;
}

export interface SnippetFormData {
    title: string;
    code_content: string;
    language: string;
    tags: string[];
    is_favorite: boolean;
}

export interface AppSettings {
    themeColor: string;
    themePreset: string;
    fontSize: number;
    defaultLanguage: string;
    languages: string[];
    installedLanguages: string[];
    locale: 'zh' | 'en';
    pinnedLanguages: string[];
    pinnedTags: string[];
    syncProvider: 'none' | 'github';
    githubToken: string;
    githubRepoName: string;
    lastSyncTime: string;
    syncAutoInterval: number;
    syncOnStart: boolean;
    syncOnSave: boolean;
    syncPullStrategy: 'all' | 'snippets_only' | 'settings_only';
    enableGlobalShortcut: boolean;
    globalShortcutKey: string;
    enableGlobalShortcut_mac?: boolean;
    globalShortcutKey_mac?: string;
    enableGlobalShortcut_win?: boolean;
    globalShortcutKey_win?: string;
    enableGlobalShortcut_linux?: boolean;
    globalShortcutKey_linux?: string;
    enableClipboardSniffer: boolean;
}

export const defaultSettings: AppSettings = {
    themeColor: '#06b6d4',
    themePreset: 'classic',
    fontSize: 14,
    defaultLanguage: 'JavaScript',
    languages: ['ABAP', 'C#', 'C++', 'CSS', 'Dart', 'Go', 'HTML', 'Java', 'JavaScript', 'JSON', 'Kotlin', 'Markdown', 'Objective-C', 'PHP', 'Python', 'Ruby', 'Rust', 'Shell', 'SQL', 'Swift', 'Text', 'TypeScript', 'Vue', 'XML', 'YAML', 'SVG', 'Mermaid', 'ECharts'],
    installedLanguages: [],
    locale: 'zh',
    pinnedLanguages: ['JavaScript', 'HTML', 'SVG', 'Mermaid', 'ECharts', 'CSS', 'Python', 'Go', 'JSON'],
    pinnedTags: [],
    syncProvider: 'none',
    githubToken: '',
    githubRepoName: 'snippetcore-sync',
    lastSyncTime: '',
    syncAutoInterval: 0,
    syncOnStart: false,
    syncOnSave: false,
    syncPullStrategy: 'all',
    enableGlobalShortcut: false,
    globalShortcutKey: '',
    enableGlobalShortcut_mac: false,
    globalShortcutKey_mac: '',
    enableGlobalShortcut_win: false,
    globalShortcutKey_win: '',
    enableGlobalShortcut_linux: false,
    globalShortcutKey_linux: '',
    enableClipboardSniffer: false
};


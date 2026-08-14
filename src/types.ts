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
}

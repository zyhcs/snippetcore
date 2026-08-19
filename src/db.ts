import Database from '@tauri-apps/plugin-sql';
import { Snippet, SnippetFormData } from './types';
import { v4 as uuidv4 } from 'uuid';

let dbInstance: Database | null = null;

export async function getDb() {
    if (!dbInstance) {
        dbInstance = await Database.load('sqlite:snippetcore.db');
        try {
            await dbInstance.execute(`
              CREATE TABLE IF NOT EXISTS snippet_history (
                id TEXT PRIMARY KEY,
                snippet_id TEXT,
                title TEXT,
                code_content TEXT,
                language TEXT,
                tags TEXT,
                updated_at DATETIME
              );
            `);
        } catch(e) {}
    }
    return dbInstance;
}

export async function getInternalSetting(key: string): Promise<string | null> {
    try {
        const db = await getDb();
        const result = await db.select<{value: string}[]>('SELECT value FROM internal_settings WHERE key = $1', [key]);
        return result.length > 0 ? result[0].value : null;
    } catch (e) {
        console.warn("Failed to read internal setting (table might not exist yet):", e);
        return null;
    }
}

export async function setInternalSetting(key: string, value: string): Promise<void> {
    try {
        const db = await getDb();
        await db.execute(
            'INSERT OR REPLACE INTO internal_settings (key, value) VALUES ($1, $2)',
            [key, value]
        );
    } catch (e) {
        console.error("Failed to write internal setting:", e);
    }
}

export async function getSnippetHistory(snippetId: string): Promise<any[]> {
    const db = await getDb();
    const result: any[] = await db.select('SELECT * FROM snippet_history WHERE snippet_id = $1 ORDER BY updated_at DESC', [snippetId]);
    return result;
}

export async function restoreSnippetHistory(historyId: string): Promise<void> {
    const db = await getDb();
    const historyData: any[] = await db.select('SELECT * FROM snippet_history WHERE id = $1', [historyId]);
    if (historyData && historyData.length > 0) {
        const history = historyData[0];
        const now = new Date().toISOString();
        await db.execute(
            'UPDATE snippets SET title = $1, code_content = $2, language = $3, tags = $4, updated_at = $5 WHERE id = $6',
            [history.title, history.code_content, history.language, history.tags, now, history.snippet_id]
        );
    }
}

export async function getSnippets(): Promise<Snippet[]> {
    const db = await getDb();
    return await db.select<Snippet[]>('SELECT * FROM snippets ORDER BY updated_at DESC');
}

export async function addSnippet(data: SnippetFormData): Promise<Snippet> {
    const db = await getDb();
    const id = uuidv4();
    const now = new Date().toISOString();
    const tagsJson = JSON.stringify(data.tags);
    
    await db.execute(
        'INSERT INTO snippets (id, title, code_content, language, tags, is_favorite, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [id, data.title, data.code_content, data.language, tagsJson, data.is_favorite ? 1 : 0, now, now]
    );
    
    return {
        id,
        ...data,
        tags: tagsJson,
        created_at: now,
        updated_at: now
    };
}

export async function updateSnippet(id: string, data: SnippetFormData): Promise<void> {
    const db = await getDb();
    const now = new Date().toISOString();
    const tagsJson = JSON.stringify(data.tags);
    
    // Save history before updating
    try {
        const oldData: any[] = await db.select('SELECT * FROM snippets WHERE id = $1', [id]);
        if (oldData && oldData.length > 0) {
            const old = oldData[0];
            const historyId = crypto.randomUUID();
            await db.execute(
                'INSERT INTO snippet_history (id, snippet_id, title, code_content, language, tags, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                [historyId, id, old.title, old.code_content, old.language, old.tags, old.updated_at]
            );
            
            // Delete oldest histories if there are more than 5
            await db.execute(
                `DELETE FROM snippet_history WHERE id IN (
                    SELECT id FROM snippet_history WHERE snippet_id = $1 ORDER BY updated_at DESC LIMIT -1 OFFSET 5
                )`,
                [id]
            );
        }
    } catch (e) {
        console.error("Failed to save history", e);
    }
    
    await db.execute(
        'UPDATE snippets SET title = $1, code_content = $2, language = $3, tags = $4, is_favorite = $5, updated_at = $6 WHERE id = $7',
        [data.title, data.code_content, data.language, tagsJson, data.is_favorite ? 1 : 0, now, id]
    );
}

export async function deleteSnippet(id: string): Promise<void> {
    const db = await getDb();
    await db.execute('DELETE FROM snippets WHERE id = $1', [id]);
}

export async function toggleFavorite(id: string, is_favorite: boolean): Promise<void> {
    const db = await getDb();
    const now = new Date().toISOString();
    await db.execute(
        'UPDATE snippets SET is_favorite = $1, updated_at = $2 WHERE id = $3',
        [is_favorite ? 1 : 0, now, id]
    );
}

export async function exportData(settings: any): Promise<string> {
    const snippets = await getSnippets();
    const data = {
        version: 2,
        settings,
        snippets
    };
    return JSON.stringify(data, null, 2);
}

export async function importData(jsonString: string, strategy: 'all' | 'snippets_only' | 'settings_only' = 'all'): Promise<any | null> {
    try {
        const parsed = JSON.parse(jsonString);
        let snippetsToImport: Snippet[] = [];
        let importedSettings: any = null;

        if (Array.isArray(parsed)) {
            // V1 format (only snippets)
            snippetsToImport = parsed;
        } else if (parsed.version === 2 && Array.isArray(parsed.snippets)) {
            // V2 format (settings + snippets)
            snippetsToImport = parsed.snippets;
            importedSettings = parsed.settings;
        } else if (typeof parsed === 'object' && parsed !== null) {
            // Pure settings JSON
            snippetsToImport = [];
            importedSettings = parsed.settings || parsed;
        } else {
            throw new Error("Invalid backup format");
        }

        if (strategy === 'settings_only') snippetsToImport = [];
        if (strategy === 'snippets_only') importedSettings = null;

        const db = await getDb();
        
        for (const s of snippetsToImport) {
            // validate minimally
            if (!s.id || !s.title || !s.code_content) continue;
            
            try {
                const existing = await db.select<Snippet[]>('SELECT * FROM snippets WHERE id = $1', [s.id]);
                
                if (existing && existing.length > 0) {
                    const local = existing[0];
                    const localTime = new Date(local.updated_at).getTime();
                    const remoteTime = new Date(s.updated_at).getTime();
                    
                    // If remote is strictly older, skip overriding local
                    if (remoteTime < localTime) {
                        continue;
                    }
                    
                    // Preserve local tags if remote tags are empty
                    let mergedTags = s.tags;
                    if (!mergedTags || mergedTags === '""' || mergedTags === '[]' || mergedTags === '') {
                        mergedTags = local.tags;
                    }
                    
                    // Preserve local favorite if remote is false
                    let mergedFav = s.is_favorite;
                    if (!s.is_favorite && local.is_favorite) {
                        mergedFav = local.is_favorite;
                    }
                    
                    await db.execute(
                        'UPDATE snippets SET title = $1, code_content = $2, language = $3, tags = $4, is_favorite = $5, updated_at = $6 WHERE id = $7',
                        [s.title, s.code_content, s.language, mergedTags, mergedFav ? 1 : 0, s.updated_at, s.id]
                    );
                } else {
                    await db.execute(
                        'INSERT INTO snippets (id, title, code_content, language, tags, is_favorite, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
                        [s.id, s.title, s.code_content, s.language, s.tags, s.is_favorite ? 1 : 0, s.created_at, s.updated_at]
                    );
                }
            } catch (e) {
                console.error("Error importing snippet", s.id, e);
            }
        }
        
        return importedSettings;
    } catch (e) {
        console.error("Failed to import data", e);
        throw e;
    }
}

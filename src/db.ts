import Database from '@tauri-apps/plugin-sql';
import { Snippet, SnippetFormData } from './types';
import { v4 as uuidv4 } from 'uuid';

let dbInstance: Database | null = null;

export async function getDb() {
    if (!dbInstance) {
        dbInstance = await Database.load('sqlite:snippetcore.db');
    }
    return dbInstance;
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
        } else {
            throw new Error("Invalid backup format");
        }

        if (strategy === 'settings_only') snippetsToImport = [];
        if (strategy === 'snippets_only') importedSettings = null;

        const db = await getDb();
        // Execute inside a simple loop
        for (const s of snippetsToImport) {
            // validate minimally
            if (!s.id || !s.title || !s.code_content) continue;
            
            await db.execute(
                'INSERT OR REPLACE INTO snippets (id, title, code_content, language, tags, is_favorite, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
                [s.id, s.title, s.code_content, s.language, s.tags, s.is_favorite ? 1 : 0, s.created_at, s.updated_at]
            );
        }
        
        return importedSettings;
    } catch (e) {
        console.error("Failed to import data", e);
        throw e;
    }
}

import { appConfigDir } from '@tauri-apps/api/path';
import { readTextFile, writeTextFile, exists, mkdir } from '@tauri-apps/plugin-fs';
import { getInternalSetting, setInternalSetting } from '../db';
import { AppSettings, defaultSettings } from '../types';

export const CONFIG_FILE_KEY = 'custom_config_path';

export async function getConfigFilePath(): Promise<string> {
    const customPath = await getInternalSetting(CONFIG_FILE_KEY);
    if (customPath) {
        return customPath;
    }
    // Fallback to default app config dir
    const configDir = await appConfigDir();
    const isDirExists = await exists(configDir);
    if (!isDirExists) {
        await mkdir(configDir, { recursive: true });
    }
    return `${configDir}/snippetconfig.json`.replace(/\/\//g, '/');
}

export async function setConfigFilePath(path: string): Promise<void> {
    await setInternalSetting(CONFIG_FILE_KEY, path);
}

export async function readSettingsFromFile(): Promise<AppSettings> {
    try {
        const filePath = await getConfigFilePath();
        const fileExists = await exists(filePath);
        if (!fileExists) {
            // Create default config file if it doesn't exist
            await writeSettingsToFile(defaultSettings);
            return defaultSettings;
        }
        
        const content = await readTextFile(filePath);
        const parsed = JSON.parse(content);
        return { ...defaultSettings, ...parsed };
    } catch (e) {
        console.error("Failed to read settings from file:", e);
        return defaultSettings;
    }
}

export async function writeSettingsToFile(settings: AppSettings): Promise<void> {
    try {
        const filePath = await getConfigFilePath();
        
        // Ensure parent directory exists for custom paths too
        const parentDir = filePath.substring(0, filePath.lastIndexOf('/')) || filePath.substring(0, filePath.lastIndexOf('\\'));
        if (parentDir) {
            const dirExists = await exists(parentDir);
            if (!dirExists) {
                await mkdir(parentDir, { recursive: true });
            }
        }
        
        await writeTextFile(filePath, JSON.stringify(settings, null, 2));
    } catch (e) {
        console.error("Failed to write settings to file:", e);
    }
}

export async function selectConfigFilePath(): Promise<string | null> {
    const { open } = await import('@tauri-apps/plugin-dialog');
    const selected = await open({
        title: '选择本地配置文件目录',
        multiple: false,
        directory: true,
    });
    
    if (selected && typeof selected === 'string') {
        const newPath = `${selected}/snippetconfig.json`.replace(/\/\//g, '/');
        await setConfigFilePath(newPath);
        return newPath;
    }
    return null;
}

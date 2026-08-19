import prettier from 'prettier/standalone';
import babelPlugin from 'prettier/plugins/babel';
import estreePlugin from 'prettier/plugins/estree';
import htmlPlugin from 'prettier/plugins/html';
import cssPlugin from 'prettier/plugins/postcss';
import markdownPlugin from 'prettier/plugins/markdown';
import typescriptPlugin from 'prettier/plugins/typescript';
import yamlPlugin from 'prettier/plugins/yaml';
import { format as formatSql } from 'sql-formatter';
import { Command } from '@tauri-apps/plugin-shell';
import { writeTextFile } from '@tauri-apps/plugin-fs';
import { tempDir } from '@tauri-apps/api/path';

export async function formatCode(code: string, language: string): Promise<string> {
    try {
        const lang = language.toLowerCase();
        
        // --- 1. Specialized Web Formatters ---
        if (lang === 'sql') {
            return formatSql(code, { language: 'postgresql', tabWidth: 4 });
        }
        
        // --- 2. System Shell Native Formatters ---
        const shellFormatters: Record<string, { cmd: string }> = {
            'go': { cmd: 'gofmt' },
            'rust': { cmd: 'rustfmt' },
            'python': { cmd: 'black' },
            'dart': { cmd: 'dart' },
            'c++': { cmd: 'clang-format' },
            'c': { cmd: 'clang-format' },
            'java': { cmd: 'clang-format' }
        };
        
        if (shellFormatters[lang]) {
            try {
                const formatter = shellFormatters[lang];
                const tmpPath = await tempDir();
                const tmpFile = `${tmpPath}/format_tmp_${Date.now()}.${lang === 'python' ? 'py' : lang === 'rust' ? 'rs' : lang === 'go' ? 'go' : lang === 'dart' ? 'dart' : lang === 'java' ? 'java' : 'cpp'}`;
                
                await writeTextFile(tmpFile, code);
                
                let shScript = '';
                if (lang === 'go') {
                    shScript = `gofmt -w "${tmpFile}"`;
                } else if (lang === 'rust') {
                    shScript = `rustfmt "${tmpFile}"`;
                } else if (lang === 'dart') {
                    shScript = `dart format "${tmpFile}"`;
                } else if (lang === 'python') {
                    shScript = `python3 -m black -q "${tmpFile}" || python3 -m autopep8 --in-place "${tmpFile}"`;
                } else {
                    shScript = `${formatter.cmd} -i "${tmpFile}"`;
                }
                
                const command = Command.create('run-sh', ['-c', shScript]);
                await command.execute();
                
                let formatted = code;
                try {
                    const catCmd = Command.create('run-sh', ['-c', `cat "${tmpFile}"`]);
                    const catRes = await catCmd.execute();
                    if (catRes.code === 0 && catRes.stdout.trim()) {
                        formatted = catRes.stdout;
                    }
                } catch(e) {}
                
                try {
                    const rmCmd = Command.create('run-sh', ['-c', `rm "${tmpFile}"`]);
                    await rmCmd.execute();
                } catch(e) {}
                
                if (formatted && formatted !== code) return formatted;
            } catch (err) {
                console.log("Native formatter failed, falling back", err);
            }
        }
        
        // --- 3. Prettier for frontend languages ---
        let parser = '';
        let plugins: any[] = [];
        
        switch (lang) {
            case 'javascript':
            case 'json':
                parser = lang === 'json' ? 'json' : 'babel';
                plugins = [babelPlugin, estreePlugin];
                break;
            case 'typescript':
                parser = 'typescript';
                plugins = [typescriptPlugin, estreePlugin];
                break;
            case 'html':
            case 'svg':
            case 'vue':
                parser = lang === 'vue' ? 'vue' : 'html';
                plugins = [htmlPlugin];
                break;
            case 'css':
                parser = 'css';
                plugins = [cssPlugin];
                break;
            case 'markdown':
                parser = 'markdown';
                plugins = [markdownPlugin];
                break;
            case 'yaml':
            case 'yml':
                parser = 'yaml';
                plugins = [yamlPlugin];
                break;
            default:
                return code; // Unsupported language
        }
        
        if (!parser) return code;
        
        return await prettier.format(code, {
            parser,
            plugins,
            tabWidth: 4,
            semi: true,
            singleQuote: true
        });
    } catch (e) {
        console.error("Format error:", e);
        return code;
    }
}

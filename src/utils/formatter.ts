import prettier from 'prettier/standalone';
import babelPlugin from 'prettier/plugins/babel';
import estreePlugin from 'prettier/plugins/estree';
import htmlPlugin from 'prettier/plugins/html';
import cssPlugin from 'prettier/plugins/postcss';
import markdownPlugin from 'prettier/plugins/markdown';
import typescriptPlugin from 'prettier/plugins/typescript';
import yamlPlugin from 'prettier/plugins/yaml';

export async function formatCode(code: string, language: string): Promise<string> {
    try {
        let parser = '';
        let plugins: any[] = [];
        
        switch (language.toLowerCase()) {
            case 'javascript':
            case 'json':
                parser = language.toLowerCase() === 'json' ? 'json' : 'babel';
                plugins = [babelPlugin, estreePlugin];
                break;
            case 'typescript':
                parser = 'typescript';
                plugins = [typescriptPlugin, estreePlugin];
                break;
            case 'html':
            case 'svg':
            case 'vue':
                parser = language.toLowerCase() === 'vue' ? 'vue' : 'html';
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

import { Extension } from '@codemirror/state';

export interface LanguageDef {
    id: string;
    name: string;
    isBuiltIn: boolean;
    load: () => Promise<Extension | null>;
}

// Ensure the required function is used for legacy modes
const loadStreamMode = async (modeName: string, subMode?: string) => {
    const [streamLang, modePack] = await Promise.all([
        import('@codemirror/language').then(m => m.StreamLanguage),
        import(`@codemirror/legacy-modes/mode/${modeName}`)
    ]);
    const modeObj = subMode ? (modePack as any)[subMode] : Object.values(modePack)[0];
    return streamLang.define(modeObj);
};

export const LANGUAGE_REGISTRY: LanguageDef[] = [
    { id: 'ABAP', name: 'ABAP', isBuiltIn: true, load: async () => {
        const [{ abapMode }, { StreamLanguage }] = await Promise.all([
            import('codemirror6-abap'),
            import('@codemirror/language')
        ]);
        return StreamLanguage.define(abapMode as any);
    }},
    { id: 'JavaScript', name: 'JavaScript', isBuiltIn: true, load: async () => (await import('@codemirror/lang-javascript')).javascript() },
    { id: 'TypeScript', name: 'TypeScript', isBuiltIn: true, load: async () => (await import('@codemirror/lang-javascript')).javascript({ typescript: true }) },
    { id: 'HTML', name: 'HTML', isBuiltIn: true, load: async () => (await import('@codemirror/lang-html')).html() },
    { id: 'CSS', name: 'CSS', isBuiltIn: true, load: async () => (await import('@codemirror/lang-css')).css() },
    { id: 'Markdown', name: 'Markdown', isBuiltIn: true, load: async () => (await import('@codemirror/lang-markdown')).markdown() },
    { id: 'Python', name: 'Python', isBuiltIn: true, load: async () => (await import('@codemirror/lang-python')).python() },
    { id: 'JSON', name: 'JSON', isBuiltIn: true, load: async () => (await import('@codemirror/lang-json')).json() },
    { id: 'Java', name: 'Java', isBuiltIn: true, load: async () => (await import('@codemirror/lang-java')).java() },
    { id: 'C++', name: 'C++', isBuiltIn: true, load: async () => (await import('@codemirror/lang-cpp')).cpp() },
    { id: 'Text', name: 'Plain Text', isBuiltIn: true, load: async () => null }, // No extension
    { id: 'SVG', name: 'SVG', isBuiltIn: true, load: async () => (await import('@codemirror/lang-xml')).xml() },
    { id: 'Mermaid', name: 'Mermaid', isBuiltIn: true, load: async () => null }, // No syntax highlight yet
    { id: 'ECharts', name: 'ECharts', isBuiltIn: true, load: async () => (await import('@codemirror/lang-javascript')).javascript() },
    
    // Installable Languages
    { id: 'C#', name: 'C#', isBuiltIn: false, load: () => loadStreamMode('clike', 'csharp') },
    { id: 'Dart', name: 'Dart', isBuiltIn: false, load: () => loadStreamMode('clike', 'dart') },
    { id: 'Go', name: 'Go', isBuiltIn: false, load: () => loadStreamMode('go') },
    { id: 'Kotlin', name: 'Kotlin', isBuiltIn: false, load: () => loadStreamMode('clike', 'kotlin') },
    { id: 'Objective-C', name: 'Objective-C', isBuiltIn: false, load: () => loadStreamMode('clike', 'objectiveC') },
    { id: 'PHP', name: 'PHP', isBuiltIn: false, load: async () => (await import('@codemirror/lang-php')).php() },
    { id: 'Ruby', name: 'Ruby', isBuiltIn: false, load: () => loadStreamMode('ruby') },
    { id: 'Rust', name: 'Rust', isBuiltIn: false, load: async () => (await import('@codemirror/lang-rust')).rust() },
    { id: 'Shell', name: 'Shell', isBuiltIn: false, load: () => loadStreamMode('shell') },
    { id: 'SQL', name: 'SQL', isBuiltIn: false, load: async () => (await import('@codemirror/lang-sql')).sql() },
    { id: 'Swift', name: 'Swift', isBuiltIn: false, load: () => loadStreamMode('swift') },
    { id: 'Vue', name: 'Vue', isBuiltIn: false, load: async () => (await import('@codemirror/lang-vue')).vue() },
    { id: 'XML', name: 'XML', isBuiltIn: false, load: async () => (await import('@codemirror/lang-xml')).xml() },
    { id: 'YAML', name: 'YAML', isBuiltIn: false, load: async () => (await import('@codemirror/lang-yaml')).yaml() },
];

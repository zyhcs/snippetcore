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
    { id: 'APL', name: 'APL', isBuiltIn: false, load: () => loadStreamMode('apl') },
    { id: 'ASN.1', name: 'ASN.1', isBuiltIn: false, load: () => loadStreamMode('asn1') },
    { id: 'Asterisk', name: 'Asterisk', isBuiltIn: false, load: () => loadStreamMode('asterisk') },
    { id: 'Brainfuck', name: 'Brainfuck', isBuiltIn: false, load: () => loadStreamMode('brainfuck') },
    { id: 'C', name: 'C', isBuiltIn: false, load: () => loadStreamMode('clike', 'c') },
    { id: 'Clojure', name: 'Clojure', isBuiltIn: false, load: () => loadStreamMode('clojure') },
    { id: 'CMake', name: 'CMake', isBuiltIn: false, load: () => loadStreamMode('cmake') },
    { id: 'COBOL', name: 'COBOL', isBuiltIn: false, load: () => loadStreamMode('cobol') },
    { id: 'CoffeeScript', name: 'CoffeeScript', isBuiltIn: false, load: () => loadStreamMode('coffeescript') },
    { id: 'Common Lisp', name: 'Common Lisp', isBuiltIn: false, load: () => loadStreamMode('commonlisp') },
    { id: 'Crystal', name: 'Crystal', isBuiltIn: false, load: () => loadStreamMode('crystal') },
    { id: 'Cypher', name: 'Cypher', isBuiltIn: false, load: () => loadStreamMode('cypher') },
    { id: 'D', name: 'D', isBuiltIn: false, load: () => loadStreamMode('d') },
    { id: 'Diff', name: 'Diff', isBuiltIn: false, load: () => loadStreamMode('diff') },
    { id: 'Dockerfile', name: 'Dockerfile', isBuiltIn: false, load: () => loadStreamMode('dockerfile') },
    { id: 'DTD', name: 'DTD', isBuiltIn: false, load: () => loadStreamMode('dtd') },
    { id: 'Dylan', name: 'Dylan', isBuiltIn: false, load: () => loadStreamMode('dylan') },
    { id: 'EBNF', name: 'EBNF', isBuiltIn: false, load: () => loadStreamMode('ebnf') },
    { id: 'ECL', name: 'ECL', isBuiltIn: false, load: () => loadStreamMode('ecl') },
    { id: 'Eiffel', name: 'Eiffel', isBuiltIn: false, load: () => loadStreamMode('eiffel') },
    { id: 'Elm', name: 'Elm', isBuiltIn: false, load: () => loadStreamMode('elm') },
    { id: 'Erlang', name: 'Erlang', isBuiltIn: false, load: () => loadStreamMode('erlang') },
    { id: 'Factor', name: 'Factor', isBuiltIn: false, load: () => loadStreamMode('factor') },
    { id: 'FCL', name: 'FCL', isBuiltIn: false, load: () => loadStreamMode('fcl') },
    { id: 'Forth', name: 'Forth', isBuiltIn: false, load: () => loadStreamMode('forth') },
    { id: 'Fortran', name: 'Fortran', isBuiltIn: false, load: () => loadStreamMode('fortran') },
    { id: 'Gas', name: 'Gas', isBuiltIn: false, load: () => loadStreamMode('gas') },
    { id: 'Gherkin', name: 'Gherkin', isBuiltIn: false, load: () => loadStreamMode('gherkin') },
    { id: 'Groovy', name: 'Groovy', isBuiltIn: false, load: () => loadStreamMode('groovy') },
    { id: 'Haskell', name: 'Haskell', isBuiltIn: false, load: () => loadStreamMode('haskell') },
    { id: 'Haxe', name: 'Haxe', isBuiltIn: false, load: () => loadStreamMode('haxe') },
    { id: 'HTTP', name: 'HTTP', isBuiltIn: false, load: () => loadStreamMode('http') },
    { id: 'IDL', name: 'IDL', isBuiltIn: false, load: () => loadStreamMode('idl') },
    { id: 'Jinja2', name: 'Jinja2', isBuiltIn: false, load: () => loadStreamMode('jinja2') },
    { id: 'Julia', name: 'Julia', isBuiltIn: false, load: () => loadStreamMode('julia') },
    { id: 'LiveScript', name: 'LiveScript', isBuiltIn: false, load: () => loadStreamMode('livescript') },
    { id: 'Lua', name: 'Lua', isBuiltIn: false, load: () => loadStreamMode('lua') },
    { id: 'Mathematica', name: 'Mathematica', isBuiltIn: false, load: () => loadStreamMode('mathematica') },
    { id: 'mbox', name: 'mbox', isBuiltIn: false, load: () => loadStreamMode('mbox') },
    { id: 'mIRC', name: 'mIRC', isBuiltIn: false, load: () => loadStreamMode('mirc') },
    { id: 'Modelica', name: 'Modelica', isBuiltIn: false, load: () => loadStreamMode('modelica') },
    { id: 'MscGen', name: 'MscGen', isBuiltIn: false, load: () => loadStreamMode('mscgen') },
    { id: 'MUMPS', name: 'MUMPS', isBuiltIn: false, load: () => loadStreamMode('mumps') },
    { id: 'Nginx', name: 'Nginx', isBuiltIn: false, load: () => loadStreamMode('nginx') },
    { id: 'NSIS', name: 'NSIS', isBuiltIn: false, load: () => loadStreamMode('nsis') },
    { id: 'NTriples', name: 'NTriples', isBuiltIn: false, load: () => loadStreamMode('ntriples') },
    { id: 'Octave', name: 'Octave', isBuiltIn: false, load: () => loadStreamMode('octave') },
    { id: 'Oz', name: 'Oz', isBuiltIn: false, load: () => loadStreamMode('oz') },
    { id: 'Pascal', name: 'Pascal', isBuiltIn: false, load: () => loadStreamMode('pascal') },
    { id: 'PEG.js', name: 'PEG.js', isBuiltIn: false, load: () => loadStreamMode('pegjs') },
    { id: 'Perl', name: 'Perl', isBuiltIn: false, load: () => loadStreamMode('perl') },
    { id: 'Pig', name: 'Pig', isBuiltIn: false, load: () => loadStreamMode('pig') },
    { id: 'PowerShell', name: 'PowerShell', isBuiltIn: false, load: () => loadStreamMode('powershell') },
    { id: 'Properties', name: 'Properties', isBuiltIn: false, load: () => loadStreamMode('properties') },
    { id: 'Protobuf', name: 'Protobuf', isBuiltIn: false, load: () => loadStreamMode('protobuf') },
    { id: 'Pug', name: 'Pug', isBuiltIn: false, load: () => loadStreamMode('pug') },
    { id: 'Puppet', name: 'Puppet', isBuiltIn: false, load: () => loadStreamMode('puppet') },
    { id: 'Q', name: 'Q', isBuiltIn: false, load: () => loadStreamMode('q') },
    { id: 'R', name: 'R', isBuiltIn: false, load: () => loadStreamMode('r') },
    { id: 'RPM', name: 'RPM', isBuiltIn: false, load: () => loadStreamMode('rpm') },
    { id: 'SAS', name: 'SAS', isBuiltIn: false, load: () => loadStreamMode('sas') },
    { id: 'Sass', name: 'Sass', isBuiltIn: false, load: () => loadStreamMode('sass') },
    { id: 'Scala', name: 'Scala', isBuiltIn: false, load: () => loadStreamMode('clike', 'scala') },
    { id: 'Scheme', name: 'Scheme', isBuiltIn: false, load: () => loadStreamMode('scheme') },
    { id: 'Sieve', name: 'Sieve', isBuiltIn: false, load: () => loadStreamMode('sieve') },
    { id: 'Smalltalk', name: 'Smalltalk', isBuiltIn: false, load: () => loadStreamMode('smalltalk') },
    { id: 'Solr', name: 'Solr', isBuiltIn: false, load: () => loadStreamMode('solr') },
    { id: 'SPARQL', name: 'SPARQL', isBuiltIn: false, load: () => loadStreamMode('sparql') },
    { id: 'Spreadsheet', name: 'Spreadsheet', isBuiltIn: false, load: () => loadStreamMode('spreadsheet') },
    { id: 'sTeX', name: 'sTeX', isBuiltIn: false, load: () => loadStreamMode('stex') },
    { id: 'Stylus', name: 'Stylus', isBuiltIn: false, load: () => loadStreamMode('stylus') },
    { id: 'Tcl', name: 'Tcl', isBuiltIn: false, load: () => loadStreamMode('tcl') },
    { id: 'Textile', name: 'Textile', isBuiltIn: false, load: () => loadStreamMode('textile') },
    { id: 'TiddlyWiki', name: 'TiddlyWiki', isBuiltIn: false, load: () => loadStreamMode('tiddlywiki') },
    { id: 'Tiki', name: 'Tiki', isBuiltIn: false, load: () => loadStreamMode('tiki') },
    { id: 'TOML', name: 'TOML', isBuiltIn: false, load: () => loadStreamMode('toml') },
    { id: 'troff', name: 'troff', isBuiltIn: false, load: () => loadStreamMode('troff') },
    { id: 'TTCN', name: 'TTCN', isBuiltIn: false, load: () => loadStreamMode('ttcn') },
    { id: 'TTCN_CFG', name: 'TTCN_CFG', isBuiltIn: false, load: () => loadStreamMode('ttcn-cfg') },
    { id: 'Turtle', name: 'Turtle', isBuiltIn: false, load: () => loadStreamMode('turtle') },
    { id: 'VB.NET', name: 'VB.NET', isBuiltIn: false, load: () => loadStreamMode('vb') },
    { id: 'VBScript', name: 'VBScript', isBuiltIn: false, load: () => loadStreamMode('vbscript') },
    { id: 'Velocity', name: 'Velocity', isBuiltIn: false, load: () => loadStreamMode('velocity') },
    { id: 'Verilog', name: 'Verilog', isBuiltIn: false, load: () => loadStreamMode('verilog') },
    { id: 'VHDL', name: 'VHDL', isBuiltIn: false, load: () => loadStreamMode('vhdl') },
    { id: 'WebAssembly', name: 'WebAssembly', isBuiltIn: false, load: () => loadStreamMode('wast') },
    { id: 'WebIDL', name: 'WebIDL', isBuiltIn: false, load: () => loadStreamMode('webidl') },
    { id: 'XQuery', name: 'XQuery', isBuiltIn: false, load: () => loadStreamMode('xquery') },
    { id: 'Yacas', name: 'Yacas', isBuiltIn: false, load: () => loadStreamMode('yacas') },
    { id: 'Z80', name: 'Z80', isBuiltIn: false, load: () => loadStreamMode('z80') },
];

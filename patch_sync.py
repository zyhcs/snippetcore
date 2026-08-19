import re

with open('src/sync.ts', 'r') as f:
    content = f.read()

old_loop = """    for (const node of snippetNodes) {
        if (node.path === 'snippets/meta.json') continue;
        try {
            const snipRes = await fetch(`https://api.github.com/repos/${owner}/${actualRepo}/git/blobs/${node.sha}`, {
                headers: { 
                    'Authorization': `token ${t}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            if (!snipRes.ok) continue;
            const snipData = await snipRes.json();
            const snipContent = decodeURIComponent(escape(atob(snipData.content.replace(/\\n/g, ''))));
            
            // Reconstruct Snippet object from filename and content
            // filename format: snippets/Title-id.ext
            const filename = node.path.split('/').pop();
            const lastDot = filename.lastIndexOf('.');
            
            if (lastDot < 37) continue; // Invalid format, cannot contain 36 char UUID
            
            const id = filename.substring(lastDot - 36, lastDot);
            const title = filename.substring(0, lastDot - 37); // -37 to remove the '-'
            const ext = filename.substring(lastDot + 1);
            
            // Reverse mapping for language (best effort, or fallback to text)
            let language = 'Text';
            const langMap: Record<string, string> = { 'abap': 'ABAP', 'cs': 'C#', 'cpp': 'C++', 'css': 'CSS', 'dart': 'Dart', 'go': 'Go', 'html': 'HTML', 'java': 'Java', 'js': 'JavaScript', 'json': 'JSON', 'kt': 'Kotlin', 'md': 'Markdown', 'm': 'Objective-C', 'php': 'PHP', 'py': 'Python', 'rb': 'Ruby', 'rs': 'Rust', 'sh': 'Shell', 'sql': 'SQL', 'swift': 'Swift', 'txt': 'Text', 'ts': 'TypeScript', 'vue': 'Vue', 'xml': 'XML', 'yml': 'YAML', 'svg': 'SVG', 'mermaid': 'Mermaid', 'echarts': 'ECharts' };
            if (langMap[ext]) language = langMap[ext];
            
            const meta = metaMap[id] || {};
            snippets.push({
                id: id,
                title: decodeURIComponent(title),
                code_content: snipContent,
                language: language,
                tags: meta.tags || '',
                is_favorite: meta.is_favorite || 0,
                created_at: meta.created_at || new Date().toISOString(),
                updated_at: meta.updated_at || new Date().toISOString()
            });
        } catch(e) {
            console.error("Failed to parse snippet", node.path, e);
        }
    }"""

new_loop = """    const targetNodes = snippetNodes.filter((n: any) => n.path !== 'snippets/meta.json');
    const CHUNK_SIZE = 10;
    for (let i = 0; i < targetNodes.length; i += CHUNK_SIZE) {
        const chunk = targetNodes.slice(i, i + CHUNK_SIZE);
        await Promise.all(chunk.map(async (node: any) => {
            try {
                const snipRes = await fetch(`https://api.github.com/repos/${owner}/${actualRepo}/git/blobs/${node.sha}`, {
                    headers: { 
                        'Authorization': `token ${t}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                });
                if (!snipRes.ok) return;
                const snipData = await snipRes.json();
                const snipContent = decodeURIComponent(escape(atob(snipData.content.replace(/\\n/g, ''))));
                
                const filename = node.path.split('/').pop();
                const lastDot = filename.lastIndexOf('.');
                if (lastDot < 37) return;
                
                const id = filename.substring(lastDot - 36, lastDot);
                const title = filename.substring(0, lastDot - 37);
                const ext = filename.substring(lastDot + 1);
                
                let language = 'Text';
                const langMap: Record<string, string> = { 'abap': 'ABAP', 'cs': 'C#', 'cpp': 'C++', 'css': 'CSS', 'dart': 'Dart', 'go': 'Go', 'html': 'HTML', 'java': 'Java', 'js': 'JavaScript', 'json': 'JSON', 'kt': 'Kotlin', 'md': 'Markdown', 'm': 'Objective-C', 'php': 'PHP', 'py': 'Python', 'rb': 'Ruby', 'rs': 'Rust', 'sh': 'Shell', 'sql': 'SQL', 'swift': 'Swift', 'txt': 'Text', 'ts': 'TypeScript', 'vue': 'Vue', 'xml': 'XML', 'yml': 'YAML', 'svg': 'SVG', 'mermaid': 'Mermaid', 'echarts': 'ECharts' };
                if (langMap[ext]) language = langMap[ext];
                
                const meta = metaMap[id] || {};
                snippets.push({
                    id: id,
                    title: decodeURIComponent(title),
                    code_content: snipContent,
                    language: language,
                    tags: meta.tags || '',
                    is_favorite: meta.is_favorite || 0,
                    created_at: meta.created_at || new Date().toISOString(),
                    updated_at: meta.updated_at || new Date().toISOString()
                });
            } catch(e) {
                console.error("Failed to parse snippet", node.path, e);
            }
        }));
    }"""

if old_loop in content:
    content = content.replace(old_loop, new_loop)
else:
    print("Could not find old loop")

with open('src/sync.ts', 'w') as f:
    f.write(content)



const getExt = (lang: string) => {
    const l = lang.toLowerCase();
    const map: Record<string, string> = {
        'javascript': 'js', 'typescript': 'ts', 'python': 'py', 'ruby': 'rb',
        'c++': 'cpp', 'c#': 'cs', 'go': 'go', 'rust': 'rs', 'html': 'html',
        'css': 'css', 'json': 'json', 'markdown': 'md', 'abap': 'abap',
        'dart': 'dart', 'java': 'java', 'kotlin': 'kt', 'swift': 'swift',
        'sql': 'sql', 'php': 'php', 'xml': 'xml', 'yaml': 'yaml',
        'shell': 'sh', 'objective-c': 'm', 'text': 'txt', 'vue': 'vue'
    };
    return map[l] || 'txt';
};

const sanitize = (name: string) => name.replace(/[\\/:*?"<>|]/g, '_').replace(/\s+/g, '_');

// Initialize repo if not exists
async function initSyncRepo(token: string, repoName: string, owner: string) {
    const t = token.trim();
    const res = await fetch(`https://api.github.com/repos/${owner}/${repoName}`, {
        headers: { 
            'Authorization': `token ${t}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    });
    
    if (res.status === 404) {
        // Create repo
        const createRes = await fetch(`https://api.github.com/user/repos`, {
            method: 'POST',
            headers: {
                'Authorization': `token ${t}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: repoName,
                private: true,
                auto_init: true,
                description: 'SnippetCore Cloud Sync Repository'
            })
        });
        if (!createRes.ok) throw new Error("Failed to create repository");
        // Wait a bit for repo initialization
        await new Promise(r => setTimeout(r, 2000));
        return 'main';
    } else if (!res.ok) {
        throw new Error(`Failed to check repository: ${res.statusText}`);
    }
    
    const data = await res.json();
    return data.default_branch;
}

export async function syncToRepo(token: string, repoName: string | null, content: string): Promise<string> {
    const t = token.trim();
    const actualRepo = repoName || 'snippetcore-sync';
    
    const userRes = await fetch('https://api.github.com/user', {
        headers: { 
            'Authorization': `token ${t}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    });
    if (!userRes.ok) throw new Error("Invalid GitHub Token");
    const user = await userRes.json();
    const owner = user.login;

    const defaultBranch = await initSyncRepo(t, actualRepo, owner);

    // Get latest commit
    const refRes = await fetch(`https://api.github.com/repos/${owner}/${actualRepo}/git/refs/heads/${defaultBranch}`, {
        headers: { 
            'Authorization': `token ${t}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    });
    let baseCommitSha = '';
    if (refRes.ok) {
        baseCommitSha = (await refRes.json()).object.sha;
    }

    // 1. Prepare tree items
    const tree: any[] = [];
    
    // We expect `content` to be the monolithic JSON containing settings and snippets (from exportData)
    // We will extract ONLY the settings for snippetconfig.json
    let parsedContent;
    try {
        parsedContent = JSON.parse(content);
    } catch(e) {
        throw new Error("Invalid sync payload");
    }

    const pureSettings = parsedContent.settings || parsedContent;

    // Settings file (PURE)
    tree.push({
        path: 'snippetconfig.json',
        mode: '100644',
        type: 'blob',
        content: JSON.stringify(pureSettings, null, 2)
    });

    // Metadata map
    const metadataMap: Record<string, any> = {};

    // Snippets (INDIVIDUAL)
    const snippets = parsedContent.snippets || [];
    for (const s of snippets) {
        const ext = getExt(s.language);
        const filename = `snippets/${sanitize(s.title)}-${s.id}.${ext}`;
        tree.push({
            path: filename,
            mode: '100644',
            type: 'blob',
            content: s.code_content || '\n'
        });
        
        metadataMap[s.id] = {
            tags: s.tags,
            is_favorite: s.is_favorite,
            created_at: s.created_at,
            updated_at: s.updated_at
        };
    }
    
    // Add metadata file
    tree.push({
        path: 'snippets/meta.json',
        mode: '100644',
        type: 'blob',
        content: JSON.stringify(metadataMap, null, 2)
    });

    // Create Tree (Since we don't provide base_tree, it effectively replaces everything in the root)
    const treeRes = await fetch(`https://api.github.com/repos/${owner}/${actualRepo}/git/trees`, {
        method: 'POST',
        headers: {
            'Authorization': `token ${t}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tree })
    });
    if (!treeRes.ok) throw new Error("Failed to create git tree");
    const newTreeSha = (await treeRes.json()).sha;

    // Create Commit
    const commitBody: any = {
        message: `Sync from SnippetCore at ${new Date().toISOString()}`,
        tree: newTreeSha
    };
    if (baseCommitSha) commitBody.parents = [baseCommitSha];
    
    const commitRes = await fetch(`https://api.github.com/repos/${owner}/${actualRepo}/git/commits`, {
        method: 'POST',
        headers: {
            'Authorization': `token ${t}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(commitBody)
    });
    if (!commitRes.ok) throw new Error("Failed to create commit");
    const newCommitSha = (await commitRes.json()).sha;

    // Update Ref
    const patchRefRes = await fetch(`https://api.github.com/repos/${owner}/${actualRepo}/git/refs/heads/${defaultBranch}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `token ${t}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sha: newCommitSha, force: true })
    });
    
    if (!patchRefRes.ok) {
        // If the branch doesn't exist (e.g. empty repo), we need to POST to create it
        const postRefRes = await fetch(`https://api.github.com/repos/${owner}/${actualRepo}/git/refs`, {
            method: 'POST',
            headers: {
                'Authorization': `token ${t}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ref: `refs/heads/${defaultBranch}`, sha: newCommitSha })
        });
        if (!postRefRes.ok) throw new Error("Failed to update branch ref");
    }

    return actualRepo;
}

export async function pullFromRepo(token: string, repoName: string): Promise<string> {
    const t = token.trim();
    const userRes = await fetch('https://api.github.com/user', {
        headers: { 
            'Authorization': `token ${t}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    });
    if (!userRes.ok) throw new Error("Invalid GitHub Token");
    const owner = (await userRes.json()).login;
    const actualRepo = repoName || 'snippetcore-sync';

    // 1. Get the default branch (usually main or master)
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${actualRepo}`, {
        headers: { 
            'Authorization': `token ${t}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    });
    if (!repoRes.ok) {
        if (repoRes.status === 404) throw new Error("Repository not found. Push first to initialize.");
        throw new Error("Failed to access repository");
    }
    const defaultBranch = (await repoRes.json()).default_branch || 'main';

    // 2. Get the tree for the default branch
    const treeRes = await fetch(`https://api.github.com/repos/${owner}/${actualRepo}/git/trees/${defaultBranch}?recursive=1`, {
        headers: { 
            'Authorization': `token ${t}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    });
    if (!treeRes.ok) {
        throw new Error("Failed to read repository tree. Repository might be empty.");
    }
    const tree = (await treeRes.json()).tree;
    
    const syncFileNode = tree.find((node: any) => node.path === 'snippetconfig.json' || node.path === 'snippetcore-sync.json');
    if (!syncFileNode) {
        throw new Error("Config file not found in repository.");
    }

    // 3. Get the settings blob
    const blobRes = await fetch(`https://api.github.com/repos/${owner}/${actualRepo}/git/blobs/${syncFileNode.sha}`, {
        headers: { 
            'Authorization': `token ${t}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    });
    if (!blobRes.ok) throw new Error("Failed to download config data");
    const blobData = await blobRes.json();
    const settingsContent = decodeURIComponent(escape(atob(blobData.content.replace(/\n/g, ''))));
    
    let parsedSettings: any = {};
    try {
        parsedSettings = JSON.parse(settingsContent);
    } catch(e) {}
    
    // Check if it's the old monolithic format
    if (parsedSettings.version === 2 && Array.isArray(parsedSettings.snippets)) {
        return settingsContent; // Already monolithic
    }

    // 4. Fetch all snippets from snippets/ folder
    const snippetNodes = tree.filter((node: any) => node.path.startsWith('snippets/') && node.type === 'blob');
    const snippets: any[] = [];
    
    // Check if meta.json exists
    let metaMap: Record<string, any> = {};
    const metaNode = snippetNodes.find((n: any) => n.path === 'snippets/meta.json');
    if (metaNode) {
        try {
            const metaRes = await fetch(`https://api.github.com/repos/${owner}/${actualRepo}/git/blobs/${metaNode.sha}`, {
                headers: { 
                    'Authorization': `token ${t}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            if (metaRes.ok) {
                const metaData = await metaRes.json();
                const metaContent = decodeURIComponent(escape(atob(metaData.content.replace(/\n/g, ''))));
                metaMap = JSON.parse(metaContent);
            }
        } catch(e) {
            console.warn("Failed to load meta.json", e);
        }
    }
    
    const targetNodes = snippetNodes.filter((n: any) => n.path !== 'snippets/meta.json');
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
                const snipContent = decodeURIComponent(escape(atob(snipData.content.replace(/\n/g, ''))));
                
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
    }
    
    // Combine them for importData
    const result = {
        version: 2,
        settings: parsedSettings,
        snippets: snippets
    };
    
    return JSON.stringify(result);
}
